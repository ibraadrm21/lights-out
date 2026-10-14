import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { useToast } from '../store/useToast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => stripePromise;

export const createCheckoutSession = async (items: any[], shippingAddress: any, email?: string) => {
  const { addToast } = useToast.getState();
  const orderId = `BACKDOOR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  try {
    // 1. Save the order as 'processing' in Supabase first
    const { data: { session } } = await supabase.auth.getSession();
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Structure items properly with their size attribute
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || 'M',
      category: item.category
    }));

    const { error: dbError } = await supabase
      .from('orders')
      .insert([
        { 
          id: orderId, 
          user_id: session?.user?.id,
          items: orderItems, 
          total, 
          status: 'processing',
          customer_email: email || session?.user?.email || 'pending@payment.com',
          shipping_address: shippingAddress
        }
      ]);

    if (dbError) throw dbError;

    // Check if the current user is an admin
    let isAdmin = false;
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (profile?.role === 'admin') {
        isAdmin = true;
      }
    }

    // 2. Call the Supabase Edge Function to create the checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        items: orderItems,
        order_id: orderId,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/checkout`,
        is_admin: isAdmin
      }
    });

    if (error) throw error;

    // 3. Redirect to Stripe Checkout
    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    addToast('FAILED TO INITIATE CHECKOUT. PLEASE TRY AGAIN.', 'error');
  }
};
