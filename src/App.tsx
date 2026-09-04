import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { PageWrapper } from './components/ui/PageWrapper';
import { ToastContainer } from './components/ui/Toast';
import { LandingPage } from './pages/LandingPage';
import { RecordPage } from './pages/RecordPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultsPage } from './pages/ResultsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useVoiceCVStore } from './store/useVoiceCVStore';
import { ProcessingStep } from './store/useVoiceCVStore';
import { processVoiceToDocuments, ResumeTemplate, ToneStyle } from './lib/gemini';
import { supabase } from './lib/supabase';
import { OnboardingTour } from './components/ui/OnboardingTour';
import ATSOptimizerPage from './pages/ATSOptimizerPage';
import CoverLetterPage from './pages/CoverLetterPage';
import ImportPage from './pages/ImportPage';
import CareerPathPage from './pages/CareerPathPage';
import ProfilesPage from './pages/ProfilesPage';
import ThemesPage from './pages/ThemesPage';
import PortfolioPage from './pages/PortfolioPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import { InterviewSimulatorPage } from './pages/InterviewSimulatorPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth } from './auth/RequireAuth';
import { useAuth } from './auth/AuthProvider';
import { saveGeneratedCareerSession } from './lib/careerData';

export type ThemeMode = 'light' | 'dark';

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useVoiceCVStore();
  const setProcessingStep = store.setProcessingStep;
  const setTranscript = store.setTranscript;
  const setAssets = store.setAssets;
  const reset = store.reset;
  const { setAssets: setStoreAssets, setProcessingStep: setStoreProcessingStep, setTranscript: setStoreTranscript } = store;
  const [toasts, setToasts] = useState<any[]>([]);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Read theme from Supabase user_profiles first, fallback to prefers-color-scheme
    if (user?.id) {
      // Will be set after supabase initialized - use localStorage as fallback
      const savedTheme = window.localStorage.getItem('voicecv-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    }
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    const setThemeFromSupabase = async () => {
      if (!user?.id) return;
      try {
        if (supabase) {
          const { data } = await supabase
            .from('user_profiles')
            .select('preferred_theme')
            .eq('user_id', user.id)
            .single();
          if (data?.preferred_theme && ['light', 'dark'].includes(data.preferred_theme)) {
            setTheme(data.preferred_theme as ThemeMode);
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme from Supabase', error);
      }
    };

    // Initialize on mount
    setThemeFromSupabase();

    // Listen for auth state changes
    const { data: listener } = supabase?.auth?.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user?.id) {
        void setThemeFromSupabase();
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, [user?.id, supabase]);

  // Save theme to Supabase and localStorage whenever it changes
  useEffect(() => {
    // Save to localStorage (fallback)
    window.localStorage.setItem('voicecv-theme', theme);

    // Save to Supabase if user is logged in
    if (user?.id && supabase) {
      supabase.from('user_profiles').upsert({
        user_id: user.id,
        preferred_theme: theme,
        updated_at: new Date().toISOString(),
      }).then(() => {
        // upsert successful
      });
    }

    // Apply theme classes to HTML element
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#101522' : '#F7F3EA',
    );
  }, [theme, user?.id, supabase]);

  const addToast = (message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleReset = () => {
    reset();
    navigate('/');
  };

  const handleSubmitTranscription = async (payload: {
    audioBlob: Blob | null;
    transcriptHint: string;
    jobDescription: string;
    tone: ToneStyle;
    resumeTemplate: ResumeTemplate;
  }) => {
    navigate('/processing');
    setProcessingStep('transcribing');
    
    let interval: any;
    const steps: ProcessingStep[] = ['transcribing', 'understanding', 'resume', 'coverLetter', 'linkedin', 'complete'];
    let stepIndex = 0;

    interval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        setProcessingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 2000);

    try {
      const jobRole = store.jobRole;
      const result = await processVoiceToDocuments({
        audioBlob: payload.audioBlob,
        transcriptHint: payload.transcriptHint,
        targetRole: jobRole,
        jobDescription: payload.jobDescription,
        tone: payload.tone,
        resumeTemplate: payload.resumeTemplate,
      });
      clearInterval(interval);
      setProcessingStep('complete');
      setTranscript(result.transcript);
      setAssets(result);
      if (user) {
        void saveGeneratedCareerSession({ userId: user.id, name: result.name || 'My Profile', role: result.role || 'Professional', tone: payload.tone, resumeTemplate: payload.resumeTemplate, jobDescription: payload.jobDescription, transcript: result.transcript, visualTheme: window.localStorage.getItem('voicecv-resume-theme') || 'voyager', assets: result }).catch((saveError) => console.error('Unable to save VoiceCV data:', saveError));
      }
      
      setTimeout(() => {
        navigate('/results');
      }, 1000);
    } catch (error) {
      clearInterval(interval);
      const isParsingError = error instanceof SyntaxError;
      const message = isParsingError 
        ? 'AI returned malformed data. Please try again.' 
        : error instanceof Error && error.message.includes('API key')
          ? 'VoiceCV AI configuration is missing. Add GEMINI_API_KEY to .env.local and restart the dev server.'
          : 'AI processing failed. Please check your connection or try again.';
      addToast(message, 'error');
      navigate('/record');
    }
  };

  return (
    <div className={`app-shell theme-${theme} flex flex-col min-h-screen selection:bg-brand-violet/30`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <OnboardingTour />

      <Navbar
        onLogoClick={handleReset}
        theme={theme}
        onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
      />
      
      <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        <PageWrapper>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage onStart={() => navigate('/record')} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/record" element={<RecordPage onSubmit={handleSubmitTranscription} />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/results" element={<ResultsPage onReset={handleReset} onToast={addToast} />} />
              <Route path="/profiles" element={<RequireAuth><ProfilesPage onToast={addToast} /></RequireAuth>} />
              <Route path="/ats-optimizer" element={<ATSOptimizerPage onToast={addToast} />} />
              <Route path="/cover-letter" element={<CoverLetterPage onToast={addToast} />} />
              <Route path="/import" element={<ImportPage onToast={addToast} />} />
              <Route path="/career-path" element={<CareerPathPage onToast={addToast} />} />
              <Route path="/themes" element={<RequireAuth><ThemesPage /></RequireAuth>} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/portfolio/:id" element={<PortfolioPage />} />
              <Route path="/vault" element={<RequireAuth><VaultPage /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
              <Route path="/interview" element={<InterviewSimulatorPage onToast={addToast} />} />
              <Route path="*" element={<NotFoundPage onBack={handleReset} />} />
            </Routes>
          </ErrorBoundary>
        </PageWrapper>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}