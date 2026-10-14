import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { InlineLoader } from '../components/common/Loader';

const TrackOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get('id');
  const parsedId = rawId ? rawId.split('?')[0].split('&')[0] : '';
  const [orderId, setOrderId] = useState(parsedId);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id.trim())
        .single();

      if (fetchError) throw new Error('Order not found in our archive.');
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const rawId = searchParams.get('id');
    const id = rawId ? rawId.split('?')[0].split('&')[0] : null;
    if (id) {
      const timer = setTimeout(() => {
        fetchOrder(id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);


  const statusSteps = [
    { id: 'processing', label: 'Processing', icon: <Package size={20} /> },
    { id: 'shipped', label: 'In Transit', icon: <Truck size={20} /> },
    { id: 'delivered', label: 'Delivered', icon: <CheckCircle2 size={20} /> },
    { id: 'received', label: 'Received', icon: <CheckCircle2 size={20} /> }
  ];

  let currentStatusIndex = 0;
  if (order?.status === 'shipped') {
    currentStatusIndex = 1;
  } else if (order?.status === 'delivered') {
    currentStatusIndex = 2;
  } else if (order?.status === 'received') {
    currentStatusIndex = 3;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pt-32">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center space-x-2 text-white/40 hover:text-white transition-colors mb-12 text-[10px] font-bold tracking-widest uppercase">
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </Link>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-syne tracking-tighter italic mb-4 leading-none">
          TRACK ORDER
        </h1>
        
        <p className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase mb-12">
          Enter your terminal ID to locate your pieces.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); fetchOrder(orderId); }} className="relative mb-16">
          <input 
            type="text" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="ORDER ID (e.g. #ORD-123456)"
            className="w-full bg-white/5 border-b-2 border-white/10 py-6 px-4 text-sm font-bold tracking-widest uppercase focus:outline-none focus:border-white transition-all placeholder:text-white/10"
          />
           <button 
            type="submit" 
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-black p-3 hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            {loading ? <InlineLoader size={16} /> : <Search size={20} />}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3 text-red-500 bg-red-500/10 p-4 border border-red-500/20"
            >
              <AlertCircle size={18} />
              <span className="text-[10px] font-bold tracking-widest uppercase">{error}</span>
            </motion.div>
          )}

          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 border-t border-white/5 pt-8">
                <div>
                  <span className="text-[8px] font-bold tracking-widest text-white/20 uppercase block mb-1">Destination</span>
                  <span className="text-xs font-bold uppercase break-all">{order.customer_email}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold tracking-widest text-white/20 uppercase block mb-1">Registered On</span>
                  <span className="text-xs font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="relative pt-12">
                <div className="absolute top-[12px] left-0 right-0 h-[2px] bg-white/5" />
                <div 
                  className="absolute top-[12px] left-0 h-[2px] bg-white transition-all duration-1000"
                  style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                />
                
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${index <= currentStatusIndex ? 'bg-white text-black' : 'bg-[#0a0a0a] border-2 border-white/10 text-white/20'}`}>
                        {step.icon}
                      </div>
                      <span className={`text-[8px] font-bold tracking-widest uppercase mt-4 ${index <= currentStatusIndex ? 'text-white' : 'text-white/20'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white/5 p-8 border border-white/10">
                <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-6 italic">Package Contents</h3>
                <div className="space-y-4">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                      <span className="text-white/60">{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-white/20 italic">Total Value</span>
                    <span className="text-xl font-syne font-black">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackOrder;
