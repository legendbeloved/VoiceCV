import React, { useEffect, useMemo, useState } from 'react';
import { Database, FileText, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../auth/AuthProvider';
import { deleteCareerProfile, loadCareerProfiles } from '../lib/careerData';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { ApplicationStatus, usePackStore } from '../store/usePackStore';
import { usePlanStore } from '../store/usePlanStore';
import type { CareerAssets } from '../lib/gemini';

interface SavedProfile {
  id: string;
  name: string;
  role: string;
  date: string;
  score: number;
  assets: CareerAssets | null;
  transcript: string;
  jobDescription: string;
  hasResume: boolean;
  hasLetter: boolean;
  hasBio: boolean;
}

type SortKey = 'newest' | 'score' | 'name';

export default function VaultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setAssets, setJobRole, setJobDescription, setTranscript, setCompanyName, pushVersion } = useVoiceCVStore();
  const { packs, setStatus, setActive } = usePackStore();
  const plan = usePlanStore((state) => state.plan);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [items, setItems] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    void loadCareerProfiles(user.id)
      .then((profiles) => setItems((profiles || []).map((profile: any) => ({
        id: profile.id,
        name: profile.name || 'Untitled profile',
        role: profile.role || 'Role not set',
        date: profile.updated_at || profile.created_at || '',
        score: profile.assets?.resumeScore?.overall || 0,
        assets: profile.assets || null,
        transcript: profile.transcript || profile.assets?.transcript || '',
        jobDescription: profile.job_description || '',
        hasResume: Boolean(profile.assets?.resume),
        hasLetter: Boolean(profile.assets?.coverLetter),
        hasBio: Boolean(profile.assets?.linkedinBio),
      }))))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load saved documents.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matched = items.filter((item) => !query || item.role.toLowerCase().includes(query) || item.name.toLowerCase().includes(query));
    return matched.sort((a, b) => {
      if (sortKey === 'score') return b.score - a.score;
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [items, searchQuery, sortKey]);

  const visibleItems = plan === 'premium' ? filteredItems : filteredItems.slice(0, 1);
  const hiddenDocuments = plan === 'premium' ? 0 : Math.max(0, filteredItems.length - visibleItems.length);
  const visiblePacks = plan === 'premium' ? packs : packs.slice(0, 1);
  const hiddenPacks = plan === 'premium' ? 0 : Math.max(0, packs.length - visiblePacks.length);

  const openItem = (item: SavedProfile) => {
    if (!item.assets) return;
    setAssets(item.assets);
    setJobRole(item.role);
    setJobDescription(item.jobDescription);
    setTranscript(item.transcript);
    pushVersion('Opened from vault');
    navigate('/results');
  };

  const removeItem = async (item: SavedProfile) => {
    if (!user?.id) return;
    try {
      await deleteCareerProfile(item.id, user.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete that document.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Database size={24} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold text-[var(--text)] sm:text-4xl">Vault</h1>
            <p className="text-sm text-[var(--muted)]">Every document set saved to your account. Open one to edit it again.</p>
          </div>
        </div>
        <Button onClick={() => navigate('/record')}>New story</Button>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-[var(--text)]">Applications</h2>
        {packs.length === 0 && <p className="text-sm text-[var(--muted)]">Save an application from Results or a career-path role. Free keeps one. Premium keeps a board.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {visiblePacks.map((pack) => (
            <Card key={pack.id} variant="solid" className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--text)]">{pack.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{pack.company || pack.role}</p>
                </div>
                <Badge>{pack.matchScore ?? '—'} match</Badge>
              </div>
              {pack.interviewDebrief && <p className="text-sm text-[var(--muted)]">Interview clarity {pack.interviewDebrief.clarity}, evidence {pack.interviewDebrief.evidence}</p>}
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]" htmlFor={`status-${pack.id}`}>Status</label>
              <select id={`status-${pack.id}`} value={pack.status} onChange={(event) => setStatus(pack.id, event.target.value as ApplicationStatus)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)]">
                <option value="draft">Draft</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
              </select>
              <Button size="sm" onClick={() => {
                setJobRole(pack.role);
                setJobDescription(pack.jobDescription);
                setCompanyName(pack.company);
                setTranscript('');
                setAssets({
                  transcript: '',
                  resume: pack.resume,
                  coverLetter: pack.coverLetter,
                  linkedinBio: pack.linkedinBio,
                  strengths: [],
                  keywords: pack.matchedKeywords,
                  resumeScore: { overall: pack.matchScore || 0, clarity: 0, atsKeywords: pack.matchScore || 0, impact: 0, completeness: 0, notes: [] },
                  missingInfoPrompts: [],
                  name: pack.name,
                  role: pack.role,
                  extracted: { skills: pack.matchedKeywords, experience: [], education: [], achievements: [] },
                  contactInfo: { email: '', phone: '', location: '' },
                });
                setActive(pack.id);
                pushVersion(`Opened ${pack.name}`);
                navigate('/results');
              }}>Open</Button>
            </Card>
          ))}
        </div>
        {hiddenPacks > 0 && <p className="text-sm text-[var(--muted)]">{hiddenPacks} more application{hiddenPacks === 1 ? '' : 's'} stay on Premium.</p>}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
          <input
            type="search"
            aria-label="Search saved documents"
            placeholder="Search by name or role"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] py-4 pl-12 pr-4 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex gap-2" role="group" aria-label="Sort saved documents">
          {([
            ['newest', 'Newest'],
            ['score', 'Highest score'],
            ['name', 'Name'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={sortKey === id}
              onClick={() => setSortKey(id)}
              className={`rounded-2xl border px-4 py-3 text-xs font-bold ${sortKey === id ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-48 animate-pulse rounded-3xl bg-[var(--surface)]" />)}
        </div>
      )}
      {error && <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-[var(--text)]" role="alert">{error}</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--text)]">Nothing saved yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">Generate documents while signed in and they will appear here with their score.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => navigate('/record')}>Record a story</Button>
            <Button variant="secondary" onClick={() => navigate('/import')}>Import a resume</Button>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && filteredItems.length === 0 && (
        <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">No documents match “{searchQuery}”.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleItems.map((item) => (
          <Card key={item.id} variant="solid" className="flex h-full flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--accent)]">
                <FileText size={20} />
              </div>
              <Badge>{item.score > 0 ? `${item.score} score` : 'Not scored'}</Badge>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--text)]">{item.name}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.role}</p>
              {item.date && <p className="mt-2 text-xs text-[var(--muted)]">Saved {new Date(item.date).toLocaleString()}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.hasResume && <Badge variant="outline">Resume</Badge>}
              {item.hasLetter && <Badge variant="outline">Cover letter</Badge>}
              {item.hasBio && <Badge variant="outline">LinkedIn</Badge>}
            </div>
            {pendingDelete === item.id ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm text-[var(--text)]">Delete {item.name} from the vault?</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => void removeItem(item)}>Delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPendingDelete(null)}>Keep</Button>
                </div>
              </div>
            ) : (
              <div className="mt-auto flex gap-2">
                <Button className="flex-1" onClick={() => openItem(item)} disabled={!item.assets}>Open</Button>
                <Button variant="ghost" aria-label={`Delete ${item.name}`} onClick={() => setPendingDelete(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      {hiddenDocuments > 0 && (
        <p className="text-sm text-[var(--muted)]">{hiddenDocuments} older document{hiddenDocuments === 1 ? '' : 's'} stay on Premium. Free keeps the newest one.</p>
      )}
    </div>
  );
}
