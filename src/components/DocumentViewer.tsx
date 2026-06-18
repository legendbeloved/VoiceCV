import React, { useState } from 'react';
import { FileText, Mail, Link as LinkIcon, Copy, Check, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { CareerAssets } from '../lib/gemini';

interface DocumentViewerProps {
  assets: CareerAssets;
}

export default function DocumentViewer({ assets }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter' | 'linkedinBio'>('resume');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = activeTab === 'resume' ? assets.resume : 
                 activeTab === 'coverLetter' ? assets.coverLetter : 
                 assets.linkedinBio;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'resume', label: 'Resume', icon: FileText, content: assets.resume },
    { id: 'coverLetter', label: 'Cover Letter', icon: Mail, content: assets.coverLetter },
    { id: 'linkedinBio', label: 'LinkedIn Bio', icon: LinkIcon, content: assets.linkedinBio },
  ] as const;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Navigation Rail */}
      <div className="lg:col-span-3 flex lg:flex-col gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 lg:flex-none p-5 rounded-3xl flex flex-col lg:flex-row items-center lg:items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-brand-violet text-white shadow-xl shadow-brand-violet/20' : 'glass-liquid text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            <tab.icon size={20} />
            <span className="font-display font-bold text-sm lg:text-base">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="lg:col-span-9 glass-liquid rounded-[2.5rem] overflow-hidden flex flex-col h-[700px]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
            <h3 className="font-display font-bold text-xl uppercase tracking-tight">
              {assets.role || 'Career Asset'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={copyToClipboard}
              className="p-3 glass-liquid rounded-2xl hover:bg-white/10 transition-all text-white/80"
              title="Copy to Clipboard"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
            <button className="p-3 bg-white text-void-indigo rounded-2xl hover:bg-zinc-200 transition-all font-bold">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Document */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 font-sans selection:bg-brand-violet/30 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tighter prose-p:text-white/70 prose-li:text-white/70"
            >
              <div className={activeTab === 'resume' ? 'font-mono text-sm' : ''}>
                <Markdown>{tabs.find(t => t.id === activeTab)?.content}</Markdown>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}
