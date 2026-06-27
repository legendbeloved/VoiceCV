import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ClipboardCheck, FileText, Linkedin, Mic2, Sparkles, Timer, Wand2, Target, Mail, Upload, Route, Users, Palette, Database } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';

interface LandingPageProps {
  onStart: () => void;
}

const flowSteps = [
  { icon: Mic2, title: 'Record your story', copy: 'Speak naturally for up to 60 seconds about your background, skills, wins, and next role.' },
  { icon: Wand2, title: 'Gemini extracts the signal', copy: 'Audio is transcribed, cleaned, and turned into structured career facts for the generator.' },
  { icon: ClipboardCheck, title: 'Use the documents', copy: 'Review the resume, cover letter, and LinkedIn bio, then copy or download the one you need.' },
];

const outputs = [
  { icon: FileText, title: 'ATS resume', copy: 'Structured sections, crisp bullets, keywords, and a role title that fits the story.' },
  { icon: Sparkles, title: 'Cover letter', copy: 'Personal, company-agnostic prose that job seekers can tailor quickly.' },
  { icon: Linkedin, title: 'LinkedIn bio', copy: 'A first-person profile summary designed to sound human and stay under 180 words.' },
];

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="w-full">
      <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--hero)] px-4 py-12 sm:px-6 lg:px-10 xl:px-14">
        <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_15%_20%,var(--accent-soft),transparent_34%),radial-gradient(circle_at_88%_22%,var(--warm-soft),transparent_30%),linear-gradient(135deg,transparent,rgba(255,255,255,0.04))]" />
        <div className="relative grid lg:grid-cols-[1fr_0.82fr] gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl mx-auto lg:mx-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
              <Timer size={14} className="text-[var(--accent)]" />
              60-second career documents
            </div>

            <h1 className="mt-6 font-display font-extrabold leading-[0.95] text-[var(--text)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              Speak once. Land the job.
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-7 lg:leading-8 text-[var(--muted)]">
              VoiceCV records your pitch, asks Gemini to transcribe and extract the useful career details, then generates a resume, cover letter, and LinkedIn bio without making you stare at a blank page.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={onStart} rightIcon={<ArrowRight size={20} />}>
                Record Your Story
              </Button>
              <Link to="/import">
                <Button size="lg" variant="secondary" leftIcon={<Upload size={18} />}>
                  Import Profile
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="relative mx-auto max-w-lg lg:max-w-none"
          >
            <Card padding="lg" className="relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 lg:pb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Live session</p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-display font-bold text-[var(--text)]">Career signal capture</h2>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center">
                  <Mic2 size={24} />
                </div>
              </div>

              <div className="py-8 lg:py-10">
                <div className="flex h-24 lg:h-28 items-center justify-center gap-1">
                  {Array.from({ length: 34 }).map((_, index) => (
                    <motion.span
                      key={index}
                      animate={{ height: [18, 38 + ((index * 13) % 54), 18] }}
                      transition={{ duration: 1.1 + (index % 5) * 0.13, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-1.5 rounded-full bg-[var(--accent)]"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['Transcript', 'Resume', 'LinkedIn'].map((item) => (
                  <div key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4 text-center">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">{item}</p>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-[var(--text)]">Ready</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24">
        <div className="mb-8 lg:mb-10 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">Simple flow</p>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[var(--text)]">Built for people who know what to say, not how to format it.</h2>
        </div>
        <div className="grid gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flowSteps.map((step) => (
            <Card key={step.title} padding="lg" hover>
              <step.icon size={28} className="text-[var(--accent)]" />
              <h3 className="mt-4 text-xl sm:text-2xl font-display font-bold text-[var(--text)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 lg:leading-7 text-[var(--muted)]">{step.copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="outputs" className="pb-16 sm:pb-20 lg:pb-24">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">MVP outputs</p>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[var(--text)]">Three documents. No login. No clutter.</h2>
            <p className="mt-4 leading-7 lg:leading-8 text-[var(--muted)]">
              The app stays focused on the core flow: record audio, generate career copy, then let the user edit, copy, download, or start over.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outputs.map((output) => (
              <Card key={output.title} variant="solid" padding="lg">
                <output.icon size={26} className="text-[var(--accent)]" />
                <h3 className="mt-4 text-lg sm:text-xl font-display font-bold text-[var(--text)]">{output.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{output.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="pb-16 sm:pb-20 lg:pb-24">
        <div className="mb-8 lg:mb-10 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">All Features</p>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[var(--text)]">Everything you need to land your next role.</h2>
          <p className="mt-4 text-[var(--muted)]">From voice recording to career path planning. Explore all the tools VoiceCV offers.</p>
        </div>
        <div className="grid gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, title: 'ATS Optimizer', copy: 'Compare your resume against job descriptions. Get keyword match scores and rewrite suggestions.', href: '/ats-optimizer' },
            { icon: Mail, title: 'Cover Letter AI', copy: 'Generate company-specific cover letters that mention the company mission and culture.', href: '/cover-letter' },
            { icon: Upload, title: 'Import Profile', copy: 'Bootstrap from LinkedIn, resume text, or PDF/Word files. AI parses everything automatically.', href: '/import' },
            { icon: Route, title: 'Career Path', copy: 'AI suggests career progression, skill gaps, and courses based on your experience.', href: '/career-path' },
            { icon: Users, title: 'Multi-Profile', copy: 'Save multiple profiles for different roles. Switch between them with different preferences.', href: '/profiles' },
            { icon: Database, title: 'Local Vault', copy: 'All your generated documents stored locally. Search, filter, and access anytime.', href: '/vault' },
            { icon: Palette, title: 'Themes', copy: 'Customize your documents with professional templates, color schemes, and layouts.', href: '/themes' },
            { icon: Users, title: 'Interview Prep', copy: 'Practice with an AI Hiring Manager that asks realistic questions based on your resume.', href: '/interview' },
          ].map((feature) => (
            <Link key={feature.title} to={feature.href}>
              <Card padding="lg" hover className="h-full">
                <feature.icon size={28} className="text-[var(--accent)]" />
                <h3 className="mt-4 text-lg sm:text-xl font-display font-bold text-[var(--text)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{feature.copy}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
