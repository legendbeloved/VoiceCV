import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Layers, Database, 
  MessageSquare, Palette, ChevronRight, 
  X, Check, Zap, Rocket
} from 'lucide-react';
import { Button } from './Button';
import { GlassPanel } from './GlassPanel';
import { useVoiceCVStore } from '../../store/useVoiceCVStore';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to VoiceCV",
    description: "The world's first voice-native career engine. We turn your 60-second verbal pitch into high-impact professional documents.",
    icon: <Rocket size={40} />,
    color: "from-brand-violet to-void-indigo"
  },
  {
    title: "The Career Engine",
    description: "Start by recording your story. Our AI distillers extract keywords, achievements, and metrics that recruiters actually care about.",
    icon: <Layers size={40} />,
    color: "from-brand-violet to-emerald-500"
  },
  {
    title: "Your Local Vault",
    description: "Every document you generate is secured in your Local Vault. No clouds, no prying eyes—just your professional legacy.",
    icon: <Database size={40} />,
    color: "from-blue-500 to-brand-violet"
  },
  {
    title: "Interview Simulator",
    description: "Once your profile is ready, practice with our AI Hiring Manager. It uses your actual resume context to grill you with realistic questions.",
    icon: <MessageSquare size={40} />,
    color: "from-voice-amber to-brand-violet"
  },
  {
    title: "Visual Identity",
    description: "Personalize your profile with high-end themes. Transform your data into a stunning digital portfolio with a single click.",
    icon: <Palette size={40} />,
    color: "from-fuchsia-500 to-brand-violet"
  }
];

export function OnboardingTour() {
  const { hasSeenOnboarding, setHasSeenOnboarding } = useVoiceCVStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setHasSeenOnboarding(true);
    // You could sync to Firestore here if needed
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-void-indigo/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl"
          >
            <GlassPanel className="p-0 overflow-hidden border-white/10 shadow-[0_32px_128px_-16px_rgba(124,58,237,0.3)]">
              <div className={`h-64 bg-gradient-to-br ${step.color} flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-white relative z-10"
                >
                  {step.icon}
                </motion.div>
                
                <button 
                  onClick={handleComplete}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 text-center space-y-6">
                <div className="space-y-2">
                  <motion.h2 
                    key={`title-${currentStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-display font-black tracking-tight uppercase"
                  >
                    {step.title}
                  </motion.h2>
                  <motion.p 
                    key={`desc-${currentStep}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white/50 leading-relaxed max-w-md mx-auto"
                  >
                    {step.description}
                  </motion.p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {TOUR_STEPS.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === currentStep ? 'w-8 bg-brand-violet' : 'w-2 bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleNext}
                    className="w-full h-14 rounded-2xl group text-lg font-bold"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? (
                      <span className="flex items-center justify-center gap-2">
                        Get Started <Check size={20} />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Next Feature <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-2">
                <Sparkles size={14} className="text-voice-amber" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                  Powered by Gemini 3 Flash
                </span>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
