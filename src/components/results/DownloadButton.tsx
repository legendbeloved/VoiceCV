import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ChevronUp, FileText, FileType } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import {
  generateResumePDF,
  generateCoverLetterPDF,
  generateLinkedInBioPDF,
  generateInterviewPrepPDF,
  downloadAsText,
} from '../../lib/pdf';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DownloadButtonProps {
  documentType: 'resume' | 'coverLetter' | 'linkedinBio' | 'interviewPrep';
  content: string;
  candidateName: string;
}

// ─── PDF generator map ──────────────────────────────────────────────────────

const pdfGenerators: Record<DownloadButtonProps['documentType'], (c: string, n: string) => void> = {
  resume: generateResumePDF,
  coverLetter: generateCoverLetterPDF,
  linkedinBio: generateLinkedInBioPDF,
  interviewPrep: generateInterviewPrepPDF,
};

const labelMap: Record<DownloadButtonProps['documentType'], string> = {
  resume: 'Resume',
  coverLetter: 'CoverLetter',
  linkedinBio: 'LinkedInBio',
  interviewPrep: 'InterviewPrep',
};

// ─── Component ──────────────────────────────────────────────────────────────

export function DownloadButton({ documentType, content, candidateName }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen]);

  const handleDownload = async (format: 'pdf' | 'txt') => {
    setIsGenerating(true);
    setIsOpen(false);

    // Small delay so the loading spinner renders before the synchronous PDF work blocks the main thread
    await new Promise((r) => setTimeout(r, 100));

    try {
      if (format === 'pdf') {
        const generator = pdfGenerators[documentType];
        generator(content, candidateName);
      } else {
        const safeName = candidateName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        downloadAsText(content, `${safeName}-${labelMap[documentType]}`);
      }
    } catch (err) {
      console.error(`[DownloadButton] ${format.toUpperCase()} generation failed:`, err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* ── Dropdown menu (glass panel, positioned above) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-0 mb-2 w-52 z-50"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[var(--panel)]/90 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="flex flex-col p-1.5 gap-0.5">
                <button
                  id="download-pdf-option"
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface)] transition-colors text-xs font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <FileText size={16} className="text-[var(--accent)] shrink-0" />
                  Download as PDF
                </button>
                <button
                  id="download-txt-option"
                  onClick={() => handleDownload('txt')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface)] transition-colors text-xs font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <FileType size={16} className="text-amber-400 shrink-0" />
                  Download as TXT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger button ── */}
      <Button
        id="download-trigger"
        size="sm"
        loading={isGenerating}
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-10 px-6 rounded-xl"
        rightIcon={
          <ChevronUp
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        }
      >
        <Download size={16} className="mr-2" />
        Download
      </Button>
    </div>
  );
}
