import React, { useState } from 'react';
import { Download, ChevronUp, FileText, FileJson } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'motion/react';
import { generateResumePDF, generateCoverLetterPDF, generateLinkedInBioPDF, generateInterviewPrepPDF, downloadAsText } from '../../lib/pdf';

interface DownloadButtonProps {
  documentType: 'resume' | 'coverLetter' | 'linkedinBio' | 'interviewPrep';
  content: string;
  candidateName: string;
}

export function DownloadButton({ documentType, content, candidateName }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (format: 'pdf' | 'txt') => {
    setIsGenerating(true);
    setIsOpen(false);
    
    // Small delay to show loading state
    await new Promise(r => setTimeout(r, 800));

    try {
      if (format === 'pdf') {
        if (documentType === 'resume') generateResumePDF(content, candidateName);
        if (documentType === 'coverLetter') generateCoverLetterPDF(content, candidateName);
        if (documentType === 'linkedinBio') generateLinkedInBioPDF(content, candidateName);
        if (documentType === 'interviewPrep') generateInterviewPrepPDF(content, candidateName);
      } else {
        const filename = `${candidateName.replace(/\s+/g, '_')}_${documentType}`;
        downloadAsText(content, filename);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 w-48 z-50"
          >
            <Card variant="glass" padding="sm" className="shadow-2xl border-white/10">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface)] transition-all text-xs font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <FileText size={16} className="text-brand-violet" />
                  Download as PDF
                </button>
                <button
                  onClick={() => handleDownload('txt')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface)] transition-all text-xs font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <FileJson size={16} className="text-voice-amber" />
                  Download as TXT
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="sm"
        loading={isGenerating}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-6 rounded-xl"
        rightIcon={<ChevronUp size={16} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />}
      >
        <Download size={16} className="mr-2" />
        Download
      </Button>
    </div>
  );
}
