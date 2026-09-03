import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Mail, Mic2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/record';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage('');
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/record` } });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === 'sign-up' && !result.data.session) return setMessage('Check your inbox to verify your email, then sign in.');
    navigate(from, { replace: true });
  };

  const resetPassword = async () => {
    if (!supabase || !email) return setMessage('Enter your email address first.');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
    setLoading(false);
    setMessage(error ? error.message : 'Password reset email sent.');
  };

  if (!isSupabaseConfigured) {
    return <div className="mx-auto max-w-lg pt-12"><div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]"><h1 className="font-display text-3xl font-extrabold text-[var(--text)]">Authentication needs configuration</h1><p className="mt-4 leading-7 text-[var(--muted)]">Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`, then restart VoiceCV.</p></div></div>;
  }

  return <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1fr]">
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--hero)] p-8 sm:p-12"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--on-accent)]"><Mic2 size={24} /></div><p className="mt-8 text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">VoiceCV account</p><h1 className="mt-3 font-display text-4xl font-extrabold text-[var(--text)]">Your career work stays yours.</h1><p className="mt-5 leading-7 text-[var(--muted)]">Sign in to create, save, and access your career documents securely.</p></section>
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] sm:p-8"><div className="flex gap-2 rounded-2xl bg-[var(--surface)] p-1"><button onClick={() => setMode('sign-in')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${mode === 'sign-in' ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'text-[var(--muted)]'}`}>Sign in</button><button onClick={() => setMode('sign-up')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${mode === 'sign-up' ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'text-[var(--muted)]'}`}>Create account</button></div><form onSubmit={submit} className="mt-6 space-y-5"><Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /><Button className="w-full" size="lg" loading={loading} leftIcon={loading ? undefined : <KeyRound size={18} />}>{mode === 'sign-in' ? 'Sign in to VoiceCV' : 'Create account'}</Button></form><button type="button" onClick={resetPassword} disabled={loading} className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-bold text-[var(--accent)] hover:underline"><Mail size={15} />Reset password</button>{message && <p role="status" className="mt-4 rounded-xl bg-[var(--accent-soft)] p-3 text-sm text-[var(--text)]">{message}</p>}<p className="mt-6 text-center text-sm text-[var(--muted)]"><Link to="/" className="font-bold text-[var(--accent)] hover:underline">Return home</Link></p></section>
  </div>;
}
