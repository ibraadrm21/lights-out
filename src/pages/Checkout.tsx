import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';

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

const Checkout: React.FC = () => {
  const { cart, currentUser, setCurrentUser } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('ES');
  const [phone, setPhone] = useState('');
  
  // Custom Checkbox
  const [rememberAddress, setRememberAddress] = useState(false);

  // Auth fields if session is missing
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Prefill shipping address and email if user is authenticated
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        setEmail(currentUser.email || '');
        supabase
          .from('profiles')
          .select('shipping_address')
          .eq('id', currentUser.id)
          .single()
          .then(({ data, error }: any) => {
            if (!error && data?.shipping_address) {
              const addr = data.shipping_address;
              setFullName(addr.fullName || '');
              setAddressLine1(addr.addressLine1 || '');
              setAddressLine2(addr.addressLine2 || '');
              setCity(addr.city || '');
              setState(addr.state || '');
              setZipCode(addr.zipCode || '');
              setCountry(addr.country || 'ES');
              setPhone(addr.phone || '');
              setRememberAddress(true);
            }
          });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Auth form submit handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          await setCurrentUser(data.user);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        alert('REGISTRATION SUCCESSFUL. CHECK YOUR EMAIL TO CONFIRM.');
      }
    } catch (err: any) {
      alert(err.message.toUpperCase());
    } finally {
      setAuthLoading(false);
    }
  };

  // If cart is empty, redirect to home page or show empty state
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md border border-white/10 p-12 bg-white/5 backdrop-blur-md">
          <ShoppingBag size={48} className="mx-auto mb-6 text-white/20" />
          <h2 className="text-2xl font-black font-syne italic tracking-tighter mb-4">ARCHIVE IS EMPTY</h2>
          <p className="text-white/40 text-[10px] tracking-widest uppercase mb-8 leading-relaxed">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-black py-4 px-8 font-bold text-xs tracking-widest uppercase hover:bg-white/90 transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  // IF USER IS NOT LOGGED IN, RENDER AUTH PAGE
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md p-12 border border-white/10 bg-white/5 backdrop-blur-xl">
          <h2 className="text-xl sm:text-3xl font-black font-syne mb-2 text-center tracking-tighter uppercase">
            AUTHENTICATION
          </h2>
          <p className="text-[10px] font-bold tracking-widest text-white/40 text-center uppercase mb-8">
            You must log in to proceed with checkout
          </p>
          
          <form onSubmit={handleAuthSubmit} className="space-y-6">
            <div>
              <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Email Address</label>
              <input 
                type="email" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="OPERATOR@SYSTEM.COM"
                className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Passcode</label>
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-white text-black font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 mt-8"
            >
              {authLoading ? 'PROCESSING...' : (isLogin ? 'AUTHENTICATE' : 'REGISTER')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[9px] font-bold tracking-[0.2em] text-white/30 hover:text-white uppercase transition-colors"
            >
              {isLogin ? "No account? Create New Identity" : "Already registered? Return to Auth"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const shippingAddress = {
        fullName,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        phone,
      };

      // Save shipping address to profiles table in database if user requested it
      if (rememberAddress && currentUser) {
        await supabase
          .from('profiles')
          .update({ shipping_address: shippingAddress })
          .eq('id', currentUser.id);
      }

      await createCheckoutSession(cart, shippingAddress, email);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase text-white/40 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </Link>

        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black font-syne italic tracking-tighter uppercase mb-16">
          SHIPPING & CHECKOUT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-12">
            <div className="border border-white/10 p-8 md:p-12 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-black font-syne italic tracking-tighter mb-8 uppercase">
                1. Delivery Address
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street name, number, flat"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apartment, suite, unit, building"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Madrid"
                      className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                      State / Province / Region
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Madrid"
                      className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="28001"
                      className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Spain"
                      className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                  />
                </div>

                {/* RECORDAR DOMICILIO CHECKBOX */}
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="rememberAddress"
                    checked={rememberAddress}
                    onChange={(e) => setRememberAddress(e.target.checked)}
                    className="w-4 h-4 bg-black border border-white/20 text-white rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label 
                    htmlFor="rememberAddress" 
                    className="text-[9px] font-bold tracking-[0.2em] text-white/60 uppercase cursor-pointer select-none"
                  >
                    Recordar domicilio
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group mt-8 relative py-5 bg-white text-black font-bold text-xs tracking-widest uppercase overflow-hidden transition-all hover:pr-10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} />
                  <span className="relative z-10">
                    {isSubmitting ? 'INITIATING TRANSIT...' : 'PROCEED TO PAYMENT'}
                  </span>
                  <ArrowRight
                    className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all"
                    size={16}
                  />
                </button>
              </form>
            </div>
          </div>

          {/* Cart Overview Side */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border border-white/10 p-8 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-black font-syne italic tracking-tighter mb-8 uppercase">
                Order Summary
              </h2>

              <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto pr-2 space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 pt-4 first:pt-0">
                    <div className="w-16 h-20 bg-muted overflow-hidden flex-shrink-0">
                      <img src={getCartItemImage(item)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[10px] font-bold tracking-widest uppercase truncate text-white/90">
                        {item.name}
                      </h3>
                      <p className="text-[8px] text-white/40 tracking-widest uppercase mt-1">
                        Size: {item.size}
                      </p>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-[10px] font-bold text-white/40">QTY: {item.quantity}</span>
                        <span className="text-xs font-syne font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <div className="flex justify-between text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                  <span>Shipping</span>
                  <span className="text-white">FREE</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-white/5 pt-4 flex justify-between items-end">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
                    Total
                  </span>
                  <span className="text-2xl font-syne font-black">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
