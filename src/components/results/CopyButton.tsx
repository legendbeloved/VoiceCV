import React, { useState, useCallback } from 'react';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CopyButtonProps {
  content: string;
  label?: string;
  onSuccess?: (msg: string) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CopyButton({ content, label = 'Copy Text', onSuccess }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied'>('idle');

  const handleCopy = useCallback(async () => {
    if (state !== 'idle') return; // prevent double-clicks during animation
    setState('loading');

    try {
      // ── Modern Clipboard API ──
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // ── Fallback: hidden textarea + execCommand ──
        const textarea = document.createElement('textarea');
        textarea.value = content;
        // Move off-screen to avoid flash
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, content.length);

        try {
          document.execCommand('copy');
        } catch (execErr) {
          console.error('[CopyButton] execCommand fallback failed:', execErr);
        }

        document.body.removeChild(textarea);
      }

      setState('copied');
      onSuccess?.('Copied to clipboard!');

      // Reset after 2 seconds
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('[CopyButton] Copy failed:', err);
      setState('idle');
    }
  }, [content, state, onSuccess]);

  return (
    <Button
      id="copy-text-button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-10 px-4 rounded-xl min-w-[120px]"
      disabled={state === 'loading'}
    >
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center"
          >
            <Loader2 size={16} className="animate-spin mr-2" />
            <span>Copying…</span>
          </motion.div>
        )}

        {state === 'copied' && (
          <motion.div
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center"
          >
            <CheckCircle size={16} className="text-emerald-400 mr-2" />
            <span className="text-emerald-400">Copied</span>
          </motion.div>
        )}

        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
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
