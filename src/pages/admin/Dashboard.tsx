import React, { useState, useEffect } from 'react';
import { Package, Users, Truck, RotateCcw, CreditCard, LogOut, Plus, Edit, Trash2, X, Save, Upload, Menu, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { supabaseAdmin } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../store/useToast';
import { InlineLoader } from '../../components/common/Loader';

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

const AdminDashboard: React.FC = () => {
  const { products, users, orders, addProduct, updateProduct, deleteProduct, updateOrderStatus, uploadImage, fetchUsers, subscribeToUsers } = useStore();
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
    const unsubUsers = subscribeToUsers();
    return () => {
      unsubUsers();
    };
  }, [fetchUsers, subscribeToUsers]);
  const [activeTab, setActiveTab] = useState('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('TOPS');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [simulatedEmail, setSimulatedEmail] = useState<{ to: string, orderId: string, total: number, address: string } | null>(null);

  const [hasVariants, setHasVariants] = useState(false);

  interface ModalVariant {
    color: string;
    images: string[];
    stock: number;
    imageUrlInput: string;
    showMoreColors: boolean;
    isUploading: boolean;
    sizes?: string[];
  }

  const [modalVariants, setModalVariants] = useState<ModalVariant[]>([]);

  const handleAddVariant = () => {
    setModalVariants(prev => [...prev, {
      color: '#000000',
      images: [],
      stock: 10,
      imageUrlInput: '',
      showMoreColors: false,
      isUploading: false,
      sizes: []
    }]);
  };

  const handleRemoveVariant = (index: number) => {
    setModalVariants(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveVariantImage = (varIdx: number, imgIdx: number) => {
    setModalVariants(prev => prev.map((v, i) => i === varIdx ? {
      ...v,
      images: v.images.filter((_, idx) => idx !== imgIdx)
    } : v));
  };

  const handleAddVariantImageUrl = (varIdx: number) => {
    const variant = modalVariants[varIdx];
    if (variant && variant.imageUrlInput.trim()) {
      setModalVariants(prev => prev.map((v, i) => i === varIdx ? {
        ...v,
        images: [...v.images, v.imageUrlInput.trim()],
        imageUrlInput: ''
      } : v));
      addToast('PHOTO URL ADDED FOR VARIANT', 'success');
    }
  };

  const handleVariantImageUpload = async (varIdx: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setModalVariants(prev => prev.map((v, i) => i === varIdx ? { ...v, isUploading: true } : v));
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        urls.push(url);
      }
      setModalVariants(prev => prev.map((v, i) => i === varIdx ? {
        ...v,
        images: [...v.images, ...urls]
      } : v));
      addToast('PHOTOS UPLOADED FOR VARIANT', 'success');
    } catch (error) {
      addToast('FAILED TO UPLOAD PHOTOS', 'error');
    } finally {
      setModalVariants(prev => prev.map((v, i) => i === varIdx ? { ...v, isUploading: false } : v));
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setUploadedImages(prev => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      addToast('PHOTO URL ADDED', 'success');
    }
  };



  const menuItems = [
    { id: 'products', label: 'INVENTORY', icon: <Package size={18} /> },
    { id: 'users', label: 'ACCOUNTS', icon: <Users size={18} /> },
    { id: 'orders', label: 'ORDERS', icon: <Truck size={18} /> },
    { id: 'shipping', label: 'SHIPPING', icon: <Truck size={18} /> },
    { id: 'returns', label: 'RETURNS', icon: <RotateCcw size={18} /> },
    { id: 'payments', label: 'PAYMENTS', icon: <CreditCard size={18} /> },
  ];

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsUploading(true);

    try {
      const productData: any = {
        name: formData.get('name') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as string,
        image: hasVariants && modalVariants.length > 0 && modalVariants[0].images.length > 0
          ? modalVariants[0].images[0]
          : (uploadedImages[0] || ''),
        images: hasVariants && modalVariants.length > 0
          ? modalVariants[0].images
          : uploadedImages,
        description: formData.get('description') as string,
        stock: hasVariants && modalVariants.length > 0
          ? modalVariants[0].stock
          : (parseInt(formData.get('stock') as string) || 0),
        has_variants: hasVariants,
        variant_color_1: hasVariants && modalVariants.length > 0 ? modalVariants[0].color : null,
        variant_color_2: hasVariants && modalVariants.length > 1 ? modalVariants[1].color : null,
        images2: hasVariants && modalVariants.length > 1 ? modalVariants[1].images : [],
        stock_2: hasVariants && modalVariants.length > 1 ? modalVariants[1].stock : 0,
        variants: hasVariants ? modalVariants.map(v => ({
          color: v.color,
          images: v.images,
          stock: v.stock,
          sizes: sortSizes(v.sizes || [])
        })) : [],
        sizes: sortSizes(selectedSizes)
      };

      if (editingProduct) {
        productData.id = editingProduct.id;
        await updateProduct(productData);
      } else {
        await addProduct(productData);
      }
      addToast(editingProduct ? 'PRODUCT UPDATED SUCCESSFULLY' : 'PRODUCT REGISTERED SUCCESSFULLY', 'success');
      setIsModalOpen(false);
      setEditingProduct(null);
      setUploadedImages([]);
      setModalVariants([]);
    } catch (error) {
      addToast('FAILED TO SAVE PRODUCT. CHECK CONSOLE.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        urls.push(url);
      }
      setUploadedImages(prev => [...prev, ...urls]);
      addToast('PHOTOS UPLOADED SUCCESSFULLY', 'success');
    } catch (error) {
      addToast('FAILED TO UPLOAD PHOTOS', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveUploadedImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-64 border-r border-white/10 p-8 flex flex-col h-screen fixed overflow-y-auto z-40 bg-[#050505] transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex justify-between items-center mb-12">
          <div className="text-2xl font-black font-syne italic tracking-tighter">ADMIN_SYS</div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-4 flex-1">
          {menuItems.map((item) => {
            const isOrders = item.id === 'orders';
            const pendingCount = isOrders ? orders.filter(o => o.status === 'confirmed' || o.status === 'delayed' || o.status === 'shipped').length : 0;

            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${activeTab === item.id ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center space-x-4">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isOrders && pendingCount > 0 && (
                  <span className="bg-orange-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <Link
          to="/"
          className="flex items-center space-x-4 px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-white hover:bg-white/5 transition-all mt-auto mb-2"
        >
          <Globe size={18} />
          <span>Return to Shop</span>
        </Link>

        <button
          onClick={async () => {
            await supabaseAdmin.auth.signOut();
            window.location.href = '/login/admin';
          }}
          className="flex items-center space-x-4 px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-red-500 hover:bg-red-500/10 transition-all mb-4"
        >
          <LogOut size={18} />
          <span>Exit System</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-64 p-6 md:p-12 overflow-y-auto min-h-screen">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-12 border-b border-white/10 pb-8 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black font-syne uppercase tracking-tighter">{activeTab}</h1>
              <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase mt-2">Management Terminal v1.1.0</p>
            </div>
          </div>
          {activeTab === 'products' && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setUploadedImages([]);
                setHasVariants(false);
                setModalVariants([{ color: '#000000', images: [], stock: 10, imageUrlInput: '', showMoreColors: false, isUploading: false, sizes: [] }]);
                setSelectedCategory('TOPS');
                setSelectedSizes([]);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center space-x-2 bg-white text-black px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-white/90 transition-all w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>Register New Product</span>
            </button>
          )}
        </header>

        {/* Stats Row */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
            <div className="border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between">
              <span className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-4">Total Inventory Items</span>
              <h2 className="text-3xl font-black font-syne italic tracking-tighter text-white">{products.length}</h2>
            </div>
            
            <div className="border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between">
              <span className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-4">Items Currently In Stock</span>
              <h2 className="text-3xl font-black font-syne italic tracking-tighter text-white">
                {products.reduce((sum, p) => {
                  if (p.has_variants) {
                    if (p.variants && p.variants.length > 0) {
                      return sum + p.variants.reduce((vSum, v) => vSum + (v.stock ?? 0), 0);
                    }
                    return sum + (p.stock ?? 0) + (p.stock_2 ?? 0);
                  }
                  return sum + (p.stock ?? 0);
                }, 0)} pcs
              </h2>
            </div>
            
            <div className="border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between">
              <span className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-4">Expected Stock Revenue</span>
              <h2 className="text-3xl font-black font-syne italic tracking-tighter text-green-400">
                ${products.reduce((sum, p) => {
                  const pStock = p.has_variants
                    ? (p.variants && p.variants.length > 0 ? p.variants.reduce((vSum, v) => vSum + (v.stock ?? 0), 0) : ((p.stock ?? 0) + (p.stock_2 ?? 0)))
                    : (p.stock ?? 0);
                  return sum + (pStock * p.price);
                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between">
              <span className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-4">Pending Money</span>
              <h2 className="text-3xl font-black font-syne italic tracking-tighter text-orange-500">
                ${orders.filter(o => o.status === 'confirmed' || o.status === 'delayed' || o.status === 'shipped').reduce((sum, o) => sum + o.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 gap-4">
            <div className="hidden md:grid grid-cols-6 px-6 py-4 text-[8px] font-bold tracking-[0.3em] text-white/20 uppercase border-b border-white/5">
              <div className="col-span-2">Product Details</div>
              <div>Category</div>
              <div>Price</div>
              <div>Stock</div>
              <div className="text-right">Actions</div>
            </div>
            {products.map((product) => (
              <div key={product.id} className="flex flex-col md:grid md:grid-cols-6 px-6 py-6 md:py-4 items-start md:items-center bg-white/5 border border-white/5 hover:border-white/20 transition-all gap-4 md:gap-0">
                <div className="col-span-2 flex items-center space-x-4 w-full">
                  <div className="w-12 h-16 bg-muted overflow-hidden flex-shrink-0">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold tracking-widest uppercase truncate">{product.name}</div>
                    <div className="text-[8px] text-white/40 font-mono mt-1 truncate">ID: {product.id}</div>
                  </div>
                </div>
                <div className="flex md:block justify-between w-full md:w-auto text-[10px] font-bold tracking-widest text-white/60 uppercase">
                  <span className="md:hidden text-white/20 mr-2">Category:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex md:block justify-between w-full md:w-auto text-xs font-syne font-bold">
                  <span className="md:hidden text-white/20 font-inter text-[10px] tracking-widest uppercase mr-2">Price:</span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
                <div className="flex md:block justify-between w-full md:w-auto text-xs font-mono font-bold">
                  <span className="md:hidden text-white/20 font-inter text-[10px] tracking-widest uppercase mr-2">Stock:</span>
                  {product.has_variants ? (
                    <span className="text-white/80">
                      {product.variants && product.variants.length > 0 ? (
                        product.variants.map((v, idx) => {
                          const colorName = PRESET_COLORS.find(c => c.value.toLowerCase() === v.color.toLowerCase())?.name || v.color;
                          return (
                            <span key={idx} className="block text-[8px] tracking-wider">
                              {colorName}: <span className={v.stock === 0 ? 'text-red-500' : 'text-white'}>{v.stock ?? 0}</span>
                            </span>
                          );
                        })
                      ) : (
                        <>
                          V1: <span className={product.stock === 0 ? 'text-red-500' : 'text-white'}>{product.stock ?? 0}</span> / V2: <span className={product.stock_2 === 0 ? 'text-red-500' : 'text-white'}>{product.stock_2 ?? 0}</span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className={product.stock === 0 ? 'text-red-500' : 'text-white/80'}>{product.stock ?? 0} pcs</span>
                  )}
                </div>
                <div className="flex justify-end md:justify-end w-full md:w-auto border-t border-white/5 pt-4 md:border-none md:pt-0 gap-4">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setUploadedImages(product.images || (product.image ? [product.image] : []));
                      setHasVariants(!!product.has_variants);
                      setSelectedCategory(product.category || 'TOPS');
                      setSelectedSizes(product.sizes || []);
                      
                      if (product.variants && product.variants.length > 0) {
                        setModalVariants(product.variants.map(v => ({
                          color: v.color,
                          images: v.images || [],
                          stock: v.stock || 0,
                          imageUrlInput: '',
                          showMoreColors: false,
                          isUploading: false,
                          sizes: v.sizes || []
                        })));
                      } else {
                        setModalVariants([
                          { color: product.variant_color_1 || '#000000', images: product.images || [], stock: product.stock || 0, imageUrlInput: '', showMoreColors: false, isUploading: false, sizes: product.sizes || [] },
                          { color: product.variant_color_2 || '#ffffff', images: product.images2 || [], stock: product.stock_2 || 0, imageUrlInput: '', showMoreColors: false, isUploading: false, sizes: [] }
                        ]);
                      }
                      setIsModalOpen(true);
                    }}
                    className="text-white/40 hover:text-white transition-colors flex items-center gap-2 border border-white/10 md:border-none px-4 py-2 md:p-0 text-[10px] md:text-sm font-bold tracking-widest md:normal-case uppercase"
                  >
                    <Edit size={16} />
                    <span className="md:hidden">Edit</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        try {
                          await deleteProduct(product.id);
                          addToast('PRODUCT DELETED', 'success');
                        } catch (error) {
                          addToast('FAILED TO DELETE PRODUCT', 'error');
                        }
                      }
                    }}
                    className="text-white/40 hover:text-red-500 transition-colors flex items-center gap-2 border border-red-500/20 md:border-none px-4 py-2 md:p-0 text-[10px] md:text-sm font-bold tracking-widest md:normal-case uppercase"
                  >
                    <Trash2 size={16} />
                    <span className="md:hidden text-red-500">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="p-6 bg-white/5 border border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase">{user.username}</h3>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mt-1">{user.email}</p>
                </div>
                <span className="text-[8px] font-bold tracking-[0.3em] bg-white/10 px-3 py-1 uppercase">{user.id === 'admin123' ? 'Administrator' : 'Customer'}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="p-8 bg-white/5 border border-white/5 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                  <div>
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                      <span>Order {order.id}</span>
                      <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 uppercase ${
                        order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        order.status === 'confirmed' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        order.status === 'delayed' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        order.status === 'received' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-white/10 text-white'
                      }`}>
                        {order.status}
                      </span>
                    </h3>
                    <p className="text-[8px] text-white/20 mt-1 uppercase">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'processing' && (
                      <button
                        onClick={async () => {
                          try {
                            await updateOrderStatus(order.id, 'confirmed');
                            addToast('ORDER CONFIRMED & STOCK DEDUCTED', 'success');
                          } catch (err) {
                            addToast('FAILED TO CONFIRM ORDER', 'error');
                          }
                        }}
                        className="bg-white text-black px-4 py-2 text-[8px] font-bold tracking-widest uppercase hover:bg-white/90 transition-all"
                      >
                        Confirm Order
                      </button>
                    )}

                    {(order.status === 'confirmed' || order.status === 'delayed' || order.status === 'shipped') && (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatus(order.id, 'delivered');
                              addToast(`ORDER DELIVERED. EMAIL NOTIFICATION DISPATCHED`, 'success');
                              setSimulatedEmail({
                                to: order.customerEmail || 'customer@backdoor-shop.com',
                                orderId: order.id,
                                total: order.total,
                                address: order.shippingAddress?.addressLine1 || 'Default Address'
                              });
                            } catch (err) {
                              addToast('FAILED TO MARK AS DELIVERED', 'error');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[8px] font-bold tracking-widest uppercase transition-all"
                        >
                          Mark Delivered
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatus(order.id, 'delayed');
                              addToast('ORDER MARKED AS DELAYED', 'info');
                            } catch (err) {
                              addToast('FAILED TO UPDATE STATUS', 'error');
                            }
                          }}
                          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-500 border border-amber-500/20 px-3 py-1.5 text-[8px] font-bold tracking-widest uppercase transition-all"
                        >
                          Delay
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to cancel this order? This will restore stock levels.')) {
                              try {
                                await updateOrderStatus(order.id, 'cancelled');
                                addToast('ORDER CANCELLED & STOCK RESTORED', 'error');
                              } catch (err) {
                                addToast('FAILED TO CANCEL ORDER', 'error');
                              }
                            }
                          }}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/20 px-3 py-1.5 text-[8px] font-bold tracking-widest uppercase transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] font-bold tracking-widest text-white/60">
                      <span>{item.name} x1</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.shippingAddress && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <span className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase">Shipping Destination</span>
                    <div className="bg-white/[0.02] p-4 border border-white/5 space-y-1 font-mono text-[9px] text-white/60 tracking-wider">
                      <div><strong className="text-white/40">NAME:</strong> {order.shippingAddress.fullName}</div>
                      <div><strong className="text-white/40">EMAIL:</strong> {order.customerEmail || 'N/A'}</div>
                      <div><strong className="text-white/40">ADDRESS:</strong> {order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</div>
                      <div><strong className="text-white/40">LOCATION:</strong> {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}</div>
                      <div><strong className="text-white/40">PHONE:</strong> {order.shippingAddress.phone}</div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Total Amount</span>
                  <span className="text-sm font-syne font-black">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="p-8 bg-white/5 border border-white/5">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-white/40">Active Shipments</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase">TRK-99281-X</div>
                    <div className="text-[8px] text-white/20 mt-1 uppercase">Order: ORD-001 | Carrier: DHL Express</div>
                  </div>
                  <span className="text-[8px] font-bold tracking-[0.3em] bg-green-500/10 text-green-500 px-3 py-1 uppercase">In Transit</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/5 opacity-50">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase">TRK-88120-Z</div>
                    <div className="text-[8px] text-white/20 mt-1 uppercase">Order: ORD-000 | Carrier: FedEx</div>
                  </div>
                  <span className="text-[8px] font-bold tracking-[0.3em] bg-white/10 text-white/40 px-3 py-1 uppercase">Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="p-8 bg-white/5 border border-white/5">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-white/40">Pending Returns</h3>
              <div className="flex flex-col items-center justify-center py-12 text-white/10">
                <RotateCcw size={32} className="mb-4" />
                <p className="text-[10px] tracking-widest uppercase">No pending returns found in the system.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="p-12 border border-white/5 bg-white/5 text-center">
            <CreditCard size={48} className="mx-auto mb-6 text-white/10" />
            <h3 className="text-sm font-bold tracking-[0.5em] uppercase mb-4 text-white/40">Secure Payment Terminal</h3>
            <p className="text-[10px] tracking-widest text-white/20 max-w-sm mx-auto">
              All transactions are processed through Stripe secure encryption. View logs in the Stripe Dashboard for full audit trails.
            </p>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 p-6 md:p-12 z-10 overflow-y-auto max-h-[calc(100vh-2rem)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black font-syne italic tracking-tighter uppercase">
                  {editingProduct ? 'Update Product' : 'Register New Piece'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-8">
                {/* 01 // General Details */}
                <div className="border border-white/10 bg-white/[0.01] p-6 space-y-6">
                  <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/40 border-b border-white/5 pb-3">01 // General Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Product Name</label>
                      <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Price ($)</label>
                      <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>
                     <div>
                      <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Category</label>
                      <select 
                        name="category" 
                        value={selectedCategory} 
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setSelectedCategory(newCat);
                          setSelectedSizes([]);
                        }} 
                        className="w-full bg-black border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors uppercase text-[10px] font-bold tracking-widest"
                      >
                        <option value="TOPS">Tops</option>
                        <option value="BOTTOMS">Bottoms</option>
                        <option value="OUTERWEAR">Outerwear</option>
                        <option value="ACCESSORIES">Accessories</option>
                        <option value="FOOTWEAR">Footwear</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Description</label>
                      <textarea name="description" defaultValue={editingProduct?.description} rows={3} className="w-full bg-transparent border border-white/20 p-4 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>

                  </div>
                </div>

                {/* Legacy General Images & Stock Section (Only shown if variants are disabled) */}
                {!hasVariants && (
                  <div className="border border-white/10 bg-white/[0.01] p-6 space-y-6">
                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/40 border-b border-white/5 pb-3">02 // Stock & Images</h3>
                    <div>
                      <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Stock Count</label>
                      <input name="stock" type="number" step="1" defaultValue={editingProduct?.stock ?? 0} required className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Product Images</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {uploadedImages.map((imgUrl, index) => (
                          <div key={index} className="aspect-[3/4] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                            <img src={imgUrl} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveUploadedImage(index)}
                                className="bg-red-600 text-white p-2 hover:bg-red-700 transition-colors rounded-sm flex items-center justify-center"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {index === 0 ? (
                                <span className="text-[6px] font-mono font-bold tracking-wider bg-white text-black px-1.5 py-0.5 uppercase">Primary</span>
                              ) : (
                                <span className="text-[6px] font-mono font-bold tracking-wider bg-black/60 text-white/60 px-1.5 py-0.5 uppercase">{index + 1}</span>
                              )}
                            </div>
                          </div>
                        ))}

                        <label className="aspect-[3/4] bg-white/5 border border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center cursor-pointer transition-all gap-2">
                          {isUploadingImage ? (
                            <InlineLoader label="UPLOADING..." size={14} />
                          ) : (
                            <>
                              <Upload size={20} className="text-white/40" />
                              <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase">Upload File</span>
                            </>
                          )}
                          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isUploadingImage} />
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL here..."
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                          className="flex-1 bg-transparent border-b border-white/20 py-2 text-[10px] text-white focus:outline-none focus:border-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="border border-white/10 px-4 py-2 text-[8px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variant 1 Toggle switch */}
                <div className="flex items-center justify-between border border-white/10 bg-white/[0.01] p-6">
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-1">Color Variants</label>
                    <span className="text-[8px] text-white/20 uppercase tracking-widest">Enable distinct image galleries and stock for color variants</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newHasVariants = !hasVariants;
                      setHasVariants(newHasVariants);
                      if (newHasVariants && modalVariants.length === 0) {
                        setModalVariants([
                          { color: '#000000', images: uploadedImages, stock: editingProduct?.stock || 10, imageUrlInput: '', showMoreColors: false, isUploading: false }
                        ]);
                      }
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                      hasVariants ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${
                        hasVariants ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Dynamic Variants mapping */}
                {hasVariants && modalVariants.map((variant, varIdx) => {
                  const colorObj = PRESET_COLORS.find(c => c.value.toLowerCase() === variant.color.toLowerCase());
                  return (
                    <div key={varIdx} className="border border-white/10 bg-white/[0.01] p-6 space-y-6 relative">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/40">
                          Variant 0{varIdx + 1} // {colorObj?.name || 'CUSTOM'}
                        </h3>
                        {modalVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(varIdx)}
                            className="text-red-500 hover:text-red-400 font-bold text-[8px] tracking-widest uppercase border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 transition-colors"
                          >
                            Remove Variant
                          </button>
                        )}
                      </div>

                      {/* Color Picker */}
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block">Variant Color</label>
                        <div className="flex flex-wrap gap-3">
                          {PRESET_COLORS.slice(0, variant.showMoreColors ? PRESET_COLORS.length : 7).map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => {
                                setModalVariants(prev => prev.map((v, i) => i === varIdx ? { ...v, color: color.value } : v));
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                                variant.color === color.value ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              {variant.color === color.value && (
                                <span className="text-[9px] mix-blend-difference font-bold">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[7px] text-white/20 font-mono tracking-widest uppercase">Selected Value: {variant.color}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setModalVariants(prev => prev.map((v, i) => i === varIdx ? { ...v, showMoreColors: !v.showMoreColors } : v));
                            }}
                            className="text-[8px] font-bold tracking-widest uppercase border-b border-white/20 pb-0.5 hover:border-white transition-colors"
                          >
                            {variant.showMoreColors ? 'Show Less' : 'Show More Colors'}
                          </button>
                        </div>
                      </div>

                      {/* Stock input */}
                      <div>
                        <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Stock Count</label>
                        <input
                          type="number"
                          step="1"
                          value={variant.stock}
                          onChange={(e) => {
                            setModalVariants(prev => prev.map((v, i) => i === varIdx ? { ...v, stock: parseInt(e.target.value) || 0 } : v));
                          }}
                          required
                          className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors font-mono"
                        />
                      </div>

                      {/* Variant Size Selector */}
                      <div className="border-t border-white/5 pt-4">
                        <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-3">Sizes Available for this Variant</label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedCategory === 'FOOTWEAR'
                            ? ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
                            : ['XS', 'S', 'M', 'L', 'XL']
                          ).map((size) => {
                            const isChecked = (variant.sizes || []).includes(size);
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  setModalVariants(prev => prev.map((v, idx) => {
                                    if (idx !== varIdx) return v;
                                    const currentSizes = v.sizes || [];
                                    const newSizes = currentSizes.includes(size)
                                      ? currentSizes.filter(s => s !== size)
                                      : [...currentSizes, size];
                                    return { ...v, sizes: newSizes };
                                  }));
                                }}
                                className={`px-3 py-1.5 border text-[9px] font-bold tracking-widest uppercase transition-all ${
                                  isChecked
                                    ? 'bg-white text-black border-white'
                                    : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white bg-transparent'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Image Upload Gallery */}
                      <div>
                        <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Variant Images</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                          {variant.images.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="aspect-[3/4] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                              <img src={imgUrl} alt={`Variant ${varIdx + 1} Img ${imgIdx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantImage(varIdx, imgIdx)}
                                  className="bg-red-600 text-white p-2 hover:bg-red-700 transition-colors rounded-sm flex items-center justify-center"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="absolute top-2 left-2">
                                <span className="text-[6px] font-mono font-bold tracking-wider bg-black/60 text-white/60 px-1.5 py-0.5 uppercase">{imgIdx + 1}</span>
                              </div>
                            </div>
                          ))}

                          <label className="aspect-[3/4] bg-white/5 border border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center cursor-pointer transition-all gap-2">
                            {variant.isUploading ? (
                              <InlineLoader label="UPLOADING..." size={14} />
                            ) : (
                              <>
                                <Upload size={20} className="text-white/40" />
                                <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase">Upload File</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleVariantImageUpload(varIdx, e.target.files)}
                              className="hidden"
                              disabled={variant.isUploading}
                            />
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Paste Variant image URL..."
                            value={variant.imageUrlInput}
                            onChange={(e) => {
                              setModalVariants(prev => prev.map((v, i) => i === varIdx ? { ...v, imageUrlInput: e.target.value } : v));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddVariantImageUrl(varIdx);
                              }
                            }}
                            className="flex-1 bg-transparent border-b border-white/20 py-2 text-[10px] text-white focus:outline-none focus:border-white transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddVariantImageUrl(varIdx)}
                            className="border border-white/10 px-4 py-2 text-[8px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                          >
                            Add URL
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Another Variant Toggle */}
                {hasVariants && (
                  <div className="flex items-center justify-between border border-white/10 bg-white/[0.01] p-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-1">Add Another Variant</label>
                      <span className="text-[8px] text-white/20 uppercase tracking-widest">Create another color variant block for this product</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none bg-white/10 hover:bg-white/20 animate-pulse"
                    >
                      <div className="w-4 h-4 rounded-full bg-white translate-x-0" />
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-white text-black py-4 font-bold text-xs tracking-widest uppercase hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[50px]"
                >
                  {isUploading ? (
                    <InlineLoader label="UPLOADING & SAVING" size={14} />
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Commit to Database</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Email Modal */}
      <AnimatePresence>
        {simulatedEmail && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSimulatedEmail(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0d0d0d] border border-orange-500/30 p-8 z-10 font-mono shadow-[0_0_30px_rgba(234,88,12,0.15)]"
            >
              <div className="flex justify-between items-center border-b border-orange-500/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em]">Email Dispatch Terminal</span>
                </div>
                <button onClick={() => setSimulatedEmail(null)} className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest">
                  [Close]
                </button>
              </div>

              <div className="space-y-4 text-[10px] leading-relaxed text-white/80">
                <div className="bg-white/[0.02] p-4 border border-white/5 space-y-1">
                  <div><strong className="text-white/40">SENDER:</strong> notifications@backdoor-shop.com</div>
                  <div><strong className="text-white/40">RECIPIENT:</strong> {simulatedEmail.to}</div>
                  <div><strong className="text-white/40">SUBJECT:</strong> ORDER {simulatedEmail.orderId} DELIVERED</div>
                </div>

                <div className="border border-white/10 p-6 space-y-4">
                  <h3 className="text-center font-bold text-white uppercase tracking-[0.2em] border-b border-white/10 pb-3">BACKDOOR // ARCHIVE</h3>
                  
                  <p>Your order has been successfully delivered. Thank you for collecting from our underground collection.</p>
                  
                  <div className="bg-white/5 p-4 space-y-1">
                    <div><strong className="text-white/60">ORDER ID:</strong> {simulatedEmail.orderId}</div>
                    <div><strong className="text-white/60">DESTINATION:</strong> {simulatedEmail.address}</div>
                    <div><strong className="text-white/60">TOTAL PAID:</strong> ${simulatedEmail.total.toFixed(2)}</div>
                  </div>

                  <p className="text-[8px] text-white/30 text-center font-sans tracking-wider mt-4">
                    This is an automated delivery confirmation. © 2026 BACKDOOR SHOP. All rights reserved.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
