import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';

interface ProductDetailProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = React.useState('M');

  React.useEffect(() => {
    if (product) {
      const sizes = product.sizes && product.sizes.length > 0
        ? product.sizes
        : (product.category === 'FOOTWEAR' ? ['40', '41', '42', '43', '44'] : ['S', 'M', 'L', 'XL']);
      setSelectedSize(sizes[0] || 'M');
    }
  }, [product]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:m-auto w-auto md:w-full md:max-w-4xl h-fit max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 z-[110] flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 aspect-[3/4] bg-muted relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Details Section */}
            <div className="w-full md:w-1/2 p-6 sm:p-12 flex flex-col justify-center">
              <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase mb-4 block">
                {product.category} / Spring Archive
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-syne mb-4 sm:mb-6 tracking-tighter">{product.name}</h2>
              <p className="text-xs sm:text-sm text-white/60 mb-6 sm:mb-8 leading-relaxed tracking-wide">
                {product.description || "Experimental piece designed for urban exploration. Constructed from high-density technical fabrics with a focus on silhouette and functionality. Part of the BACKDOOR permanent archive."}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-6 sm:gap-0">
                <div className="text-2xl font-syne font-black">${product.price.toFixed(2)}</div>
                <div className="flex gap-2 flex-wrap">
                  {(product.sizes && product.sizes.length > 0
                    ? product.sizes
                    : (product.category === 'FOOTWEAR'
                      ? ['40', '41', '42', '43', '44']
                      : ['S', 'M', 'L', 'XL'])
                  ).map((size: string) => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 border flex items-center justify-center text-[10px] font-bold transition-all ${
                        selectedSize === size ? 'bg-white text-black border-white' : 'border-white/10 text-white hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { onAdd(); onClose(); }}
                className="w-full flex items-center justify-center space-x-4 bg-white text-black py-5 font-bold text-xs tracking-widest uppercase hover:bg-white/90 transition-all"
              >
                <ShoppingBag size={18} />
                <span>Move to Archive</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetail;
