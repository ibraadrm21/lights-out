import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProductCard from '../components/products/ProductCard';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { products, addToCart } = useStore();

  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === category?.toLowerCase()
  );

  const descriptions: Record<string, string> = {
    'TOPS': 'CORE PIECES DESIGNED FOR EVERYDAY UTILITY AND RAW AESTHETIC. HIGH-QUALITY FABRICS MEETS BRUTALIST DESIGN PRINCIPLES.',
    'BOTTOMS': 'ENGINEERED SILHOUETTES CRAFTED FROM PREMIUM TECHNICAL TEXTILES. BUILT FOR MOVEMENT AND ARCHIVAL DURABILITY.',
    'OUTERWEAR': 'PROTECTIVE PIECES BUILT FOR THE URBAN ENVIRONMENT. WATER-RESISTANT MATERIALS AND ADAPTIVE ARCHITECTURAL LAYERS.',
    'ACCESSORIES': 'ESSENTIAL COMPLEMENTS TO FINISH THE UNDERGROUND UNIFORM. FUNCTIONAL DESIGN ELEMENTS FOR THE MODERN ARCHIVE.',
    'FOOTWEAR': 'HEAVY-DUTY FOOTWEAR DESIGNED FOR MOVEMENT. REINFORCED STRUCTURES WITH AN EMPHASIS ON BRUTALIST GEOMETRY.'
  };

  const currentDescription = category ? descriptions[category.toUpperCase()] : '';
  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  return (
    <main className="bg-black min-h-screen pt-32 px-6">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase mb-2 block">Collection</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-syne uppercase tracking-tighter italic">
            {category}
          </h1>
          {currentDescription && (
            <p className="mt-4 text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/40 max-w-xl leading-relaxed uppercase">
              {currentDescription}
            </p>
          )}

          {/* Mobile Category Slider */}
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:hidden no-scrollbar">
            {categories.map((cat) => {
              const isActive = cat.toLowerCase() === category?.toLowerCase();
              return (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  className={`flex-shrink-0 px-6 py-3.5 text-[8px] font-bold font-mono tracking-[0.2em] uppercase transition-all duration-300 ${
                    isActive 
                      ? 'bg-white text-black' 
                      : 'bg-white/5 text-white/60 border border-white/5 hover:text-white'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-white/40 text-sm font-bold tracking-widest">NO PRODUCTS FOUND IN THIS CATEGORY.</p>
          </div>
        )}
      </div>

      <footer className="py-20 mt-20 border-t border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-black font-syne italic">LIGHTS<span className="text-[#e10600]">OUT</span></div>
          <div className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
            © 2026 LIGHTS OUT ARCHIVE.
          </div>
        </div>
      </footer>
    </main>
  );
};

export default CategoryPage;
