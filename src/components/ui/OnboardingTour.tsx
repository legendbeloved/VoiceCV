import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Mic2, FileText, Target, Briefcase, GraduationCap,
  ChevronRight, X, Check, Lightbulb, ArrowRight, Settings, Search
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
  contextualTarget?: string; // CSS selector for highlighting UI elements
}

const BASE_TOUR_STEPS: TourStep[] = [
  {
    title: "Speak once",
    description: "Record or type a short career story. VoiceCV turns it into a resume, a cover letter, and a LinkedIn bio.",
    tip: "You can replay this from Settings.",
    icon: <Mic2 size={40} />,
    color: "from-[var(--accent)] to-[var(--bg)]",
    action: "Next",
  },
  {
    title: "Check the story first",
    description: "Correct names and dates in the transcript, then create the documents. You can edit, rewrite, and tailor them afterward.",
    tip: "A job description helps the resume use the right words.",
    icon: <FileText size={40} />,
    color: "from-[var(--accent)] to-[var(--bg)]",
  },
  {
    title: "Keep each application",
    description: "Save a pack for a job, practice the interview, and open it again from the vault.",
    tip: "Free keeps one application. Premium keeps the rest.",
    icon: <Target size={40} />,
    color: "from-[var(--accent)] to-[var(--bg)]",
    action: "Start",
  },
];

const JOB_SEEKER_STEPS: TourStep[] = [
  ...BASE_TOUR_STEPS,
  {
    title: "Optimize for ATS",
    description: "Use the ATS Optimizer to match your resume with job descriptions and improve your chances of getting past automated systems.",
    tip: "Paste job descriptions to get keyword suggestions.",
    icon: <Search size={40} />,
    color: "from-green-500 to-[var(--bg)]",
  },
];

const CAREER_CHANGER_STEPS: TourStep[] = [
  ...BASE_TOUR_STEPS,
  {
    title: "Explore Career Paths",
    description: "Use the Career Path Explorer to discover new opportunities and understand the skills needed for your transition.",
    tip: "See skill gaps and get learning recommendations.",
    icon: <ArrowRight size={40} />,
    color: "from-blue-500 to-[var(--bg)]",
  },
];

const STUDENT_STEPS: TourStep[] = [
  ...BASE_TOUR_STEPS,
  {
    title: "Practice Interviews",
    description: "Use the Interview Simulator to practice common questions and get AI feedback on your responses.",
    tip: "Start with basic questions, then try advanced ones.",
    icon: <Mic2 size={40} />,
    color: "from-purple-500 to-[var(--bg)]",
  },
];

type UserGoal = 'job-seeker' | 'career-changer' | 'student' | null;

export function OnboardingTour() {
  const { hasSeenOnboarding, setHasSeenOnboarding, onboardingStep, setOnboardingStep } = useVoiceCVStore();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(onboardingStep || 0);
  const [userGoal, setUserGoal] = useState<UserGoal>(null);
  const [showGoalSelection, setShowGoalSelection] = useState(true);
  const [tourSteps, setTourSteps] = useState<TourStep[]>(BASE_TOUR_STEPS);

  useEffect(() => {
    if (window.localStorage.getItem('voicecv-onboarding-seen') === '1' || hasSeenOnboarding) return;
    const timer = setTimeout(() => setIsVisible(true), 900);
    return () => clearTimeout(timer);
  }, [hasSeenOnboarding]);

  useEffect(() => {
    const open = () => {
      setCurrentStep(0);
      setUserGoal(null);
      setShowGoalSelection(true);
      setIsVisible(true);
    };
    window.addEventListener('voicecv-open-tour', open);
    return () => window.removeEventListener('voicecv-open-tour', open);
  }, []);

  useEffect(() => {
    setOnboardingStep(currentStep);
  }, [currentStep, setOnboardingStep]);

  const handleGoalSelect = (goal: UserGoal) => {
    setUserGoal(goal);
    setShowGoalSelection(false);
    
    // Set tour steps based on goal
    switch (goal) {
      case 'job-seeker':
        setTourSteps(JOB_SEEKER_STEPS);
        break;
      case 'career-changer':
        setTourSteps(CAREER_CHANGER_STEPS);
        break;
      case 'student':
        setTourSteps(STUDENT_STEPS);
        break;
      default:
        setTourSteps(BASE_TOUR_STEPS);
    }
    
    // Save user preference
    window.localStorage.setItem('voicecv-user-goal', goal || 'default');
  };

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
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

  const finish = () => {
    window.localStorage.setItem('voicecv-onboarding-seen', '1');
    setHasSeenOnboarding(true);
    setIsVisible(false);
  };

  const handleComplete = () => finish();
  const handleSkip = () => finish();

  const step = tourSteps[currentStep];
  const isLast = currentStep === tourSteps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-void-indigo/85 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="tour-title">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl"
          >
            {showGoalSelection ? (
              <GlassPanel className="p-0 overflow-hidden border-white/10 shadow-[0_32px_128px_-16px_rgba(124,58,237,0.3)]">
                <div className="h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--bg)] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white relative z-10"
                  >
                    <Sparkles size={48} />
                  </motion.div>
                  
                  <button 
                    onClick={handleSkip}
                    aria-label="Close onboarding tour"
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 sm:p-8 text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-[var(--text)]">
                      Welcome to VoiceCV
                    </h2>
                    <p className="text-[var(--muted)] leading-relaxed max-w-md mx-auto text-sm sm:text-base">
                      Let's personalize your experience. What's your primary goal?
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleGoalSelect('job-seeker')}
                      className="w-full p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-violet/10 group-hover:bg-brand-violet/20 transition-colors">
                          <Briefcase size={24} className="text-brand-violet" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text)]">I'm looking for a job</h3>
                          <p className="text-xs text-[var(--muted)]">Get ATS-optimized resumes and cover letters</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleGoalSelect('career-changer')}
                      className="w-full p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                          <ArrowRight size={24} className="text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text)]">I'm changing careers</h3>
                          <p className="text-xs text-[var(--muted)]">Explore new paths and bridge skill gaps</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleGoalSelect('student')}
                      className="w-full p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                          <GraduationCap size={24} className="text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text)]">I'm a student</h3>
                          <p className="text-xs text-[var(--muted)]">Practice interviews and build your first resume</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <Button 
                    onClick={() => handleGoalSelect(null)}
                    variant="ghost"
                    className="w-full h-10 rounded-xl text-sm text-[var(--muted)]"
                  >
                    Skip and use default tour
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-[var(--border)] p-4">
                  <Sparkles size={12} className="text-[var(--accent)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">VoiceCV</span>
                </div>
              </GlassPanel>
            ) : (
              <GlassPanel className="p-0 overflow-hidden border-white/10 shadow-[0_32px_128px_-16px_rgba(124,58,237,0.3)]">
                <div className={`h-44 sm:h-56 bg-gradient-to-br ${step.color} flex items-center justify-center relative`}>
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
                    aria-label="Close onboarding tour"
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold">
                    {currentStep + 1} / {tourSteps.length}
                  </div>
                  <div className="absolute bottom-0 left-0 h-1.5 bg-white/25 w-full"><div className="h-full bg-white transition-all duration-500" style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }} /></div>
                </div>

                <div className="p-6 sm:p-8 text-center space-y-5">
                  <div className="space-y-2">
                    <motion.h2 
                      key={`title-${currentStep}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      id="tour-title"
                      className="text-2xl sm:text-3xl font-display font-black tracking-tight text-[var(--text)]"
                    >
                      {step.title}
                    </motion.h2>
                    <motion.p 
                      key={`desc-${currentStep}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[var(--muted)] leading-relaxed max-w-md mx-auto text-sm sm:text-base"
                    >
                      {step.description}
                    </motion.p>
                  </div>

                  {step.tip && (
                    <motion.div
                      key={`tip-${currentStep}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left"
                    >
                      <Lightbulb size={16} className="text-voice-amber shrink-0 mt-0.5" />
                      <p className="text-xs text-[var(--muted)] leading-relaxed">{step.tip}</p>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 pt-2">
                    {tourSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        aria-label={`Go to step ${i + 1}: ${tourSteps[i].title}`}
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
                      <Button variant="ghost" onClick={handleSkip} className="flex-1 h-10 rounded-xl text-sm text-[var(--muted)]">
                        Skip tour
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-[var(--border)] p-4">
                  <Sparkles size={12} className="text-[var(--accent)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">VoiceCV</span>
                </div>
              </GlassPanel>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
