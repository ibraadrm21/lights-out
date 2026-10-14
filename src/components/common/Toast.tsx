import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../store/useToast';

const iconMap = {
  info: <Info size={14} className="text-blue-400" />,
  success: <CheckCircle size={14} className="text-green-400" />,
  error: <AlertCircle size={14} className="text-red-400" />,
};

const bgColorMap = {
  info: 'bg-[#111] text-white border border-white/10 ring-1 ring-white/5',
  success: 'bg-[#111] text-white border border-green-500/30 ring-1 ring-green-500/10',
  error: 'bg-[#111] text-white border border-red-500/30 ring-1 ring-red-500/10',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center space-y-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center space-x-4 px-6 py-4 min-w-[300px] max-w-md shadow-2xl glass ${bgColorMap[toast.type]} ${toast.onClick ? 'cursor-pointer hover:border-white/40' : ''}`}
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('.close-toast-btn')) {
                toast.onClick?.();
              }
            }}
          >
            <div className="flex-shrink-0">{iconMap[toast.type]}</div>
            <div className="flex-1 text-[10px] font-bold tracking-[0.2em] uppercase leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="close-toast-btn flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
