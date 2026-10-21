-- ============================================================
-- LIGHTS OUT — Full Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES  (linked to auth.users via trigger)
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  username      text unique,
  display_name  text,
  avatar_url    text,
  favorite_team text,
  role          text not null default 'pilot' check (role in ('pilot', 'admin')),
  pitcoins      integer not null default 0,
  cart          jsonb default '[]'::jsonb,
  shipping_address jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone can read profiles (leaderboard, etc.)
create policy "profiles_select" on public.profiles
  for select using (true);

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using  ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Insert handled by trigger (see below)
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(split_part(new.email, '@', 1), 'pilot_' || left(new.id::text, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
create table if not exists public.products (
  id              text primary key default 'f1_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6),
  name            text not null,
  price           numeric(10,2) not null default 0,
  image           text,
  images          jsonb default '[]'::jsonb,
  category        text not null default 'general',
  description     text,
  stock           integer default 0,
  stock_2         integer default 0,
  has_variants    boolean default false,
  variant_color_1 text,
  variant_color_2 text,
  images2         jsonb default '[]'::jsonb,
  variants        jsonb default '[]'::jsonb,
  sizes           jsonb default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.products enable row level security;

-- Everyone can browse products
create policy "products_select" on public.products
  for select using (true);

-- Only admins can insert / update / delete
create policy "products_insert_admin" on public.products
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

create policy "products_update_admin" on public.products
  for update to authenticated
  using (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

create policy "products_delete_admin" on public.products
  for delete to authenticated
  using (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

-- ============================================================
-- 3. ORDERS
-- ============================================================
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete set null,
  items            jsonb not null default '[]'::jsonb,
  total            numeric(10,2) not null default 0,
  status           text not null default 'processing'
                     check (status in ('processing','confirmed','shipped','delivered','received','returned','cancelled','delayed')),
  shipping_address jsonb,
  customer_email   text,
  created_at       timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Users can see their own orders
create policy "orders_select_own" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Admins can see all orders
create policy "orders_select_admin" on public.orders
  for select to authenticated
  using (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

-- Authenticated users can create orders
create policy "orders_insert_auth" on public.orders
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Admins can update any order (status changes)
create policy "orders_update_admin" on public.orders
  for update to authenticated
  using (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

-- Allow anon select by order id (for /track page)
create policy "orders_select_anon_by_id" on public.orders
  for select to anon
  using (true);

-- ============================================================
-- 4. REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  text not null references public.products(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  images      jsonb default '[]'::jsonb,
  reply       text,
  created_at  timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Everyone can read reviews
create policy "reviews_select" on public.reviews
  for select using (true);

-- Authenticated users can insert reviews
create policy "reviews_insert_auth" on public.reviews
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Users can delete their own reviews
create policy "reviews_delete_own" on public.reviews
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Admins can delete any review
create policy "reviews_delete_admin" on public.reviews
  for delete to authenticated
  using (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

-- ============================================================
-- 5. DAILY GAME ATTEMPTS  (1 row per user × game × date)
-- ============================================================
create table if not exists public.daily_game_attempts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  challenge_date  date not null,
  game_id         text not null check (game_id in ('quiz','driverle','reaction','higher_lower','helmet_guess','circuits')),
  score           integer not null default 0,
  completed       boolean not null default false,
  reward_claimed  boolean not null default false,
  reward_amount   integer not null default 0,
  attempt_payload jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  unique (user_id, challenge_date, game_id)
);

create index if not exists idx_daily_attempts_user_date
  on public.daily_game_attempts (user_id, challenge_date);

alter table public.daily_game_attempts enable row level security;

-- Users can read their own attempts
create policy "daily_attempts_select_own" on public.daily_game_attempts
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Users can insert their own attempts
create policy "daily_attempts_insert_own" on public.daily_game_attempts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- 6. DAILY USER SUMMARIES  (aggregate per user × date for leaderboard)
-- ============================================================
create table if not exists public.daily_user_summaries (
  user_id         uuid not null references auth.users(id) on delete cascade,
  challenge_date  date not null,
  total_score     integer not null default 0,
  games_completed integer not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (user_id, challenge_date)
);

alter table public.daily_user_summaries enable row level security;

-- Everyone can read the leaderboard
create policy "daily_summaries_select" on public.daily_user_summaries
  for select using (true);

-- Only server-side / RPC can write (managed by submit_daily_game_round)
create policy "daily_summaries_insert" on public.daily_user_summaries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "daily_summaries_update" on public.daily_user_summaries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- 7. USER STREAKS
-- ============================================================
create table if not exists public.user_streaks (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  current_streak       integer not null default 0,
  max_streak           integer not null default 0,
  last_completed_date  date,
  total_completed      integer not null default 0,
  updated_at           timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

create policy "streaks_select_own" on public.user_streaks
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "streaks_upsert_own" on public.user_streaks
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "streaks_update_own" on public.user_streaks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- 8. RPC: transact_pitcoins  (called from AuthContext.earnCoins)
-- ============================================================
create or replace function public.transact_pitcoins(
  amount  integer,
  reason  text default 'Reward'
)
returns integer
language plpgsql
security invoker
as $$
declare
  new_balance integer;
begin
  update public.profiles
     set pitcoins   = greatest(0, pitcoins + amount),
         updated_at = now()
   where id = (select auth.uid())
  returning pitcoins into new_balance;

  if new_balance is null then
    raise exception 'Profile not found for current user';
  end if;

  return new_balance;
end;
$$;

-- ============================================================
-- 9. RPC: submit_daily_game_round  (called from dailyService)
-- ============================================================
create or replace function public.submit_daily_game_round(
  p_challenge_date date,
  p_game_id        text,
  p_score          integer,
  p_completed      boolean,
  p_reward_pitcoins integer default 0,
  p_payload        jsonb   default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_uid           uuid := (select auth.uid());
  v_existing      record;
  v_reward_claimed boolean;
begin
  -- 1. Check for existing attempt (idempotent)
  select * into v_existing
    from public.daily_game_attempts
   where user_id = v_uid
     and challenge_date = p_challenge_date
     and game_id = p_game_id;

  if found then
    return jsonb_build_object(
      'score', v_existing.score,
      'reward_claimed', v_existing.reward_claimed,
      'reward_amount', v_existing.reward_amount,
      'already_consumed', true
    );
  end if;

  v_reward_claimed := p_completed and p_reward_pitcoins > 0;

  -- 2. Insert attempt
  insert into public.daily_game_attempts (user_id, challenge_date, game_id, score, completed, reward_claimed, reward_amount, attempt_payload)
  values (v_uid, p_challenge_date, p_game_id, p_score, p_completed, v_reward_claimed, p_reward_pitcoins, p_payload);

  -- 3. Upsert daily summary
  insert into public.daily_user_summaries (user_id, challenge_date, total_score, games_completed, updated_at)
  values (v_uid, p_challenge_date, p_score, case when p_completed then 1 else 0 end, now())
  on conflict (user_id, challenge_date) do update
    set total_score     = daily_user_summaries.total_score + excluded.total_score,
        games_completed = daily_user_summaries.games_completed + excluded.games_completed,
        updated_at      = now();

  -- 4. Award pitcoins
  if v_reward_claimed then
    update public.profiles
       set pitcoins   = pitcoins + p_reward_pitcoins,
           updated_at = now()
     where id = v_uid;
  end if;

  -- 5. Advance streak (if completed)
  if p_completed then
    insert into public.user_streaks (user_id, current_streak, max_streak, last_completed_date, total_completed, updated_at)
    values (v_uid, 1, 1, p_challenge_date, 1, now())
    on conflict (user_id) do update
      set current_streak = case
            when user_streaks.last_completed_date = p_challenge_date then user_streaks.current_streak
            when user_streaks.last_completed_date = p_challenge_date - interval '1 day' then user_streaks.current_streak + 1
            else 1
          end,
          max_streak = greatest(user_streaks.max_streak,
            case
              when user_streaks.last_completed_date = p_challenge_date then user_streaks.current_streak
              when user_streaks.last_completed_date = p_challenge_date - interval '1 day' then user_streaks.current_streak + 1
              else 1
            end),
          last_completed_date = p_challenge_date,
          total_completed = user_streaks.total_completed + case
            when user_streaks.last_completed_date = p_challenge_date then 0 else 1
          end,
          updated_at = now();
  end if;

  return jsonb_build_object(
    'score', p_score,
    'reward_claimed', v_reward_claimed,
    'reward_amount', p_reward_pitcoins,
    'already_consumed', false
  );
end;
$$;

-- ============================================================
-- 10. Storage bucket for product images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_select" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_insert_admin" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

create policy "product_images_update_admin" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );

-- ============================================================
-- 11. Grant access to anon and authenticated roles
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.orders to anon;
grant select, insert on public.orders to authenticated;
grant select on public.reviews to anon, authenticated;
grant select, insert, delete on public.reviews to authenticated;
grant select, insert on public.daily_game_attempts to authenticated;
grant select, insert, update on public.daily_user_summaries to authenticated;
grant select, insert, update on public.user_streaks to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.products to authenticated;
grant update on public.orders to authenticated;

-- Done! 🏁
