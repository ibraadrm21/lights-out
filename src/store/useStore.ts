import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, supabaseAdmin, getProducts, addProduct as spAddProduct, uploadImage as spUploadImage } from '../lib/supabase';

interface ProductVariant {
  color: string;
  images: string[];
  stock: number;
  sizes?: string[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  stock?: number;
  stock_2?: number;
  has_variants?: boolean;
  variant_color_1?: string;
  variant_color_2?: string;
  images2?: string[];
  variants?: ProductVariant[];
  sizes?: string[];
}

interface CartItem extends Product {
  quantity: number;
  size: string;
  color?: string;
}

export interface Review {
  id: string;
  product_id: number;
  user_id: string;
  user_email: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  reply?: string;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'received' | 'returned' | 'cancelled' | 'delayed';
  createdAt: string;
  shippingAddress?: any;
  customerEmail?: string;
}

interface StoreState {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  users: { id: string, username: string, email: string }[];
  isLoading: boolean;

  currentUser: any | null;
  setCurrentUser: (user: any | null) => Promise<void>;
  // Actions
  fetchProducts: () => Promise<void>;
  subscribeToProducts: () => () => void;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  fetchOrders: () => Promise<void>;
  subscribeToOrders: () => () => void;
  fetchUsers: () => Promise<void>;
  subscribeToUsers: () => () => void;

  reviews: Review[];
  fetchReviews: (productId: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;

  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (id: string, size: string, color?: string) => void;
  clearCart: () => void;

  coins: number;
  addCoins: (amount: number) => void;

  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      orders: [],
      users: [],
      reviews: [],
      currentUser: null,
      isLoading: false,
      coins: 1250,

      addCoins: (amount: number) => {
        set((state) => ({ coins: Math.max(0, state.coins + amount) }));
      },

      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          const data = await getProducts();
          if (data && data.length > 0) {
            set({ products: data, isLoading: false });
          } else {
            set({ products: [], isLoading: false });
          }
        } catch (error) {
          console.error('Failed to fetch products:', error);
          set({ products: [], isLoading: false });
        }
      },

      subscribeToProducts: () => {
        return () => {};
      },


      addProduct: async (product) => {
        try {
          const newProduct = await spAddProduct(product);
          set((state) => ({ products: [...state.products, newProduct] }));
        } catch (error) {
          console.error('Failed to add product:', error);
          throw error;
        }
      },

      updateProduct: async (updatedProduct) => {
        try {
          const { error } = await supabaseAdmin
            .from('products')
            .update(updatedProduct)
            .eq('id', updatedProduct.id);
          
          if (error) throw error;
          
          set((state) => ({
            products: state.products.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
          }));
        } catch (error) {
          console.error('Failed to update product:', error);
          throw error;
        }
      },

      deleteProduct: async (id) => {
        try {
          const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            products: state.products.filter((p) => p.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete product:', error);
          throw error;
        }
      },

      fetchOrders: async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const mappedOrders = data.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            items: o.items,
            total: o.total,
            status: o.status,
            createdAt: o.created_at,
            shippingAddress: o.shipping_address,
            customerEmail: o.customer_email
          }));
          
          set({ orders: mappedOrders });
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        }
      },

      subscribeToOrders: () => {
        return () => {};
      },

      fetchUsers: async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*');
          
          if (error) throw error;
          
          set({ users: data.map((u: any) => ({ id: u.id, username: u.email.split('@')[0], email: u.email })) });
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      },

      subscribeToUsers: () => {
        return () => {};
      },

      setCurrentUser: async (user) => {
        set({ currentUser: user });
        if (user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('cart')
              .eq('id', user.id)
              .single();
            
            if (error) throw error;
            if (data?.cart) {
              set({ cart: data.cart });
            }
          } catch (error) {
            console.error('Failed to fetch user cart:', error);
          }
        }
      },

      addToCart: (product, size = 'M', color) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id && item.size === size && item.color === color);
        let newCart;
        if (existing) {
          newCart = state.cart.map((item) =>
            (item.id === product.id && item.size === size && item.color === color) ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          newCart = [...state.cart, { ...product, quantity: 1, size, color }];
        }

        // Sync with Supabase if logged in
        if (state.currentUser) {
          supabase.from('profiles').update({ cart: newCart }).eq('id', state.currentUser.id).then();
        }

        return { cart: newCart };
      }),

      removeFromCart: (id, size, color) => set((state) => {
        const newCart = state.cart.filter((item) => !(item.id === id && item.size === size && item.color === color));
        
        // Sync with Supabase if logged in
        if (state.currentUser) {
          supabase.from('profiles').update({ cart: newCart }).eq('id', state.currentUser.id).then();
        }

        return { cart: newCart };
      }),

      clearCart: () => set((state) => {
        // Sync with Supabase if logged in
        if (state.currentUser) {
          supabase.from('profiles').update({ cart: [] }).eq('id', state.currentUser.id).then();
        }
        return { cart: [] };
      }),

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

      updateOrderStatus: async (id, status) => {
        try {
          const { data: currentOrder, error: fetchErr } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchErr) throw fetchErr;
          const oldStatus = currentOrder?.status;

          const { error } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', id);

          if (error) throw error;

          // Dispatch email alert asynchronously
          supabaseAdmin.functions.invoke('send-order-email', { body: { orderId: id, status } }).catch((err: any) => {
            console.error('Failed to trigger order email alert:', err);
          });

          if (oldStatus === 'processing' && status === 'confirmed') {
            for (const item of (currentOrder.items || [])) {
              const { data: prod } = await supabaseAdmin
                .from('products')
                .select('*')
                .eq('id', item.id)
                .single();
              if (prod) {
                let updatedFields: any = {};
                if (prod.has_variants) {
                  if (prod.variants && prod.variants.length > 0) {
                    updatedFields.variants = prod.variants.map((v: any) => {
                      if (item.color && v.color.toLowerCase() === item.color.toLowerCase()) {
                        return { ...v, stock: Math.max(0, (v.stock ?? 0) - item.quantity) };
                      }
                      return v;
                    });
                  } else {
                    if (item.color && prod.variant_color_1 && prod.variant_color_1.toLowerCase() === item.color.toLowerCase()) {
                      updatedFields.stock = Math.max(0, (prod.stock ?? 0) - item.quantity);
                    } else if (item.color && prod.variant_color_2 && prod.variant_color_2.toLowerCase() === item.color.toLowerCase()) {
                      updatedFields.stock_2 = Math.max(0, (prod.stock_2 ?? 0) - item.quantity);
                    }
                  }
                } else {
                  updatedFields.stock = Math.max(0, (prod.stock ?? 0) - item.quantity);
                }
                await supabaseAdmin.from('products').update(updatedFields).eq('id', item.id);
              }
            }
          } else if ((oldStatus === 'confirmed' || oldStatus === 'delayed' || oldStatus === 'shipped') && status === 'cancelled') {
            for (const item of (currentOrder.items || [])) {
              const { data: prod } = await supabaseAdmin
                .from('products')
                .select('*')
                .eq('id', item.id)
                .single();
              if (prod) {
                let updatedFields: any = {};
                if (prod.has_variants) {
                  if (prod.variants && prod.variants.length > 0) {
                    updatedFields.variants = prod.variants.map((v: any) => {
                      if (item.color && v.color.toLowerCase() === item.color.toLowerCase()) {
                        return { ...v, stock: (v.stock ?? 0) + item.quantity };
                      }
                      return v;
                    });
                  } else {
                    if (item.color && prod.variant_color_1 && prod.variant_color_1.toLowerCase() === item.color.toLowerCase()) {
                      updatedFields.stock = (prod.stock ?? 0) + item.quantity;
                    } else if (item.color && prod.variant_color_2 && prod.variant_color_2.toLowerCase() === item.color.toLowerCase()) {
                      updatedFields.stock_2 = (prod.stock_2 ?? 0) + item.quantity;
                    }
                  }
                } else {
                  updatedFields.stock = (prod.stock ?? 0) + item.quantity;
                }
                await supabaseAdmin.from('products').update(updatedFields).eq('id', item.id);
              }
            }
          }

          // Update local products state as well
          let updatedProductsState = [...get().products];
          if (oldStatus === 'processing' && status === 'confirmed') {
            for (const item of (currentOrder.items || [])) {
              updatedProductsState = updatedProductsState.map((p) => {
                if (String(p.id) === String(item.id)) {
                  let updatedP = { ...p };
                  if (p.has_variants) {
                    if (p.variants && p.variants.length > 0) {
                      updatedP.variants = p.variants.map((v: any) => {
                        if (item.color && v.color.toLowerCase() === item.color.toLowerCase()) {
                          return { ...v, stock: Math.max(0, (v.stock ?? 0) - item.quantity) };
                        }
                        return v;
                      });
                    } else {
                      if (item.color && p.variant_color_1 && p.variant_color_1.toLowerCase() === item.color.toLowerCase()) {
                        updatedP.stock = Math.max(0, (p.stock ?? 0) - item.quantity);
                      } else if (item.color && p.variant_color_2 && p.variant_color_2.toLowerCase() === item.color.toLowerCase()) {
                        updatedP.stock_2 = Math.max(0, (p.stock_2 ?? 0) - item.quantity);
                      }
                    }
                  } else {
                    updatedP.stock = Math.max(0, (p.stock ?? 0) - item.quantity);
                  }
                  return updatedP;
                }
                return p;
              });
            }
          } else if ((oldStatus === 'confirmed' || oldStatus === 'delayed' || oldStatus === 'shipped') && status === 'cancelled') {
            for (const item of (currentOrder.items || [])) {
              updatedProductsState = updatedProductsState.map((p) => {
                if (String(p.id) === String(item.id)) {
                  let updatedP = { ...p };
                  if (p.has_variants) {
                    if (p.variants && p.variants.length > 0) {
                      updatedP.variants = p.variants.map((v: any) => {
                        if (item.color && v.color.toLowerCase() === item.color.toLowerCase()) {
                          return { ...v, stock: (v.stock ?? 0) + item.quantity };
                        }
                        return v;
                      });
                    } else {
                      if (item.color && p.variant_color_1 && p.variant_color_1.toLowerCase() === item.color.toLowerCase()) {
                        updatedP.stock = (p.stock ?? 0) + item.quantity;
                      } else if (item.color && p.variant_color_2 && p.variant_color_2.toLowerCase() === item.color.toLowerCase()) {
                        updatedP.stock_2 = (p.stock_2 ?? 0) + item.quantity;
                      }
                    }
                  } else {
                    updatedP.stock = (p.stock ?? 0) + item.quantity;
                  }
                  return updatedP;
                }
                return p;
              });
            }
          }

          set((state) => ({
            orders: state.orders.map((o) => o.id === id ? { ...o, status } : o),
            products: updatedProductsState
          }));
        } catch (error) {
          console.error('Failed to update order status:', error);
          throw error;
        }
      },
      uploadImage: async (file: File) => {
        return await spUploadImage(file);
      },
      fetchReviews: async (productId) => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ reviews: data || [] });
        } catch (error) {
          console.error('Failed to fetch reviews:', error);
        }
      },
      addReview: async (review) => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .insert([review])
            .select();

          if (error) throw error;
          if (data) {
            set((state) => ({ reviews: [data[0], ...state.reviews] }));
          }
        } catch (error) {
          console.error('Failed to add review:', error);
          throw error;
        }
      },
      deleteReview: async (reviewId) => {
        try {
          const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);
          if (error) throw error;
          set((state) => ({ reviews: state.reviews.filter((r) => r.id !== reviewId) }));
        } catch (error) {
          console.error('Failed to delete review:', error);
          throw error;
        }
      },
    }),
    {
      name: 'backdoor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
