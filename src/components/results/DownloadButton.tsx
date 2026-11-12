import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Download, ChevronDown, FileText, FileType, FilePenLine } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  generateResumePDF,
  generateCoverLetterPDF,
  generateLinkedInBioPDF,
  generateInterviewPrepPDF,
  downloadAsText,
} from '../../lib/pdf';
import { generateCareerDocx } from '../../lib/docx';
import type { CareerAssets } from '../../lib/gemini';
import { useAuth } from '../../auth/AuthProvider';
import { usePlanStore } from '../../store/usePlanStore';
import { downloadThemedResumeDocx, downloadThemedResumePdf } from '../../lib/themedExport';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DownloadButtonProps {
  documentType: 'resume' | 'coverLetter' | 'linkedinBio' | 'interviewPrep';
  content: string;
  candidateName: string;
  assets?: CareerAssets;
}

// ─── PDF generator map ──────────────────────────────────────────────────────

const pdfGenerators: Record<DownloadButtonProps['documentType'], (c: string, n: string, a?: CareerAssets) => void> = {
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

export function DownloadButton({ documentType, content, candidateName, assets }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [menuBox, setMenuBox] = useState({ top: 0, left: 0, maxHeight: 320 });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const plan = usePlanStore((state) => state.plan);

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
    setIsOpen(false);
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

  useEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 280;
      const gap = 8;
      const margin = 12;
      const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      const openDown = spaceBelow >= 180 || spaceBelow >= spaceAbove;
      const maxHeight = Math.max(160, Math.min(420, openDown ? spaceBelow : spaceAbove));
      const top = openDown ? rect.bottom + gap : Math.max(margin, rect.top - gap - maxHeight);
      const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
      setMenuBox({ top, left, maxHeight });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [isOpen]);

  const handleThemed = async (layout: 'one' | 'two' | 'docx') => {
    if (plan !== 'premium') {
      setIsOpen(false);
      navigate('/upgrade');
      return;
    }
    if (!user) {
      setIsOpen(false);
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsGenerating(true);
    setIsOpen(false);
    try {
      if (layout === 'docx') await downloadThemedResumeDocx(content, candidateName, assets?.role || 'Professional');
      else downloadThemedResumePdf(content, candidateName, assets?.role || 'Professional', layout);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!user) {
      setIsOpen(false);
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsGenerating(true);
    setIsOpen(false);

    // Small delay so the loading spinner renders before the synchronous PDF work blocks the main thread
    await new Promise((r) => setTimeout(r, 100));

    try {
      if (format === 'pdf') {
        const generator = pdfGenerators[documentType];
        generator(content, candidateName, assets);
      } else if (format === 'docx') {
        await generateCareerDocx(documentType, content, candidateName, assets);
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

  const itemClass = 'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]';

  const menu = isOpen ? createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Download formats"
      style={{ top: menuBox.top, left: menuBox.left, maxHeight: menuBox.maxHeight }}
      className="fixed z-[80] w-[280px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-[var(--shadow)]"
    >
      <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Standard</p>
      <button id="download-pdf-option" type="button" role="menuitem" onClick={() => handleDownload('pdf')} className={itemClass}>
        <FileText size={16} className="shrink-0 text-[var(--accent)]" />
        PDF
      </button>
      <button id="download-docx-option" type="button" role="menuitem" onClick={() => handleDownload('docx')} className={itemClass}>
        <FilePenLine size={16} className="shrink-0 text-[var(--accent)]" />
        Word
      </button>
      <button id="download-txt-option" type="button" role="menuitem" onClick={() => handleDownload('txt')} className={itemClass}>
        <FileType size={16} className="shrink-0 text-[var(--accent)]" />
        Text
      </button>
      {documentType === 'resume' && (
        <>
          <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Themed resume</p>
          <button type="button" role="menuitem" onClick={() => void handleThemed('one')} className={itemClass}>One-page PDF</button>
          <button type="button" role="menuitem" onClick={() => void handleThemed('two')} className={itemClass}>Two-page PDF</button>
          <button type="button" role="menuitem" onClick={() => void handleThemed('docx')} className={itemClass}>Themed Word</button>
        </>
      )}
    </div>,
    document.body,
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      {menu}
      <Button
        id="download-trigger"
        size="sm"
        loading={isGenerating}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-10 rounded-xl px-6"
        rightIcon={<ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
      >
        <Download size={16} className="mr-2" />
        Download
      </Button>
    </div>
  );
}
