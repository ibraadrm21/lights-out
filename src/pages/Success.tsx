import React, { useEffect, useRef, useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Globe, Download, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../store/useToast';
import { supabase } from '../lib/supabase';
import html2pdf from 'html2pdf.js';
import { PageLoader } from '../components/common/Loader';


const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawOrderId = searchParams.get('order_id');
  const orderId = rawOrderId ? rawOrderId.split('?')[0].split('&')[0] : null;
  const clearCart = useStore((state) => state.clearCart);
  const receiptRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    let active = true;
    
    async function verifyAccess() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        if (active) {
          navigate('/', { replace: true });
        }
        return;
      }

      if (!orderId) {
        if (active) {
          navigate('/', { replace: true });
        }
        return;
      }

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderErr || !orderData) {
        if (active) {
          navigate('/', { replace: true });
        }
        return;
      }

      if (orderData.user_id !== user.id) {
        if (active) {
          navigate('/', { replace: true });
        }
        return;
      }

      if (active) {
        setOrder(orderData);
        setLoadingOrder(false);
        setCheckingAuth(false);
        
        clearCart();
        addToast(
          "Payment successful! You can see the status of your delivery on My Orders. Click here to view.",
          "success",
          () => {
            window.dispatchEvent(new CustomEvent('open-profile-orders'));
          }
        );
      }
    }

    verifyAccess();

    return () => {
      active = false;
    };
  }, [orderId, navigate, clearCart, addToast]);

  if (checkingAuth || loadingOrder) {
    return <PageLoader label="VERIFYING ACCESS" subLabel="LOADING ORDER MANIFEST" />;
  }


  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    setIsDownloading(true);
    const originalGetComputedStyle = window.getComputedStyle;
    
    try {
      // Temporarily override window.getComputedStyle to intercept oklab/oklch colors
      window.getComputedStyle = function (el, pseudoElt) {
        const style = originalGetComputedStyle(el, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'cssText') {
              let css = target.cssText;
              if (css.includes('oklch') || css.includes('oklab')) {
                css = css.replace(/oklch\([^)]+\)/g, 'rgb(255, 255, 255)');
                css = css.replace(/oklab\([^)]+\)/g, 'rgb(255, 255, 255)');
              }
              return css;
            }
            const value = (target as any)[prop];
            if (typeof value === 'string') {
              if (value.includes('oklch') || value.includes('oklab')) {
                const propStr = prop.toString().toLowerCase();
                if (propStr.includes('background') || propStr.includes('fill')) {
                  return 'rgb(255, 255, 255)'; // Light background fallback
                }
                return 'rgb(0, 0, 0)'; // Dark text fallback
              }
            }
            if (prop === 'getPropertyValue') {
              return function (propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  if (propertyName.toLowerCase().includes('background') || propertyName.toLowerCase().includes('fill')) {
                    return 'rgb(255, 255, 255)';
                  }
                  return 'rgb(0, 0, 0)';
                }
                return val;
              };
            }
            return typeof value === 'function' ? value.bind(target) : value;
          }
        });
      };

      const opt = {
        margin: 0,
        filename: `BACKDOOR_RECEIPT_${(orderId || 'ARCHIVE').replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: 'avoid' as const }
      };

      await html2pdf().from(invoiceRef.current).set(opt).save();

    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setIsDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 md:p-8 overflow-x-hidden relative py-20 sm:py-8">
      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <framerMotion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2 }}
          className="text-[40vw] font-black font-syne leading-none italic select-none"
        >
          BACKDOOR
        </framerMotion.h1>
      </div>

      <framerMotion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left Side: Impactful Text */}
        <div className="text-left">
          <framerMotion.div variants={itemVariants} className="mb-6 inline-flex items-center space-x-2 px-3 py-1 border border-white/10 bg-white/5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">System Online / Archive Updated</span>
          </framerMotion.div>

          <framerMotion.h1 variants={itemVariants} className="text-3xl sm:text-6xl md:text-8xl font-black font-syne leading-[0.85] tracking-tighter italic mb-8">
            ORDER <br />
            <span className="text-outline">ARCHIVED.</span>
          </framerMotion.h1>

          <framerMotion.p variants={itemVariants} className="text-sm md:text-base text-white/40 max-w-md mb-12 font-medium leading-relaxed">
            Your transaction has been processed through the secure neural network. Your pieces are being curated for immediate dispatch. 
            Expect a digital transmission with tracking details shortly.
          </framerMotion.p>

          <framerMotion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/"
              className="group flex items-center justify-center space-x-3 bg-white text-black py-5 px-10 font-black text-xs tracking-widest uppercase hover:bg-white/90 transition-all active:scale-95"
            >
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </Link>
            
            <Link 
              to={`/track?id=${orderId}`}
              className="group flex items-center justify-center space-x-3 border border-white/10 bg-white/5 backdrop-blur-md text-white py-5 px-10 font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all active:scale-95"
            >
              <span>Track Dispatch</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </framerMotion.div>
        </div>

        {/* Right Side: Digital Receipt Card */}
        <framerMotion.div 
          variants={itemVariants}
          className="relative lg:ml-auto w-full max-w-[380px]"
        >
          <div 
            ref={receiptRef}
            className="bg-white text-black p-8 relative overflow-hidden shadow-[20px_20px_0px_rgba(255,255,255,0.05)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#050505] rounded-b-full print:hidden" />
            
            <div className="flex justify-between items-start mb-12">
              <div className="text-xl font-black font-syne italic">LIGHTS<span className="text-[#e10600]">OUT</span></div>
              <div className="text-right">
                <span className="text-[8px] font-bold tracking-widest uppercase block opacity-40">Status</span>
                <span className="text-[10px] font-black uppercase">Authenticated</span>
              </div>
            </div>

            <div className="space-y-6 border-y border-black/10 py-8 mb-8">
              <div>
                <span className="text-[8px] font-bold tracking-widest uppercase block opacity-40 mb-1">Reference Number</span>
                <span className="text-sm font-mono font-bold tracking-tighter break-all">{orderId || 'UNASSIGNED'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase block opacity-40 mb-1">Date</span>
                  <span className="text-[10px] font-bold">{order ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase block opacity-40 mb-1">Total Amount</span>
                  <span className="text-[10px] font-black">${order ? parseFloat(order.total).toFixed(2) : '...'}</span>
                </div>
              </div>
            </div>

            <div className="h-12 w-full flex items-end justify-between gap-1 mb-8">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-black w-full" 
                  style={{ 
                    height: `${((i * 17) % 60) + 40}%`, 
                    opacity: (i * 31) % 5 === 0 ? 0.3 : 1 
                  }} 
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase opacity-40">
              <div className="flex items-center">
                <Globe size={10} className="mr-1" /> Global Shipping
              </div>
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading || loadingOrder}
                className="flex items-center hover:opacity-100 transition-opacity disabled:opacity-20 font-bold"
              >
                {isDownloading ? (
                  <>GENERATING <Loader2 size={10} className="ml-1 animate-spin" /></>
                ) : (
                  <>DOWNLOAD RECEIPT <Download size={10} className="ml-1" /></>
                )}
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 print:hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-[#050505] rounded-full -mb-2" />
              ))}
            </div>
          </div>
          
          <framerMotion.div 
            initial={{ scale: 2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ delay: 1.2, duration: 0.5, type: 'spring' }}
            className="absolute top-2 right-2 sm:-top-6 sm:-right-6 w-20 h-20 sm:w-24 sm:h-24 border-4 border-black text-black rounded-full flex items-center justify-center font-black font-syne text-[8px] sm:text-[10px] tracking-tighter uppercase p-2 text-center bg-white shadow-xl"
          >
            <div className="border-2 border-black rounded-full w-full h-full flex items-center justify-center rotate-[-15deg]">
              APPROVED <br /> 2026
            </div>
          </framerMotion.div>
        </framerMotion.div>
      </framerMotion.div>

      {/* Hidden A4 Receipt for PDF generation (Mimics on-screen ticket covering top and bottom, contents in the middle) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <div 
          ref={invoiceRef}
          style={{ 
            width: '794px', 
            height: '1115px', 
            boxSizing: 'border-box', 
            backgroundColor: '#ffffff', 
            color: '#000000',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px 50px',
            position: 'relative'
          }}
          className="flex flex-col justify-between"
        >
          {/* Top Notch Notch (Circle cutout simulation) */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '0', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '40px', 
              height: '20px', 
              backgroundColor: '#050505', 
              borderBottomLeftRadius: '9999px',
              borderBottomRightRadius: '9999px'
            }} 
          />

          {/* TOP SECTION: Header matching the on-screen card */}
          <div>
            <div className="flex justify-between items-start pt-4 mb-6">
              <div>
                <div style={{ fontWeight: 900 }} className="text-2xl sm:text-4xl italic tracking-tighter text-black">
                  BACKDOOR
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold tracking-[0.2em] text-black/40 uppercase">AUTHENTIC</span>
                {/* Stamp */}
                <div className="border-2 border-black rounded-full w-20 h-20 flex items-center justify-center rotate-[-12deg] font-black text-[9px] tracking-tighter uppercase p-2 text-center bg-white shadow-md">
                  <div className="border border-black rounded-full w-full h-full flex items-center justify-center rotate-[-15deg]">
                    APPROVED <br /> 2026
                  </div>
                </div>
              </div>
            </div>
            
            {/* Horizontal Line separator */}
            <div style={{ height: '1px', backgroundColor: '#000000', width: '100%', marginBottom: '24px' }} />
          </div>

          {/* MIDDLE SECTION: Order Details, Items and Addresses */}
          <div className="flex-1 flex flex-col justify-between my-2">
            
            {/* Reference, Date and Totals Summary Grid */}
            <div className="grid grid-cols-2 gap-8 mb-6 font-mono">
              <div className="space-y-4">
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase block text-black/40 mb-1">REFERENCE NUMBER</span>
                  <span className="text-sm font-bold tracking-tighter break-all text-black">{orderId || 'PENDING'}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase block text-black/40 mb-1">DATE</span>
                  <span className="text-xs font-bold text-black">{order ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-4 text-right">
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase block text-black/40 mb-1">TOTAL AMOUNT</span>
                  <span className="text-sm font-black text-black">${order ? parseFloat(order.total).toFixed(2) : '0.00'}</span>
                </div>
                <div className="text-[8px] text-black/55 tracking-wider uppercase leading-relaxed">
                  SYSTEM_STATUS: AUTHENTICATED
                </div>
              </div>
            </div>

            {/* Solid thin divider */}
            <div style={{ height: '1px', backgroundColor: '#e5e7eb', width: '100%', marginBottom: '20px' }} />

            {/* Origin & Destination Information */}
            <div className="grid grid-cols-2 gap-8 text-[11px] font-mono leading-relaxed mb-6">
              <div>
                <h3 className="text-[8px] font-bold tracking-[0.2em] text-black/45 uppercase mb-3 font-sans">I. Origin / Merchant</h3>
                <div className="space-y-0.5 text-black/70">
                  <div className="font-extrabold text-black uppercase font-sans">BACKDOOR ARCHIVE LABORATORY</div>
                  <div>Calle del Desengaño, 21</div>
                  <div>28004 Madrid, Spain</div>
                  <div>system@backdoor.com</div>
                </div>
              </div>
              <div>
                <h3 className="text-[8px] font-bold tracking-[0.2em] text-black/45 uppercase mb-3 font-sans">II. Destination / Consignee</h3>
                {order?.shipping_address ? (
                  <div className="space-y-0.5 text-black/70 uppercase">
                    <div className="font-extrabold text-black font-sans">{order.shipping_address.fullName}</div>
                    <div>{order.shipping_address.addressLine1}</div>
                    {order.shipping_address.addressLine2 && <div>{order.shipping_address.addressLine2}</div>}
                    <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</div>
                    <div className="font-bold text-black font-sans">{order.shipping_address.country}</div>
                    <div className="pt-2 text-[10px] text-black/50 normal-case space-y-0.5">
                      <div>TEL: {order.shipping_address.phone}</div>
                      {order.customer_email && <div>EMAIL: {order.customer_email}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="italic text-black/30">
                    Standard Dispatch Logistics Pending...
                  </div>
                )}
              </div>
            </div>

            {/* Solid thin divider */}
            <div style={{ height: '1px', backgroundColor: '#e5e7eb', width: '100%', marginBottom: '20px' }} />

            {/* Itemized Manifest table */}
            <div className="font-mono flex-1 mb-6">
              <h3 className="text-[8px] font-bold tracking-[0.2em] text-black/45 uppercase mb-3 font-sans">III. Itemized Manifest</h3>
              
              <div className="flex text-black font-bold text-[8px] tracking-[0.1em] uppercase pb-2 border-none">
                <div className="flex-1 text-left">Artifact</div>
                <div className="w-20 text-center">Price</div>
                <div className="w-16 text-center">Qty</div>
                <div className="w-20 text-right">Subtotal</div>
              </div>
              <div style={{ height: '1px', backgroundColor: '#000000', width: '100%' }} />

              <div className="text-[11px] leading-relaxed">
                {order?.items ? (
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex py-4 items-center">
                        <div className="flex-1 text-left pr-4">
                          <div className="font-bold text-black uppercase">{item.name}</div>
                          <div className="text-[7px] text-black/40 uppercase tracking-widest mt-1">SIZE: {item.size || 'M'} // CAT: {item.category}</div>
                        </div>
                        <div className="w-20 text-center">${parseFloat(item.price).toFixed(2)}</div>
                        <div className="w-16 text-center">{item.quantity}</div>
                        <div className="w-20 text-right font-extrabold text-black">${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                      </div>
                      <div style={{ height: '1px', backgroundColor: '#f3f4f6', width: '100%' }} />
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-black/25 italic">No artifacts located in this manifest.</div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="font-mono text-xs max-w-sm ml-auto w-full space-y-2 mb-4 border-t border-black/10 pt-4">
              <div className="flex justify-between text-black/50 text-[10px] uppercase">
                <span>Subtotal:</span>
                <span className="text-black">${order ? parseFloat(order.total).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between text-black/50 text-[10px] uppercase">
                <span>Shipping:</span>
                <span className="text-black">FREE</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e5e7eb', width: '100%', margin: '6px 0' }} />
              <div className="flex justify-between text-[11px] font-black text-black uppercase">
                <span>TOTAL DISPATCH VALUE:</span>
                <span className="text-sm font-black">${order ? parseFloat(order.total).toFixed(2) : '0.00'}</span>
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: Footer matching the on-screen card */}
          <div>
            {/* Horizontal Line separator */}
            <div style={{ height: '1px', backgroundColor: '#000000', width: '100%', marginBottom: '20px' }} />

            {/* Barcode-like element */}
            <div className="h-14 w-full flex items-end justify-between gap-[2px] mb-6">
              {Array.from({ length: 50 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-black w-full" 
                  style={{ 
                    height: `${i % 3 === 0 ? '70%' : i % 5 === 0 ? '90%' : '50%'}`, 
                    opacity: i % 7 === 0 ? 0.4 : 0.95 
                  }} 
                />
              ))}
            </div>

            {/* Footer Labels */}
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-black/40 font-mono">
              <div className="flex items-center">
                <Globe size={11} className="mr-1" /> Global Shipping
              </div>
              <div>
                AUTHENTICATED SYSTEM // BACKDOOR
              </div>
            </div>

            {/* Bottom Circles (Tear-off notches simulation) */}
            <div 
              style={{ 
                position: 'absolute', 
                bottom: '-12px', 
                left: '0', 
                right: '0', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px',
                pointerEvents: 'none'
              }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: '#050505', 
                    borderRadius: '9999px' 
                  }} 
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-8 hidden md:block">
        <span className="text-[8px] font-bold tracking-[0.5em] uppercase text-white/20">
          Terminal ID: {orderId ? orderId.substring(0, 8) : 'PENDING'}
        </span>
      </div>
    </div>
  );
};

export default Success;
