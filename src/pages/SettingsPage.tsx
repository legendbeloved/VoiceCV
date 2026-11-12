import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlanStore } from '../store/usePlanStore';
import { Shield, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { clearVoiceDraft, readVoiceDefaults, useVoiceCVStore, writeVoiceDefaults } from '../store/useVoiceCVStore';
import type { ResumeTemplate, ToneStyle } from '../lib/gemini';

const tones: Array<{ id: ToneStyle; label: string; description: string }> = [
  { id: 'professional', label: 'Professional', description: 'Clear and recruiter-friendly.' },
  { id: 'warm', label: 'Warm', description: 'Approachable and human.' },
  { id: 'executive', label: 'Executive', description: 'Concise and strategic.' },
  { id: 'confident', label: 'Confident', description: 'Energetic and achievement-led.' },
  { id: 'creative', label: 'Creative', description: 'Memorable, still polished.' },
];

const templates: Array<{ id: ResumeTemplate; label: string }> = [
  { id: 'ats', label: 'Classic ATS' },
  { id: 'modern', label: 'Modern' },
  { id: 'executive', label: 'Executive' },
  { id: 'creative', label: 'Creative' },
];

const sections = [
  { id: 'defaults', label: 'Writing defaults' },
  { id: 'account', label: 'Account' },
  { id: 'privacy', label: 'Privacy' },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { tone, resumeTemplate, setTone, setResumeTemplate } = useVoiceCVStore();
  const plan = usePlanStore((state) => state.plan);
  const [section, setSection] = useState('defaults');
  const [notice, setNotice] = useState('');

  const updateTone = (next: ToneStyle) => {
    setTone(next);
    writeVoiceDefaults(next, useVoiceCVStore.getState().resumeTemplate);
    setNotice('Default tone saved. The next story uses it.');
  };

  const updateTemplate = (next: ResumeTemplate) => {
    setResumeTemplate(next);
    writeVoiceDefaults(useVoiceCVStore.getState().tone, next);
    setNotice('Default template saved. The next story uses it.');
  };

  const sendPasswordReset = async () => {
    if (!user?.email || !supabase) {
      setNotice('Sign in with email before resetting a password.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/login` });
    setNotice(error ? error.message : 'Password reset instructions were sent to your email.');
  };

  const saved = readVoiceDefaults();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--text)] sm:text-4xl">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Changes save as you make them.</p>
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col" aria-label="Settings sections">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={section === item.id ? 'page' : undefined}
              onClick={() => setSection(item.id)}
              className={`shrink-0 whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-bold lg:whitespace-normal ${section === item.id ? 'bg-[var(--accent-soft)] text-[var(--text)]' : 'text-[var(--muted)] hover:bg-[var(--surface)]'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {notice && <p role="status" className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--text)]">{notice}</p>}

        {section === 'defaults' && (
          <Card variant="solid" padding="lg" className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--text)]">Writing defaults</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">These are the tone and resume template selected when you start a new story. Current saved defaults are {saved.tone} and {saved.resumeTemplate}.</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Tone</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tones.map((item) => (
                  <button key={item.id} type="button" aria-pressed={tone === item.id} onClick={() => updateTone(item.id)} className={`rounded-2xl border px-4 py-3 text-left text-sm ${tone === item.id ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                    <span className="block font-bold">{item.label}</span>
                    <span className="mt-1 block text-xs">{item.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Resume template</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {templates.map((item) => (
                  <button key={item.id} type="button" aria-pressed={resumeTemplate === item.id} onClick={() => updateTemplate(item.id)} className={`rounded-full border px-4 py-2 text-sm font-bold ${resumeTemplate === item.id ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-[var(--muted)]">Resume paper color and type live on the <Link className="font-bold text-[var(--accent)]" to="/themes">Themes</Link> page. This browser is on the {plan} plan. Application packs, voice interviews, and themed files are on the <Link className="font-bold text-[var(--accent)]" to="/upgrade">Premium</Link> page.</p>
            <Button variant="secondary" onClick={() => { window.localStorage.removeItem('voicecv-onboarding-seen'); window.dispatchEvent(new Event('voicecv-open-tour')); }}>Replay the intro</Button>
          </Card>
        )}

        {section === 'account' && (
          <Card variant="solid" padding="lg" className="space-y-5">
            <div className="flex items-center gap-3">
              <User size={20} className="text-[var(--accent)]" />
              <h2 className="font-display text-2xl font-bold text-[var(--text)]">Account</h2>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Email</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text)]">{user?.email || 'No email available'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Status</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text)]">{user?.email_confirmed_at ? 'Email verified' : 'Email verification pending'}</p>
            </div>
            <Button variant="ghost" onClick={() => void signOut()}>Sign out</Button>
          </Card>
        )}

        {section === 'privacy' && (
          <Card variant="solid" padding="lg" className="space-y-5">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-[var(--accent)]" />
              <h2 className="font-display text-2xl font-bold text-[var(--text)]">Privacy</h2>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <h3 className="font-display font-bold text-[var(--text)]">Password</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">A reset link goes to the email on this account.</p>
              <Button className="mt-4" variant="secondary" onClick={() => void sendPasswordReset()}>Send password reset email</Button>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <h3 className="font-display font-bold text-[var(--text)]">Local draft</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">The draft stores your role, job description, tone, template, and transcript in this browser. Vault documents on your account stay in place.</p>
              <Button className="mt-4" variant="secondary" onClick={() => { clearVoiceDraft(); setNotice('Local draft deleted from this browser.'); }}>Delete local draft</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
