import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Layers, Database, 
  MessageSquare, Palette, ChevronRight, 
  X, Check, Zap, Rocket, Mic2, FileText,
  Target, Mail, Upload, Route, Users,
  Lightbulb, Volume2
} from 'lucide-react';
import { Button } from './Button';
import { GlassPanel } from './GlassPanel';
import { useVoiceCVStore } from '../../store/useVoiceCVStore';

interface TourStep {
  title: string;
  description: string;
  tip: string;
  icon: React.ReactNode;
  color: string;
  action?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to VoiceCV",
    description: "The voice-native career engine that turns your 60-second pitch into professional documents. Let's walk you through the key features.",
    tip: "You can replay this tour anytime from Settings.",
    icon: <Rocket size={40} />,
    color: "from-brand-violet to-void-indigo",
    action: "Get Started",
  },
  {
    title: "Record Your Story",
    description: "Start by recording your career story. Speak naturally for up to 60 seconds about your background, skills, and goals. You can also type or paste your story.",
    tip: "Pro tip: Mention specific achievements and metrics for better results.",
    icon: <Mic2 size={40} />,
    color: "from-voice-amber to-brand-violet",
    action: "Try Recording",
  },
  {
    title: "AI-Powered Documents",
    description: "Gemini transcribes your voice, extracts career facts, and generates a resume, cover letter, and LinkedIn bio automatically.",
    tip: "You can edit, rewrite, and download all generated documents.",
    icon: <FileText size={40} />,
    color: "from-brand-violet to-emerald-500",
  },
  {
    title: "ATS Keyword Optimizer",
    description: "Compare your resume against any job description. Get a match score, discover missing keywords, and receive AI-powered rewrite suggestions.",
    tip: "Paste the job description before generating for the best ATS optimization.",
    icon: <Target size={40} />,
    color: "from-blue-500 to-brand-violet",
  },
  {
    title: "Personalized Cover Letters",
    description: "Generate company-specific cover letters that mention the company's mission, products, and culture. Each letter is tailored to the job description.",
    tip: "Adding the company name helps Gemini research and personalize the letter.",
    icon: <Mail size={40} />,
    color: "from-emerald-500 to-blue-500",
  },
  {
    title: "Multi-Profile Support",
    description: "Save multiple profiles for different roles like 'Frontend Developer' and 'Product Manager'. Switch between them with different tone and template preferences.",
    tip: "Create separate profiles for each job application for targeted results.",
    icon: <Users size={40} />,
    color: "from-fuchsia-500 to-brand-violet",
  },
  {
    title: "Import Your Profile",
    description: "Already have a LinkedIn profile or resume? Import it directly to bootstrap your VoiceCV. Supports text paste and file upload.",
    tip: "Importing saves time by pre-filling your career data.",
    icon: <Upload size={40} />,
    color: "from-cyan-500 to-brand-violet",
  },
  {
    title: "Career Path Suggestions",
    description: "AI analyzes your skills and experience to suggest career progression paths, identify skill gaps, and recommend courses and certifications.",
    tip: "Check back periodically as your skills grow for updated suggestions.",
    icon: <Route size={40} />,
    color: "from-voice-amber to-emerald-500",
  },
  {
    title: "Your Local Vault",
    description: "Every document you generate is saved in your Local Vault. Search, filter, and access your career history anytime.",
    tip: "Your data stays on your device - no cloud storage required.",
    icon: <Database size={40} />,
    color: "from-blue-500 to-brand-violet",
  },
  {
    title: "Interview Simulator",
    description: "Practice with an AI Hiring Manager that uses your actual resume context to ask realistic interview questions and provide feedback.",
    tip: "Use the STAR method (Situation, Task, Action, Result) for best answers.",
    icon: <MessageSquare size={40} />,
    color: "from-voice-amber to-brand-violet",
  },
  {
    title: "Visual Identity & Themes",
    description: "Customize your documents with professional themes. Choose from multiple templates, color schemes, and layouts.",
    tip: "Different themes work better for different industries.",
    icon: <Palette size={40} />,
    color: "from-fuchsia-500 to-brand-violet",
  },
  {
    title: "You're All Set!",
    description: "You now know all the features VoiceCV offers. Start recording your career story or explore any feature from the menu.",
    tip: "Bookmark VoiceCV for quick access to your career engine.",
    icon: <Sparkles size={40} />,
    color: "from-brand-violet to-emerald-500",
    action: "Start Creating",
  }
];

export function OnboardingTour() {
  const { hasSeenOnboarding, setHasSeenOnboarding, onboardingStep, setOnboardingStep } = useVoiceCVStore();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(onboardingStep || 0);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  useEffect(() => {
    setOnboardingStep(currentStep);
  }, [currentStep, setOnboardingStep]);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setHasSeenOnboarding(true);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setHasSeenOnboarding(true);
  };

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-void-indigo/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl"
          >
            <GlassPanel className="p-0 overflow-hidden border-white/10 shadow-[0_32px_128px_-16px_rgba(124,58,237,0.3)]">
              <div className={`h-48 sm:h-64 bg-gradient-to-br ${step.color} flex items-center justify-center relative`}>
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
                  onClick={handleSkip}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold">
                  {currentStep + 1} / {TOUR_STEPS.length}
                </div>
              </div>

              <div className="p-6 sm:p-8 text-center space-y-4">
                <div className="space-y-2">
                  <motion.h2 
                    key={`title-${currentStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl sm:text-3xl font-display font-black tracking-tight uppercase"
                  >
                    {step.title}
                  </motion.h2>
                  <motion.p 
                    key={`desc-${currentStep}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white/50 leading-relaxed max-w-md mx-auto text-sm sm:text-base"
                  >
                    {step.description}
                  </motion.p>
                </div>

                {step.tip && (
                  <motion.div
                    key={`tip-${currentStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-left"
                  >
                    <Lightbulb size={16} className="text-voice-amber shrink-0 mt-0.5" />
                    <p className="text-xs text-white/40 leading-relaxed">{step.tip}</p>
                  </motion.div>
                )}

                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {TOUR_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
                        i === currentStep ? 'w-8 bg-brand-violet' : i < currentStep ? 'w-3 bg-brand-violet/50' : 'w-2 bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <Button 
                    onClick={handleNext}
                    className="w-full h-12 rounded-2xl group text-base font-bold"
                  >
                    {isLast ? (
                      <span className="flex items-center justify-center gap-2">
                        {step.action || 'Get Started'} <Check size={18} />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {step.action || 'Next'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>

                  <div className="flex gap-2">
                    {!isFirst && (
                      <Button variant="ghost" onClick={handlePrev} className="flex-1 h-10 rounded-xl text-sm">
                        Back
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleSkip} className="flex-1 h-10 rounded-xl text-sm text-white/30">
                      Skip Tour
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-2">
                <Sparkles size={12} className="text-voice-amber" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
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
