import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock?: number;
  stock_2?: number;
  has_variants?: boolean;
  variants?: Array<{ color: string, images: string[], stock: number }>;
  onAdd?: () => void;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, category, stock, stock_2, has_variants, variants, onAdd, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/product/${id}`);
    }
  };

  const isOutOfStock = has_variants
    ? (variants && variants.length > 0 ? variants.every(v => v.stock === 0) : (stock === 0 && stock_2 === 0))
    : stock === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] border border-white/5 mb-4">
        <img 
          src={image} 
          alt={name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
              className="bg-white text-black p-4 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover:bg-white/90 shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-black/80 backdrop-blur-md text-white text-[8px] font-bold tracking-widest px-2.5 py-1.5 uppercase border border-white/10">
            {category}
          </span>
          {isOutOfStock && (
            <span className="bg-red-600/90 backdrop-blur-md text-white text-[8px] font-bold tracking-widest px-2.5 py-1.5 uppercase border border-red-500/20">
              OUT OF STOCK
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-white/90 mb-1 group-hover:text-white transition-colors">
            {name}
          </h3>
          <p className="text-[10px] text-white/40 tracking-widest uppercase">Essential Piece</p>
        </div>
        <span className="text-xs font-syne font-bold">${price.toFixed(2)}</span>
      </div>
    </motion.div>
  );
};

export default ProductCard;
