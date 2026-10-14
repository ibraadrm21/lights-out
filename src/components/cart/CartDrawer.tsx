import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string, size: string, color?: string) => void;
}

const PRESET_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Grey', value: '#7f8c8d' },
  { name: 'Beige', value: '#d7ccc8' },
  { name: 'Olive Green', value: '#556b2f' },
  { name: 'Crimson Red', value: '#c0392b' },
  { name: 'Navy Blue', value: '#2c3e50' },
  { name: 'Brown', value: '#5d4037' },
  { name: 'Sand', value: '#e1a67a' },
  { name: 'Forest Green', value: '#1b4d3e' },
  { name: 'Khaki', value: '#f0e68c' },
  { name: 'Mustard Yellow', value: '#e1ad01' },
  { name: 'Sky Blue', value: '#87ceeb' },
  { name: 'Royal Blue', value: '#4169e1' },
  { name: 'Burgundy', value: '#800020' },
  { name: 'Plum Purple', value: '#4b0082' },
  { name: 'Orange', value: '#ff6600' },
  { name: 'Cream', value: '#fffdd0' },
  { name: 'Sage Green', value: '#9c9f84' },
];

const getCartItemImage = (item: any) => {
  if (item.has_variants && item.variants && item.variants.length > 0) {
    const variant = item.variants.find((v: any) => v.color === item.color);
    if (variant && variant.images && variant.images.length > 0) {
      return variant.images[0];
    }
  }
  if (item.has_variants && item.color === item.variant_color_2 && item.images2 && item.images2.length > 0) {
    return item.images2[0];
  }
  if (item.has_variants && item.color === item.variant_color_1 && item.images && item.images.length > 0) {
    return item.images[0];
  }
  return item.image;
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove }) => {
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Disable body scroll when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-black border-l border-white/10 z-[70] flex flex-col"
            style={{ backgroundColor: 'black' }}
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-black font-syne tracking-tighter italic">YOUR ARCHIVE</h2>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                  <span className="text-[10px] font-bold tracking-[0.5em] uppercase">Archive is Empty</span>
                  <button onClick={onClose} className="text-white text-[8px] font-bold tracking-widest uppercase border-b border-white/20 pb-1">Start Exploring</button>
                </div>
              ) : (
                items.map((item) => {
                  const colorObj = PRESET_COLORS.find(c => c.value === item.color);
                  return (
                    <div key={`${item.id}-${item.size}-${item.color || ''}`} className="flex gap-4">
                      <div className="w-20 h-24 bg-muted overflow-hidden flex-shrink-0">
                        <img src={getCartItemImage(item)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/90">{item.name}</h3>
                          <button onClick={() => onRemove(item.id, item.size, item.color)} className="text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] text-white/40 tracking-widest uppercase">Size: {item.size}</span>
                          {colorObj && (
                            <>
                              <span className="text-[8px] text-white/20 uppercase font-mono">//</span>
                              <span className="text-[8px] text-white/40 tracking-widest uppercase flex items-center gap-1.5">
                                Color: {colorObj.name}
                                <span className="w-2 h-2 rounded-full border border-white/10" style={{ backgroundColor: colorObj.value }} />
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <span className="text-xs font-syne font-bold">${item.price.toFixed(2)}</span>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-white/40">
                            <span>QTY: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-8 border-t border-white/5 bg-white/5 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Subtotal</span>
                <span className="text-xl font-syne font-black">${total.toFixed(2)}</span>
              </div>
              <button
                disabled={items.length === 0}
                onClick={() => { onClose(); navigate('/checkout'); }}
                className="w-full group relative py-5 bg-white text-black font-bold text-xs tracking-widest uppercase overflow-hidden transition-all hover:pr-10 disabled:opacity-50"
              >
                <span className="relative z-10">Proceed to Checkout</span>
                <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" size={16} />
              </button>
              <p className="text-[8px] text-white/20 text-center tracking-widest uppercase">Shipping and taxes calculated at checkout</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
