import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Briefcase, Mail, Linkedin, MapPin, 
  Download, Share2, ExternalLink, Award,
  CheckCircle2, Sparkles, ChevronRight
} from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GlassPanel } from '../components/ui/GlassPanel';

export default function PortfolioPage() {
  const { id } = useParams();
  const { assets } = useVoiceCVStore();
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter' | 'linkedin'>('resume');

  // If no assets in store and we can't find by ID (future Firestore logic), show error
  if (!assets) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
        <h2 className="text-3xl font-display font-bold">Portfolio Not Found</h2>
        <p className="text-white/40 max-w-md">We couldn't find the requested digital career profile. It might have expired or hasn't been generated yet.</p>
        <Link to="/">
          <Button>Create Your Profile</Button>
        </Link>
      </div>
    );
  }

  const { name = 'Professional Candidate', role, resume, coverLetter, linkedinBio, contactInfo } = assets;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header / Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12"
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-violet/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-voice-amber/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-violet to-void-indigo flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-violet animate-pulse opacity-0 group-hover:opacity-20 transition-opacity" />
              <User size={48} className="text-white relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight">{name}</h1>
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <p className="text-xl text-brand-violet font-bold flex items-center gap-2">
                <Briefcase size={18} />
                {role}
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <Badge variant="outline" className="bg-white/5 border-white/10 py-1.5 px-3">
                  <MapPin size={12} className="mr-1.5" /> Remote / Global
                </Badge>
                <Badge variant="outline" className="bg-white/5 border-white/10 py-1.5 px-3">
                  <Award size={12} className="mr-1.5" /> High Expertise
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" className="group">
              <Share2 size={18} className="mr-2 group-hover:scale-110 transition-transform" />
              Share Profile
            </Button>
            <Button className="group shadow-glow">
              <Download size={18} className="mr-2 group-hover:translate-y-0.5 transition-transform" />
              Export Assets
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 space-y-6"
        >
          <GlassPanel className="p-8 space-y-6">
            <h3 className="text-lg font-display font-bold flex items-center gap-2">
              <Sparkles size={18} className="text-voice-amber" />
              AI-Optimized Context
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              This profile was distilled using Gemini Ultra from a single voice session, ensuring maximum impact for high-growth tech roles.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">ATS Score</span>
                <span className="text-lg font-display font-bold text-emerald-400">98/100</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Market Fit</span>
                <span className="text-lg font-display font-bold text-brand-violet">Exceptional</span>
              </div>
            </div>
          </GlassPanel>

          <Card variant="glass" className="p-8 space-y-6">
            <h3 className="text-lg font-display font-bold">Contact & Links</h3>
            <div className="space-y-4">
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-violet/30 hover:bg-brand-violet/5 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Email</p>
                  <p className="text-sm font-medium">{contactInfo?.email || 'user@example.com'}</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-white/10 group-hover:text-white/40" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-violet/30 hover:bg-brand-violet/5 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Linkedin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">LinkedIn</p>
                  <p className="text-sm font-medium">linkedin.com/in/pro-candidate</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-white/10 group-hover:text-white/40" />
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8"
        >
          <div className="mb-8 flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
            {(['resume', 'coverLetter', 'linkedin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/20' 
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {tab.replace(/([A-Z])/, ' $1')}
              </button>
            ))}
          </div>

          <GlassPanel className="p-0 border-white/10 overflow-hidden">
            <div className="p-8 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <h4 className="text-lg font-display font-extrabold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center text-brand-violet">
                   {activeTab === 'resume' ? <Briefcase size={16} /> : activeTab === 'coverLetter' ? <Mail size={16} /> : <Linkedin size={16} />}
                </div>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/, ' $1')} Content
              </h4>
              <div className="flex gap-2">
                 <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                   <Sparkles size={16} />
                 </button>
              </div>
            </div>
            
            <div className="p-10 prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white prose-strong:text-brand-violet h-[600px] overflow-y-auto custom-scrollbar">
              <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
                {activeTab === 'resume' && resume}
                {activeTab === 'coverLetter' && coverLetter}
                {activeTab === 'linkedin' && linkedinBio}
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <Link to="/interview">
                 <Button variant="ghost" className="text-voice-amber hover:text-voice-amber/80">
                   Practice Interview for this Role 
                   <ChevronRight size={16} className="ml-2" />
                 </Button>
              </Link>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
