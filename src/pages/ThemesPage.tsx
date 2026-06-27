import React from 'react';
import { motion } from 'motion/react';
import { Palette, Check, Sparkles, Layout, Grid, Layers, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GlassPanel } from '../components/ui/GlassPanel';

const THEMES = [
  {
    id: 'voyager',
    name: 'The Voyager',
    description: 'A modern, space-inspired theme with deep indigo accents and sharp typography.',
    colors: ['#7C3AED', '#0D0B1F', '#F59E0B'],
    previewClass: 'bg-void-indigo',
    premium: false
  },
  {
    id: 'minimalist',
    name: 'The Minimalist',
    description: 'Clean, distraction-free layout with a focus on whitespace and readability.',
    colors: ['#000000', '#FFFFFF', '#94A3B8'],
    previewClass: 'bg-white text-black',
    premium: false
  },
  {
    id: 'neon',
    name: 'Neon Architect',
    description: 'Cyberpunk-inspired high-contrast theme for creative and tech-heavy roles.',
    colors: ['#06B6D4', '#000000', '#F472B6'],
    previewClass: 'bg-black border-cyan-500/50',
    premium: true
  },
  {
    id: 'executive',
    name: 'The Executive',
    description: 'Traditional, trustworthy layout with serif headers and gold accents.',
    colors: ['#1E293B', '#F1F5F9', '#B45309'],
    previewClass: 'bg-slate-900 border-amber-600/30',
    premium: true
  }
];

export default function ThemesPage() {
  const currentThemeId = 'voyager'; // Fallback to current

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
      <header className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.5 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-16 h-16 bg-brand-violet/20 rounded-3xl flex items-center justify-center text-brand-violet mx-auto mb-6"
        >
          <Palette size={32} />
        </motion.div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase">Visual Identity</h1>
        <p className="text-white/40 text-sm font-bold tracking-[0.4em] uppercase">Resume Themes Gallery</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {THEMES.map((theme, idx) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassPanel className="p-0 overflow-hidden group border-white/10 hover:border-brand-violet/50 transition-all shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-5 h-full min-h-[340px]">
                {/* Preview Thumbnail */}
                <div className={`md:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden ${theme.previewClass}`}>
                   <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                   
                   <div className="space-y-4 relative z-10">
                      <div className="w-12 h-2 bg-current opacity-20 rounded-full" />
                      <div className="w-full h-1 bg-current opacity-10 rounded-full" />
                      <div className="w-3/4 h-1 bg-current opacity-10 rounded-full" />
                      <div className="pt-4 space-y-2">
                        <div className="w-full h-16 bg-current opacity-5 rounded-lg" />
                        <div className="w-full h-16 bg-current opacity-5 rounded-lg" />
                      </div>
                   </div>

                   <div className="flex gap-1 relative z-10">
                      {theme.colors.map(c => (
                        <div key={c} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                      ))}
                   </div>
                </div>

                {/* Info Section */}
                <div className="md:col-span-3 p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-void-indigo/40 lg:backdrop-blur-none">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-display font-black group-hover:text-brand-violet transition-colors">{theme.name}</h3>
                      {theme.premium && (
                        <Badge className="bg-voice-amber/10 text-voice-amber border-voice-amber/20 flex gap-1">
                          <Sparkles size={10} /> Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed mb-6 italic">
                      "{theme.description}"
                    </p>
                    
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                          <Layout size={14} /> Optimized Layout
                       </div>
                       <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                          <Grid size={14} /> Grid System V2
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Button 
                      variant={currentThemeId === theme.id ? 'secondary' : 'primary'}
                      className="flex-1"
                      disabled={currentThemeId === theme.id}
                    >
                      {currentThemeId === theme.id ? (
                        <span className="flex items-center gap-2"><Check size={16} /> Current</span>
                      ) : (
                        'Apply Theme'
                      )}
                    </Button>
                    <Button variant="ghost" className="p-3">
                       <Eye size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-16 sm:mt-24 lg:mt-32 p-6 sm:p-8 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-brand-violet/10 to-transparent border border-white/5 text-center"
      >
        <Layers size={40} className="text-brand-violet mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">Can't find the perfect style?</h2>
        <p className="text-white/40 max-w-xl mx-auto mb-8 text-sm sm:text-base">
          Our AI engine is constantly learning new professional aesthetics. Request a custom theme and Gemini will generate a unique visual language just for your profile.
        </p>
        <Button variant="secondary" className="px-8 sm:px-12 h-12 sm:h-14 rounded-2xl">
           Request Custom Theme
        </Button>
      </motion.div>
    </div>
  );
}
