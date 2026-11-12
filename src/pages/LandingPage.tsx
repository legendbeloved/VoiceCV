import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ClipboardCheck, FileText, Linkedin, Mic2, Sparkles, Wand2, Target, Mail, Route, Users, Palette, Database, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';

interface LandingPageProps {
  onStart: () => void;
}

const flowSteps = [
  { icon: Mic2, title: 'Record your story', copy: 'Speak naturally for up to 60 seconds, or 3 minutes on Premium, about your background, skills, wins, and next role.' },
  { icon: Wand2, title: 'VoiceCV extracts the signal', copy: 'Audio is transcribed, cleaned, and turned into structured career facts for the generator.' },
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

            <h1 className="mt-6 font-display font-extrabold leading-[0.95] text-[var(--text)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              Speak once. Land the job.
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-7 lg:leading-8 text-[var(--muted)]">
              VoiceCV records your pitch, extracts the useful career details, then generates a resume, cover letter, and LinkedIn bio without making you stare at a blank page.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={onStart}
                className="rounded-full px-6 normal-case tracking-normal"
                leftIcon={<Mic2 size={18} />}
                rightIcon={<ArrowRight size={18} />}
              >
                Record your story
              </Button>
              <Link to="/import">
                <Button size="lg" variant="secondary" className="rounded-full px-6" leftIcon={<Upload size={18} />}>
                  Import profile
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

              <div className="py-8 lg:py-10 overflow-hidden">
                <div className="flex h-24 lg:h-28 items-center justify-center gap-1">
                  {Array.from({ length: 34 }).map((_, index) => (
                    <motion.span
                      key={index}
                      animate={{ height: [18, 38 + ((index * 13) % 54), 18] }}
                      transition={{ duration: 1.1 + (index % 5) * 0.13, repeat: Infinity, ease: 'easeInOut' }}
                      className={`w-1.5 rounded-full bg-[var(--accent)] ${index > 18 ? 'hidden sm:block' : ''}`}
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

          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[var(--text)]">After you have a profile</h2>
          <p className="mt-4 text-[var(--muted)]">Record or import first. These tools tailor, practice, and store the documents that come back.</p>
        </div>
        <div className="grid gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Target, title: 'ATS Optimizer', copy: 'Compare your resume against a job description and see which keywords are present or missing.', href: '/ats-optimizer' },
            { icon: Mail, title: 'Cover Letter AI', copy: 'Write a letter for a named company once the resume exists.', href: '/cover-letter' },
            { icon: Route, title: 'Career Path', copy: 'See nearby roles, skill gaps, and courses based on the story you already told.', href: '/career-path' },
            { icon: Users, title: 'Profiles', copy: 'Keep a separate profile for each role you are aiming at.', href: '/profiles' },
            { icon: Database, title: 'Vault', copy: 'Search saved documents by name or role and open them again.', href: '/vault' },
            { icon: Palette, title: 'Themes and interview', copy: 'Style the resume, then practice questions drawn from it.', href: '/interview' },
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
