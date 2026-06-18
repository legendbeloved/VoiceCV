import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  message,
  variant = 'info',
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    info: <AlertCircle size={20} className="text-brand-violet" />
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={cn(
        "flex items-center gap-4 p-4 bg-[var(--panel)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-xl rounded-2xl min-w-[300px] pointer-events-auto",
        "border-l-4",
        variant === 'success' && "border-l-emerald-500",
        variant === 'error' && "border-l-red-500",
        variant === 'info' && "border-l-brand-violet"
      )}
    >
      {icons[variant]}
      <p className="flex-1 text-sm font-medium text-[var(--text)]">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="p-1 hover:bg-[var(--surface)] rounded-lg transition-all text-[var(--muted)] hover:text-[var(--text)]"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

// Simple Toast Manager Container (to be used in App.tsx or a provider)
export function ToastContainer({ toasts, onClose }: { toasts: any[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-24 right-4 sm:right-8 z-[100] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
