import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { usePlanStore } from '../store/usePlanStore';

const freeItems = [
  'One 60-second story',
  'Resume, cover letter, and LinkedIn bio',
  'One saved application and one profile',
  'One tailor, one rewrite, and one ATS line',
  'Two career-path roles',
  'Plain PDF and Word, with a small VoiceCV footer',
  'Text mock interview',
];

const premiumItems = [
  '3-minute story, extra takes, and spoken gap answers',
  'Unlimited applications, profiles, and older vault documents',
  'Unlimited tailors, rewrites, and ATS line updates',
  'Full career shortlist',
  'Company brief, follow-up email, and thank-you note',
  'Interview questions from the job, plus a scored debrief',
  'Themed resume files and clean exports',
  'Public portfolio link and document translation',
];

export function UpgradePage() {
  const navigate = useNavigate();
  const { plan, offer, passExpiresAt, setOffer } = usePlanStore();
  const passLabel = passExpiresAt ? new Date(passExpiresAt).toLocaleDateString() : '';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header>
        <h1 className="font-display text-4xl font-extrabold text-[var(--text)] sm:text-5xl">Premium</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">Free covers the first story and one application. Premium is for people sending that story to more than one job. Billing is not connected yet, so the choice is stored in this browser.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="solid" padding="lg" className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[var(--text)]">Free</h2>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {freeItems.map((item) => <li key={item} className="flex gap-2"><Check size={16} className="mt-0.5 text-[var(--accent)]" />{item}</li>)}
          </ul>
          {plan === 'free' && <p className="text-sm font-bold text-[var(--text)]">This browser is on Free.</p>}
        </Card>
        <Card variant="solid" padding="lg" className="space-y-4 ring-2 ring-[var(--accent)]">
          <h2 className="font-display text-2xl font-bold text-[var(--text)]">Premium</h2>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {premiumItems.map((item) => <li key={item} className="flex gap-2"><Check size={16} className="mt-0.5 text-[var(--accent)]" />{item}</li>)}
          </ul>
          {plan === 'premium' ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[var(--text)]">
                {offer === 'pass' ? `30-day pass is active until ${passLabel}.` : 'This browser is on monthly Premium.'}
              </p>
              <Button variant="secondary" onClick={() => { setOffer('free'); navigate('/record'); }}>Switch this browser back to Free</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button onClick={() => { setOffer('pass'); navigate('/record'); }}>Start a 30-day pass</Button>
              <Button variant="secondary" onClick={() => { setOffer('monthly'); navigate('/record'); }}>Use monthly Premium on this browser</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
