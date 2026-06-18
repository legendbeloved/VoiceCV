import React, { useState } from 'react';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';

interface CopyButtonProps {
  content: string;
  label?: string;
  onSuccess?: (msg: string) => void;
}

export function CopyButton({ content, label = "Copy Text", onSuccess }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied'>('idle');

  const handleCopy = async () => {
    setState('loading');
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
      
      setState('copied');
      if (onSuccess) onSuccess('Copied to clipboard!');
      
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      setState('idle');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-10 px-4 rounded-xl min-w-[120px]"
      disabled={state === 'loading'}
    >
      <AnimatePresence mode="wait">
        {state === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 size={16} className="animate-spin mr-2" />
          </motion.div>
        ) : state === 'copied' ? (
          <motion.div
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center"
          >
            <CheckCircle size={16} className="text-emerald-400 mr-2" />
            <span className="text-emerald-400">Copied</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center"
          >
            <Copy size={16} className="mr-2" />
            <span>{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
