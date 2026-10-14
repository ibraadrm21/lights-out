import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Check, ChevronRight, X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useToast } from '../store/useToast';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/products/ProductCard';
import { PageLoader, InlineLoader } from '../components/common/Loader';

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

const AdminReplyForm: React.FC<{ initialText?: string; onSave: (text: string) => void }> = ({ initialText = '', onSave }) => {
  const [text, setText] = useState(initialText);
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-[8px] font-bold tracking-widest uppercase border border-white/10 px-3 py-1.5 hover:bg-white hover:text-black transition-all"
      >
        {initialText ? 'Edit Reply' : 'Reply to Review'}
      </button>
    );
  }

  return (
    <div className="space-y-3 bg-white/[0.02] p-4 border border-white/10 max-w-md">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Write admin response..."
        className="w-full bg-transparent border border-white/10 p-3 text-[10px] text-white focus:outline-none focus:border-white transition-colors"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onSave(text);
            setIsOpen(false);
          }}
          className="bg-white text-black px-3 py-1.5 text-[8px] font-bold tracking-widest uppercase hover:bg-white/90 transition-all"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="border border-white/10 text-white px-3 py-1.5 text-[8px] font-bold tracking-widest uppercase hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const sortSizes = (sizes: string[]) => {
  const standardOrder = ['XS', 'S', 'M', 'L', 'XL'];
  return [...sizes].sort((a, b) => {
    const isNumA = !isNaN(Number(a));
    const isNumB = !isNaN(Number(b));
    if (isNumA && isNumB) {
      return Number(a) - Number(b);
    }
    const idxA = standardOrder.indexOf(a);
    const idxB = standardOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }
    return a.localeCompare(b);
  });
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, fetchProducts, isLoading, reviews, fetchReviews, addReview, currentUser, uploadImage, deleteReview } = useStore();
  const { addToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [currentUser]);

  const handleSaveReply = async (reviewId: string, replyText: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ reply: replyText.trim() || null })
        .eq('id', reviewId);
      
      if (error) throw error;
      
      addToast(replyText.trim() ? 'REPLY SUBMITTED' : 'REPLY DELETED', 'success');
      if (id) {
        fetchReviews(id);
      }
    } catch (err) {
      addToast('FAILED TO SAVE REPLY', 'error');
    }
  };

  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<'details' | 'shipping' | 'returns'>('details');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  // Sizing Assistant States
  const [sizeGuideTab, setSizeGuideTab] = useState<'chart' | 'helper'>('chart');
  const [helperHeight, setHelperHeight] = useState<number>(175);
  const [helperWeight, setHelperWeight] = useState<number>(70);
  const [helperFit, setHelperFit] = useState<'tight' | 'standard' | 'oversized'>('standard');

  const getRecommendedSize = () => {
    let baseSize: string;
    if (helperHeight < 170 && helperWeight < 65) {
      baseSize = 'S';
    } else if (helperHeight >= 170 && helperHeight < 178 && helperWeight >= 65 && helperWeight < 75) {
      baseSize = 'M';
    } else if (helperHeight >= 178 && helperHeight < 185 && helperWeight >= 75 && helperWeight < 88) {
      baseSize = 'L';
    } else if (helperHeight >= 185 || helperWeight >= 88) {
      baseSize = 'XL';
    } else {
      const bmi = helperWeight / ((helperHeight / 100) ** 2);
      if (helperHeight < 172) {
        baseSize = bmi > 24 ? 'M' : 'S';
      } else if (helperHeight < 182) {
        baseSize = bmi > 25 ? 'L' : 'M';
      } else {
        baseSize = bmi > 25 ? 'XL' : 'L';
      }
    }

    const sizes = ['S', 'M', 'L', 'XL'];
    const baseIndex = sizes.indexOf(baseSize);
    let finalIndex = baseIndex;

    if (helperFit === 'tight') {
      finalIndex = Math.max(0, baseIndex - 1);
    } else if (helperFit === 'oversized') {
      finalIndex = Math.min(sizes.length - 1, baseIndex + 1);
    }

    return sizes[finalIndex];
  };

  const product = products.find((p) => String(p.id) === String(id));

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveImageIndex(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedColor]);

  useEffect(() => {
    if (product) {
      // Initialize selected size based on product data
      const availableSizes = product.sizes && product.sizes.length > 0 
        ? product.sizes 
        : (product.category === 'FOOTWEAR' ? ['40', '41', '42', '43', '44'] : ['S', 'M', 'L', 'XL']);
      setSelectedSize(availableSizes[0] || 'M');

      if (product.has_variants) {
        const initialColor = (product.variants && product.variants.length > 0)
          ? product.variants[0].color
          : (product.variant_color_1 || '#000000');
        const timer = setTimeout(() => {
          setSelectedColor(initialColor);
        }, 0);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setSelectedColor('');
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const activeVar = product.has_variants && product.variants && product.variants.length > 0
        ? product.variants.find(v => v.color === selectedColor)
        : null;

      const availableSizes = activeVar && activeVar.sizes && activeVar.sizes.length > 0
        ? activeVar.sizes
        : (product.sizes && product.sizes.length > 0 
          ? product.sizes 
          : (product.category === 'FOOTWEAR' ? ['40', '41', '42', '43', '44'] : ['S', 'M', 'L', 'XL']));

      if (!availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0] || 'M');
      }
    }
  }, [selectedColor, product]);

  const [isUploadingReviewImage, setIsUploadingReviewImage] = useState(false);
  const [hasDeliveredOrder, setHasDeliveredOrder] = useState(false);
  const [checkingOrder, setCheckingOrder] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyCTA(true);
      } else {
        setShowStickyCTA(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUserPurchase = async () => {
      if (!currentUser || !id) {
        setHasDeliveredOrder(false);
        return;
      }
      setCheckingOrder(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('items')
          .eq('user_id', currentUser.id)
          .eq('status', 'delivered');
        
        if (error) throw error;
        
        const purchased = data?.some((order: any) => 
          order.items?.some((item: any) => String(item.id) === String(id))
        );
        setHasDeliveredOrder(!!purchased);
      } catch (err) {
        console.error('Error checking user purchase status:', err);
        setHasDeliveredOrder(false);
      } finally {
        setCheckingOrder(false);
      }
    };
    checkUserPurchase();
  }, [currentUser, id]);

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingReviewImage(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        urls.push(url);
      }
      setReviewImages(prev => [...prev, ...urls]);
      addToast('PHOTOS UPLOADED SUCCESSFULLY', 'success');
    } catch (error) {
      addToast('FAILED TO UPLOAD PHOTOS', 'error');
    } finally {
      setIsUploadingReviewImage(false);
    }
  };

  const handleRemoveReviewImage = (indexToRemove: number) => {
    setReviewImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReviews(id);
    }
  }, [id, fetchReviews]);

  // Fetch products if they aren't loaded yet (e.g. direct URL entry)
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products, fetchProducts]);

  // Prevent background scroll when size guide modal or zoomed image is open
  useEffect(() => {
    if (isSizeGuideOpen || zoomedImage) {
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
  }, [isSizeGuideOpen, zoomedImage]);

  // Handle loading state
  if (products.length === 0 && isLoading) {
    return <PageLoader label="SEARCHING SYSTEM DATABASE" subLabel="RETRIEVING ARCHIVE PIECE" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <span className="text-[10px] font-bold tracking-[0.5em] text-white/20 uppercase mb-4">PRODUCT SEARCH COMPLETE</span>
        <h2 className="text-xl font-black font-syne italic tracking-tighter mb-8">PIECE NOT FOUND IN ARCHIVE</h2>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase border border-white/10 px-6 py-3.5 hover:bg-white hover:text-black transition-all"
        >
          <ArrowLeft size={12} />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const activeVariant = product.has_variants && product.variants && product.variants.length > 0
    ? product.variants.find(v => v.color === selectedColor)
    : null;

  const activeStock = activeVariant
    ? (activeVariant.stock ?? 0)
    : (product.has_variants && selectedColor === product.variant_color_2)
      ? (product.stock_2 ?? 0)
      : (product.stock ?? 0);
  const isOutOfStock = activeStock === 0;


  // Generate category-specific fallback detail images for the gallery
  const getProductImages = (prod: any): string[] => {
    if (prod.images && Array.isArray(prod.images)) {
      const validImages = prod.images.filter((img: string) => img && img.trim() !== '');
      if (validImages.length > 0) {
        return validImages;
      }
    }
    const fallbacks: Record<string, string[]> = {
      TOPS: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
      ],
      BOTTOMS: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000',
        'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1000',
      ],
      ACCESSORIES: [
        'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1000',
        'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1000',
      ],
      FOOTWEAR: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000',
      ],
      OUTERWEAR: [
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000',
      ]
    };

    const catKey = (prod.category || 'TOPS').toUpperCase();
    const catFallbacks = fallbacks[catKey] || fallbacks.TOPS;
    return [prod.image, ...catFallbacks].filter((img: string) => img && img.trim() !== '');
  };

  const getVariantImages = (prod: any): string[] => {
    if (prod.has_variants) {
      const activeVar = prod.variants?.find((v: any) => v.color === selectedColor);
      if (activeVar && activeVar.images && activeVar.images.length > 0) {
        return activeVar.images.filter((img: string) => img && img.trim() !== '');
      }
      if (selectedColor === prod.variant_color_2) {
        if (prod.images2 && Array.isArray(prod.images2) && prod.images2.length > 0) {
          return prod.images2.filter((img: string) => img && img.trim() !== '');
        }
        return [prod.image];
      }
    }
    return getProductImages(prod);
  };

  const images = getVariantImages(product);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor || undefined);
    const colorName = product.has_variants 
      ? (PRESET_COLORS.find(c => c.value === selectedColor)?.name?.toUpperCase() || 'VARIANT')
      : '';
    const label = colorName ? `SIZE: ${selectedSize} // COLOR: ${colorName}` : `SIZE: ${selectedSize}`;
    addToast(`ADDED TO CART (${label})`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await addReview({
        product_id: Number(id),
        user_id: currentUser.id,
        user_email: currentUser.email,
        rating,
        comment,
        images: reviewImages
      });
      addToast('REVIEW COMMITTED TO ARCHIVE', 'success');
      setComment('');
      setRating(5);
      setReviewImages([]);
    } catch (err) {
      addToast('FAILED TO SUBMIT REVIEW', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Get related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && String(p.id) !== String(product.id))
    .slice(0, 3);

  if (relatedProducts.length < 3) {
    const additional = products
      .filter((p) => String(p.id) !== String(product.id) && !relatedProducts.some((rp) => String(rp.id) === String(p.id)))
      .slice(0, 3 - relatedProducts.length);
    relatedProducts.push(...additional);
  }

  return (
    <div className="min-h-screen bg-black text-white py-24 md:py-32 px-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Breadcrumb / Navigation */}
        <div className="flex items-center space-x-2 text-[9px] font-bold tracking-[0.25em] text-white/40 uppercase mb-12">
          <Link to="/" className="hover:text-white transition-colors">Catalog</Link>
          <ChevronRight size={10} />
          <Link to={`/category/${product.category}`} className="hover:text-white transition-colors">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-white/80">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column: Image Gallery (col-span 7) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
            {/* Thumbnails Sidebar */}
            <div className="flex md:flex-col flex-row gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-20 h-24 flex-shrink-0 bg-[#0a0a0a] border transition-all ${
                    activeImageIndex === index ? 'border-white' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Large Preview Window */}
            <div className="flex-1 aspect-[3/4] bg-[#0a0a0a] border border-white/10 overflow-hidden relative group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={images[activeImageIndex]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDragEnd={(_, { offset }) => {
                    const swipe = offset.x;
                    const swipeThreshold = 50;
                    if (swipe < -swipeThreshold) {
                      setActiveImageIndex((prev) => (prev + 1) % images.length);
                    } else if (swipe > swipeThreshold) {
                      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 touch-pan-y cursor-grab active:cursor-grabbing"
                />
              </AnimatePresence>

              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10">
                <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/50">IMAGE 0{activeImageIndex + 1} // DETAIL</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information (col-span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">
                SYSTEM ARCHIVE // {product.category}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
              {isOutOfStock ? (
                <span className="text-[8px] font-mono font-bold tracking-widest text-red-500 border border-red-500/20 px-2 py-0.5 uppercase bg-red-500/5">
                  OUT OF STOCK
                </span>
              ) : (
                <span className="text-[8px] font-mono font-bold tracking-widest text-green-400 border border-green-500/20 px-2 py-0.5 uppercase bg-green-500/5">
                  {activeStock} PIECES REMAINING
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-syne tracking-tighter italic uppercase mb-6 leading-tight">
              {product.name}
            </h1>
            
            <div className="text-2xl font-syne font-bold mb-8 text-white/90">
              ${product.price.toFixed(2)}
            </div>

            {/* Color Selector */}
            {product.has_variants && (
              <div className="border-t border-white/10 pt-8 mb-4 space-y-4">
                <span className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase">SELECT COLOR</span>
                <div className="flex gap-3">
                  {((product.variants && product.variants.length > 0)
                    ? product.variants.map(v => v.color)
                    : [product.variant_color_1, product.variant_color_2].filter(Boolean) as string[]
                  ).map((colorCode, idx) => {
                    const isActive = selectedColor === colorCode;
                    const colorObj = PRESET_COLORS.find(c => c.value.toLowerCase() === colorCode.toLowerCase());
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(colorCode)}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          isActive ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: colorCode }}
                        title={colorObj?.name || 'Color'}
                      >
                        {isActive && (
                          <span className="text-[9px] mix-blend-difference font-bold text-white">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="border-t border-b border-white/10 py-8 mb-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase">SELECT SIZE</span>
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[9px] font-bold tracking-widest text-white/60 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                >
                  SIZE GUIDE
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {sortSizes(
                  (activeVariant && activeVariant.sizes && activeVariant.sizes.length > 0)
                    ? activeVariant.sizes
                    : (product.sizes && product.sizes.length > 0
                      ? product.sizes
                      : (product.category === 'FOOTWEAR'
                        ? ['40', '41', '42', '43', '44']
                        : ['S', 'M', 'L', 'XL']))
                ).map((size) => (
                  <motion.button
                    whileHover={isOutOfStock ? {} : { scale: 1.05 }}
                    whileTap={isOutOfStock ? {} : { scale: 0.95 }}
                    key={size}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border flex items-center justify-center text-[10px] font-bold tracking-widest transition-all ${
                      selectedSize === size && !isOutOfStock
                        ? 'bg-white text-black border-white'
                        : isOutOfStock
                        ? 'border-white/5 text-white/20 bg-transparent cursor-not-allowed'
                        : 'border-white/10 text-white hover:border-white/30 bg-transparent'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 space-y-4">
              <span className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block">PIECE SUMMARY</span>
              <p className="text-xs text-white/60 leading-relaxed tracking-wider font-light">
                {product.description ||
                  "Experimental piece designed for urban exploration. Constructed from high-density technical fabrics with a focus on silhouette and functionality. Part of the BACKDOOR permanent archive."}
              </p>
            </div>

            {/* Specs / Info Accordion */}
            <div className="border border-white/10 mb-8 overflow-hidden bg-white/[0.01]">
              {/* DETAILS Accordion Header */}
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'details' ? 'details' : 'details')}
                className="w-full flex justify-between items-center px-5 py-4 border-b border-white/10 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[10px] font-mono font-bold tracking-wider text-white/80">01 // TECHNICAL DETAILS</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${activeAccordion === 'details' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 'details' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 space-y-3 font-mono text-[9px] text-white/40 tracking-widest uppercase bg-black/40">
                      <div className="flex justify-between">
                        <span>FIT STYLE:</span>
                        <span className="text-white/70">OVERSIZED / BOXY / UNISEX</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FABRIC SPEC:</span>
                        <span className="text-white/70">100% ORGANIC COTTON (360 GSM)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ORIGIN:</span>
                        <span className="text-white/70">SPAIN / BARCELONA DESIGN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DETAILS:</span>
                        <span className="text-white/70">REINFORCED SEAMS // METAL SEAL</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SHIPPING Accordion Header */}
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? 'details' : 'shipping')}
                className="w-full flex justify-between items-center px-5 py-4 border-b border-white/10 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[10px] font-mono font-bold tracking-wider text-white/80">02 // SHIPPING & TRANSIT</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 'shipping' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 space-y-2 font-mono text-[9px] text-white/40 tracking-widest uppercase bg-black/40">
                      <p className="leading-relaxed">
                        SPAIN: 24-48H EXPRESS DELIVERY.
                      </p>
                      <p className="leading-relaxed">
                        EUROPE: 3-5 BUSINESS DAYS VIA DHL.
                      </p>
                      <p className="leading-relaxed">
                        WORLDWIDE: 5-8 DAYS WITH DDP CUSTOMS INCLUDED.
                      </p>
                      <p className="text-white/60">
                        * ALL ARCHIVE PIECES ARE SHIPPED WITH DISCRETE ECO-PACKAGING AND TRACKED SIGNATURE REQUIREMENT.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* RETURNS Accordion Header */}
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'returns' ? 'details' : 'returns')}
                className="w-full flex justify-between items-center px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[10px] font-mono font-bold tracking-wider text-white/80">03 // RETURNS & EXCHANGE</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${activeAccordion === 'returns' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 'returns' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 space-y-2 font-mono text-[9px] text-white/40 tracking-widest uppercase bg-black/40">
                      <p className="leading-relaxed">
                        14-DAY RETURN POLICY FOR ALL CATALOG PIECES.
                      </p>
                      <p className="leading-relaxed">
                        PRODUCTS MUST REMAIN IN NEW CONDITION, UNWORN, AND WITH ORIGINAL ARCHIVE LABELS ATTACHED.
                      </p>
                      <p className="text-white/60">
                        * LIMITED ARCHIVE RELEASES ARE ELIGIBLE FOR EXCHANGE OR STORE CREDIT ONLY.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || added}
              className={`w-full py-5 font-bold text-xs tracking-widest uppercase flex items-center justify-center space-x-3 transition-all ${
                isOutOfStock
                  ? 'bg-neutral-900 text-white/20 border border-white/5 cursor-not-allowed'
                  : added 
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {isOutOfStock ? (
                <X size={16} className="text-white/20" />
              ) : added ? (
                <Check size={16} />
              ) : (
                <ShoppingBag size={16} />
              )}
              <span className="relative z-10">
                {isOutOfStock ? 'OUT OF STOCK' : added ? 'ADDED TO CART' : 'ADD TO CART'}
              </span>
            </button>
          </div>
        </div>

        {/* Product Reviews Section */}
        <section className="mt-32 pt-16 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase mb-2 block">
                  CUSTOMER LOG
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-syne uppercase tracking-tighter italic">
                  PIECE REVIEWS ({reviews.length})
                </h2>
              </div>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-white/30 tracking-widest uppercase italic">
                    NO CUSTOMER REVIEWS REGISTERED FOR THIS ARCHIVE PIECE.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-6 bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-white/40 block truncate max-w-[200px]">
                            {(() => {
                              const [username, domain] = rev.user_email.split('@');
                              if (!username) return rev.user_email;
                              const masked = username[0] + '*'.repeat(Math.max(0, username.length - 1));
                              return `${masked}@${domain || '***'}`;
                            })()}
                          </span>
                          <span className="text-[8px] font-mono text-white/20 mt-1 block">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-xs ${i < rev.rating ? 'text-white' : 'text-white/10'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                          {currentUser && (currentUser.id === rev.user_id || isAdmin) && (
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this review?')) {
                                  try {
                                    await deleteReview(rev.id);
                                    addToast('REVIEW DELETED FROM ARCHIVE', 'success');
                                  } catch (error) {
                                    addToast('FAILED TO DELETE REVIEW', 'error');
                                  }
                                }
                              }}
                              className="text-white/40 hover:text-red-500 transition-colors flex items-center justify-center p-1 border border-white/10 hover:border-red-500/30"
                              title="Delete Review"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-white/70 font-light leading-relaxed tracking-wider">
                        {rev.comment}
                      </p>
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                          {rev.images.map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={() => setZoomedImage(imgUrl)}
                              className="w-16 h-20 bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 hover:border-white/30 transition-all cursor-zoom-in"
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Admin Reply Display */}
                      {rev.reply && (
                        <div className="mt-4 p-4 bg-white/[0.03] border-l border-white/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono font-bold tracking-[0.3em] text-white/50 uppercase">ADMINISTRATOR // RESPONSE</span>
                            {isAdmin && (
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this admin response?')) {
                                    await handleSaveReply(rev.id, '');
                                  }
                                }}
                                className="text-[8px] text-red-500 hover:underline uppercase font-bold"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-white/80 font-light leading-relaxed tracking-wider">
                            {rev.reply}
                          </p>
                        </div>
                      )}

                      {/* Admin Reply Action Input */}
                      {isAdmin && (
                        <div className="mt-3">
                          <AdminReplyForm 
                            initialText={rev.reply || ''} 
                            onSave={(text) => handleSaveReply(rev.id, text)} 
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submission Form */}
            <div className="lg:col-span-5 border border-white/10 p-8 bg-white/[0.01]">
              <span className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase block mb-2">
                SUBMIT DATA
              </span>
              <h3 className="text-lg font-black font-syne uppercase italic tracking-tighter mb-8">
                WRITE A REVIEW
              </h3>

              {currentUser ? (
                checkingOrder ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <InlineLoader label="CHECKING TRANSACTION ARCHIVE" size={16} />
                  </div>
                ) : !hasDeliveredOrder ? (
                  <div className="text-center py-8 px-4 bg-white/[0.02] border border-white/5 space-y-4">
                    <p className="text-[9px] font-mono tracking-widest text-white/40 uppercase leading-relaxed">
                      You can only review pieces that have been delivered to your delivery destination.
                    </p>
                    <p className="text-[7px] font-mono tracking-widest text-white/20 uppercase">
                      Check your order status under your Profile settings.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    {/* Star Rating Select */}
                    <div>
                      <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-3">
                        RATING
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="text-lg hover:scale-110 transition-transform cursor-pointer"
                          >
                            <span className={star <= rating ? 'text-white' : 'text-white/20'}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div>
                      <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-3">
                        COMMENTS
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        required
                        placeholder="Add design notes, sizing comments, quality review..."
                        className="w-full bg-transparent border border-white/10 p-4 text-xs text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/10"
                      />
                    </div>

                    {/* Photo Attachment */}
                    <div>
                      <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-3">
                        ATTACH PHOTOS
                      </label>
                      <div className="flex flex-wrap gap-3 mb-3">
                        {reviewImages.map((imgUrl, idx) => (
                          <div key={idx} className="w-16 h-20 bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveReviewImage(idx)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <label className="w-16 h-20 bg-white/5 border border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center cursor-pointer transition-all gap-1">
                          {isUploadingReviewImage ? (
                            <InlineLoader label="..." size={10} />
                          ) : (
                            <>
                              <Sparkles size={14} className="text-white/40" />
                              <span className="text-[6px] font-bold tracking-widest text-white/40 uppercase">ADD</span>
                            </>
                          )}
                          <input type="file" accept="image/*" multiple onChange={handleReviewImageUpload} className="hidden" disabled={isUploadingReviewImage} />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || isUploadingReviewImage}
                      className="w-full py-4 bg-white text-black font-bold text-[10px] tracking-widest uppercase hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center min-h-[44px]"
                    >
                      {isSubmittingReview ? <InlineLoader label="COMMITTING" size={12} /> : 'COMMIT REVIEW'}
                    </button>
                  </form>
                )
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-[9px] font-mono tracking-widest text-white/40 uppercase leading-relaxed">
                    LOG IN OR REGISTER VIA THE PROFILE GATE TO COMMENT ON ARCHIVE PIECES.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 pt-16 border-t border-white/10">
            <div className="flex flex-col mb-12">
              <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase mb-2 block">
                RECOMMENDED ITEMS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-syne uppercase tracking-tighter italic">
                RELATED ARCHIVE PIECES
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  {...p}
                  onAdd={() => addToCart(p)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-neutral-950 border border-white/10 p-6 md:p-8 text-white z-10"
            >
              <button 
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <span className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase block mb-2">ARCHIVE STANDARD</span>
              <h3 className="text-xl font-black font-syne uppercase italic tracking-tighter mb-6">SIZE GUIDE</h3>

              {/* Tab Selector */}
              {product.category !== 'FOOTWEAR' && (
                <div className="flex border-b border-white/10 mb-6">
                  <button 
                    onClick={() => setSizeGuideTab('chart')}
                    className={`flex-1 pb-3 text-[9px] font-bold tracking-[0.2em] uppercase transition-all cursor-pointer ${sizeGuideTab === 'chart' ? 'border-b-2 border-white text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    Size Chart
                  </button>
                  <button 
                    onClick={() => setSizeGuideTab('helper')}
                    className={`flex-1 pb-3 text-[9px] font-bold tracking-[0.2em] uppercase transition-all cursor-pointer ${sizeGuideTab === 'helper' ? 'border-b-2 border-white text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    Fit Assistant
                  </button>
                </div>
              )}

              {product.category === 'FOOTWEAR' || sizeGuideTab === 'chart' ? (
                <>
                  <div className="overflow-x-auto">
                    {product.category === 'FOOTWEAR' ? (
                      <table className="w-full text-left font-mono text-[9px] tracking-wider uppercase border-collapse">
                        <thead>
                          <tr className="border-b border-white/20 text-white/40">
                            <th className="py-3 px-2">EU SIZE</th>
                            <th className="py-3 px-2">US MEN</th>
                            <th className="py-3 px-2">UK SIZE</th>
                            <th className="py-3 px-2">FOOT LENGTH (CM)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { eu: '36', us: '4.0', uk: '3.5', cm: '22.8' },
                            { eu: '37', us: '4.5', uk: '4.0', cm: '23.5' },
                            { eu: '38', us: '5.5', uk: '5.0', cm: '24.2' },
                            { eu: '39', us: '6.5', uk: '6.0', cm: '24.8' },
                            { eu: '40', us: '7.0', uk: '6.5', cm: '25.4' },
                            { eu: '41', us: '8.0', uk: '7.5', cm: '26.0' },
                            { eu: '42', us: '8.5', uk: '8.0', cm: '26.7' },
                            { eu: '43', us: '9.5', uk: '9.0', cm: '27.3' },
                            { eu: '44', us: '10.0', uk: '9.5', cm: '27.9' },
                            { eu: '45', us: '11.0', uk: '10.5', cm: '28.6' },
                            { eu: '46', us: '12.0', uk: '11.5', cm: '29.2' },
                          ].map((row) => (
                            <tr key={row.eu} className="border-b border-white/5">
                              <td className="py-2.5 px-2 font-bold text-white">{row.eu}</td>
                              <td className="py-2.5 px-2 text-white/60">{row.us}</td>
                              <td className="py-2.5 px-2 text-white/60">{row.uk}</td>
                              <td className="py-2.5 px-2 text-white/60">{row.cm} cm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-left font-mono text-[10px] tracking-wider uppercase border-collapse">
                        <thead>
                          <tr className="border-b border-white/20 text-white/40">
                            <th className="py-3 px-2">SIZE</th>
                            <th className="py-3 px-2">CHEST (CM)</th>
                            <th className="py-3 px-2">LENGTH (CM)</th>
                            <th className="py-3 px-2">SLEEVE (CM)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-2 font-bold text-white">S</td>
                            <td className="py-3 px-2 text-white/60">56</td>
                            <td className="py-3 px-2 text-white/60">68</td>
                            <td className="py-3 px-2 text-white/60">60</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-2 font-bold text-white">M</td>
                            <td className="py-3 px-2 text-white/60">59</td>
                            <td className="py-3 px-2 text-white/60">70</td>
                            <td className="py-3 px-2 text-white/60">61</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-2 font-bold text-white">L</td>
                            <td className="py-3 px-2 text-white/60">62</td>
                            <td className="py-3 px-2 text-white/60">72</td>
                            <td className="py-3 px-2 text-white/60">62</td>
                          </tr>
                          <tr className="border-b border-white/20">
                            <td className="py-3 px-2 font-bold text-white">XL</td>
                            <td className="py-3 px-2 text-white/60">65</td>
                            <td className="py-3 px-2 text-white/60">74</td>
                            <td className="py-3 px-2 text-white/60">63</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-white/60">
                      <Sparkles size={12} className="text-white/40" />
                      <span>FIT RECOMMENDATION:</span>
                    </div>
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
                      {product.category === 'FOOTWEAR'
                        ? 'THIS FOOTWEAR PIECE RUNS TRUE TO SIZE. IF YOU ARE BETWEEN SIZES, WE RECOMMEND GOING UP TO THE NEAREST WHOLE SIZE FOR THE MOST COMFORTABLE ARCHIVE FIT.'
                        : 'THIS ITEM IS DESIGNED TO HAVE A RELAXED, SLIGHTLY OVERSIZED SILHOUETTE. WE RECOMMEND ORDERING YOUR TRUE SIZE FOR THE INTENDED LOOK, OR ONE SIZE DOWN FOR A MORE STANDARD FIT.'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Height Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold tracking-widest uppercase">
                      <span className="text-white/40">Height:</span>
                      <span className="text-white">{helperHeight} CM ({Math.round(helperHeight / 2.54)} IN)</span>
                    </div>
                    <input 
                      type="range"
                      min="140"
                      max="210"
                      value={helperHeight}
                      onChange={(e) => setHelperHeight(Number(e.target.value))}
                      className="w-full accent-white bg-white/10 h-1 cursor-pointer"
                    />
                  </div>

                  {/* Weight Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold tracking-widest uppercase">
                      <span className="text-white/40">Weight:</span>
                      <span className="text-white">{helperWeight} KG ({Math.round(helperWeight * 2.20462)} LBS)</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="130"
                      value={helperWeight}
                      onChange={(e) => setHelperWeight(Number(e.target.value))}
                      className="w-full accent-white bg-white/10 h-1 cursor-pointer"
                    />
                  </div>

                  {/* Fit Preference Selection */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-white/40 block">Silhouette Fit</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['tight', 'standard', 'oversized'] as const).map((fitOption) => (
                        <button
                          key={fitOption}
                          type="button"
                          onClick={() => setHelperFit(fitOption)}
                          className={`py-2 text-[8px] font-bold tracking-widest uppercase border transition-all cursor-pointer ${
                            helperFit === fitOption 
                              ? 'bg-white text-black border-white' 
                              : 'border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          {fitOption === 'tight' ? 'Standard / Slim' : fitOption === 'standard' ? 'Relaxed / Regular' : 'Boxy / Oversized'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculation Result */}
                  <div className="p-6 bg-white/[0.02] border border-white/10 space-y-4">
                    <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/30 block text-center">Calculated Recommended Size</span>
                    <div className="text-5xl font-black font-syne text-center py-4 bg-white/5 border border-white/10 text-white tracking-tighter italic">
                      SIZE {getRecommendedSize()}
                    </div>
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest text-center leading-relaxed max-w-xs mx-auto">
                      Based on your metrics, size {getRecommendedSize()} fits best for the chosen {helperFit} streetwear profile.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSize(getRecommendedSize());
                        setIsSizeGuideOpen(false);
                        addToast(`SIZE SET TO: ${getRecommendedSize()}`, 'success');
                      }}
                      className="w-full py-3 bg-white text-black font-bold text-[9px] tracking-widest uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      Apply Recommended Size
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Zoomed Review Image Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-w-4xl max-h-[85vh] z-10 overflow-hidden border border-white/10"
              onClick={() => setZoomedImage(null)}
            >
              <img src={zoomedImage} alt="Zoomed review attachment" className="w-auto h-auto max-w-full max-h-[85vh] object-contain" />
              
              {/* Close Button overlay */}
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 bg-black/60 border border-white/10 text-white hover:bg-white hover:text-black p-2 transition-all"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom CTA for Mobile */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-24 left-0 right-0 z-30 px-4 lg:hidden"
          >
            <div className="bg-[#070707]/90 backdrop-blur-xl border border-white/10 p-4 flex items-center justify-between shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3">
                <img src={product.image} alt="" className="w-10 h-12 object-cover border border-white/5 bg-neutral-900" />
                <div className="max-w-[120px]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-white truncate">{product.name}</h4>
                  <span className="text-[9px] font-mono text-white/40 block mt-0.5">${product.price.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={selectedSize}
                  disabled={isOutOfStock}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-[10px] font-mono p-2.5 uppercase focus:outline-none focus:border-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {sortSizes(
                    (activeVariant && activeVariant.sizes && activeVariant.sizes.length > 0)
                      ? activeVariant.sizes
                      : (product.sizes && product.sizes.length > 0
                        ? product.sizes
                        : (product.category === 'FOOTWEAR'
                          ? ['40', '41', '42', '43', '44']
                          : ['S', 'M', 'L', 'XL']))
                  ).map(size => (
                    <option key={size} value={size} className="bg-black text-white">{size}</option>
                  ))}
                </select>
                
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || added}
                  className={`text-[9px] font-bold tracking-widest uppercase px-5 py-3 flex items-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-neutral-900 text-white/20 border border-white/5 cursor-not-allowed'
                      : added 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-black'
                  }`}
                >
                  <span>{isOutOfStock ? 'OUT' : added ? 'ADDED' : 'ADD'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
