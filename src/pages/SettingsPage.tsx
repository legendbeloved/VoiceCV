import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, User, Brain, Palette, 
  Bell, Shield, Zap, Sparkles,
  ChevronRight, Save, Globe
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GlassPanel } from '../components/ui/GlassPanel';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('personalization');

  const sections = [
    { id: 'personalization', label: 'AI Personalization', icon: Brain },
    { id: 'themes', label: 'Resume Themes', icon: Palette },
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight uppercase">Control Center</h1>
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">Settings & AI Personalization</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all ${
                  activeSection === section.id 
                    ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/20' 
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {section.label}
                {activeSection === section.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">
          <div className="space-y-8">
            {activeSection === 'personalization' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <GlassPanel className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-display font-bold mb-2 flex items-center gap-2">
                        <Brain size={20} className="text-brand-violet" />
                        AI Extraction Sensitivity
                      </h3>
                      <p className="text-sm text-white/50">Adjust how details Gemini interprets your voice pitch.</p>
                    </div>
                    <Zap size={24} className="text-voice-amber animate-pulse" />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/30">
                        <span>Literal (Concise)</span>
                        <span>Creative (Narrative)</span>
                      </div>
                      <input type="range" className="w-full accent-brand-violet h-2 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Default Tone of Voice</h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {['Confident', 'Humble', 'Tech-Native', 'Executive'].map(tone => (
                          <button key={tone} className="p-3 min-h-[44px] rounded-xl bg-white/5 border border-white/5 text-xs font-bold hover:border-brand-violet/30 hover:bg-brand-violet/5 transition-all">
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassPanel>

                <Card variant="glass" className="p-8">
                  <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                    <Globe size={20} className="text-brand-violet" />
                    Target Industry Bias
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-white/50">Gemini will prioritize keywords and skills relevant to these areas.</p>
                    <div className="flex flex-wrap gap-2">
                      {['SaaS', 'Fintech', 'AI/ML', 'Web3', 'HealthTech', 'E-commerce'].map(tag => (
                        <button key={tag} className="px-4 py-2.5 min-h-[44px] rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-brand-violet transition-colors">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeSection === 'themes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {['The Voyager', 'The minimalist', 'Neon Architect', 'The Executive'].map((theme, idx) => (
                  <Card key={theme} variant="glass" className="p-0 overflow-hidden group cursor-pointer border-white/5 hover:border-brand-violet/40 transition-all">
                    <div className={`h-32 bg-gradient-to-br ${idx % 2 === 0 ? 'from-brand-violet/20 to-void-indigo' : 'from-voice-amber/20 to-void-indigo'} relative`}>
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm">Select Theme</Button>
                       </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-display font-bold mb-1">{theme}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Professional Style</p>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            <div className="flex justify-end pt-8 border-t border-white/5">
              <Button className="px-10 h-14 rounded-2xl shadow-glow">
                <Save size={18} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
