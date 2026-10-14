/**
 * LOCAL-ONLY CLIENT (NO SUPABASE NETWORK CONNECTION)
 * Provides 100% offline, zero-network fallback for any existing calls,
 * eliminating all external Supabase connections, keys and timeouts.
 */

// Helper for local table storage
const getLocalStorageTable = (table: string): any[] => {
  try {
    const raw = localStorage.getItem(`local_db_${table}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  if (table === 'products') return [];
  if (table === 'orders') return [];
  if (table === 'reviews') return [];
  if (table === 'profiles') {
    return [
      {
        id: 'pilot_01',
        email: 'driver@lightsout.f1',
        role: 'admin',
        username: 'PaddockDriver',
        shipping_address: {
          fullName: 'Piloto Oficial Lights Out',
          addressLine1: 'Circuito de Montmeló, Pit Lane 1',
          city: 'Barcelona',
          zipCode: '08160',
          country: 'ES',
          phone: '+34 600 000 000',
        },
      },
    ];
  }
  return [];
};

const saveLocalStorageTable = (table: string, data: any[]) => {
  try {
    localStorage.setItem(`local_db_${table}`, JSON.stringify(data));
  } catch (e) {}
};

class LocalQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField?: string;
  private isAscending = true;
  private isSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_columns = '*') {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => String(item[column]) === String(value));
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderField = column;
    this.isAscending = ascending;
    return this;
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  async insert(records: any[]) {
    const items = getLocalStorageTable(this.tableName);
    const inserted = records.map((rec) => ({
      id: rec.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      ...rec,
    }));
    const updated = [...items, ...inserted];
    saveLocalStorageTable(this.tableName, updated);
    return { data: inserted, error: null };
  }

  async update(fields: any) {
    const items = getLocalStorageTable(this.tableName);
    const updated = items.map((item) => {
      const match = this.filters.every((f) => f(item));
      return match ? { ...item, ...fields } : item;
    });
    saveLocalStorageTable(this.tableName, updated);
    return { data: updated, error: null };
  }

  async delete() {
    const items = getLocalStorageTable(this.tableName);
    const updated = items.filter((item) => !this.filters.every((f) => f(item)));
    saveLocalStorageTable(this.tableName, updated);
    return { data: updated, error: null };
  }

  private async execute() {
    let items = getLocalStorageTable(this.tableName);
    if (this.filters.length > 0) {
      items = items.filter((item) => this.filters.every((f) => f(item)));
    }
    if (this.orderField) {
      items.sort((a, b) => {
        const valA = a[this.orderField!];
        const valB = b[this.orderField!];
        if (valA < valB) return this.isAscending ? -1 : 1;
        if (valA > valB) return this.isAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.isSingle) {
      return { data: items[0] || null, error: items.length === 0 ? { message: 'Not found' } : null };
    }
    return { data: items, error: null };
  }

  then(resolve: any, reject?: any) {
    return this.execute().then(resolve, reject);
  }
}

// Zero-network mock client
export const createMockSupabase = () => {
  return {
    from: (table: string) => new LocalQueryBuilder(table),
    channel: (_name: string) => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: 'pilot_01',
              email: 'driver@lightsout.f1',
              user_metadata: { role: 'admin', full_name: 'Lights Out Pilot' },
            },
          },
        },
        error: null,
      }),
      getUser: async () => ({
        data: {
          user: {
            id: 'pilot_01',
            email: 'driver@lightsout.f1',
          },
        },
        error: null,
      }),
      onAuthStateChange: (callback: any) => {
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'pilot_01',
              email: 'driver@lightsout.f1',
            },
          });
        }, 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
      signInWithPassword: async () => ({
        data: {
          user: { id: 'pilot_01', email: 'driver@lightsout.f1' },
          session: { access_token: 'local_token' },
        },
        error: null,
      }),
      signUp: async () => ({
        data: { user: { id: 'pilot_01', email: 'driver@lightsout.f1' } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
    functions: {
      invoke: async () => ({ data: { success: true }, error: null }),
    },
    storage: {
      from: () => ({
        upload: async (_path: string, _file: any) => ({ data: { path: _path }, error: null }),
        getPublicUrl: (_path: string) => ({
          data: {
            publicUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop',
          },
        }),
      }),
    },
  };
};

export const supabase: any = createMockSupabase();
export const supabaseAdmin: any = createMockSupabase();

export const getProducts = async () => {
  return [];
};

export const addProduct = async (product: any) => {
  const items = getLocalStorageTable('products');
  const created = {
    ...product,
    id: product.id || `f1_${Date.now()}`,
  };
  saveLocalStorageTable('products', [...items, created]);
  return created;
};

export const uploadImage = async (file: File) => {
  try {
    return URL.createObjectURL(file);
  } catch (e) {
    return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop';
  }
};
