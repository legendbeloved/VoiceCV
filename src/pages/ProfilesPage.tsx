import React, { useEffect, useState } from 'react';
import { Briefcase, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../auth/AuthProvider';
import { deleteCareerProfile, loadCareerProfiles, saveCareerProfile, updateCareerProfile } from '../lib/careerData';
import type { CareerAssets, ResumeTemplate, ToneStyle } from '../lib/gemini';
import { usePlanStore } from '../store/usePlanStore';

const toneLabels: Record<ToneStyle, string> = { professional: 'Professional', warm: 'Warm', executive: 'Executive', confident: 'Confident', creative: 'Creative' };
const templateLabels: Record<ResumeTemplate, string> = { ats: 'Classic ATS', modern: 'Modern Compact', executive: 'Executive', creative: 'Creative' };

interface ProfileCard {
  id: string;
  name: string;
  role: string;
  tone: ToneStyle;
  resumeTemplate: ResumeTemplate;
  createdAt: string;
  source: 'browser' | 'account';
  assets: CareerAssets | null;
  transcript: string;
  jobDescription: string;
}

export default function ProfilesPage({ onToast }: { onToast: (msg: string, v: 'success' | 'error' | 'info') => void }) {
  const {
    profiles,
    activeProfileId,
    assets,
    createProfile,
    switchProfile,
    deleteProfile,
    updateProfile,
    setAssets,
    setJobRole,
    setJobDescription,
    setTranscript,
    pushVersion,
  } = useVoiceCVStore();
  const navigate = useNavigate();
  const plan = usePlanStore((state) => state.plan);
  const { user } = useAuth();
  const [cloudProfiles, setCloudProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setCloudProfiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void loadCareerProfiles(user.id)
      .then((rows) => setCloudProfiles((rows || []).map((profile: any) => ({
        id: profile.id,
        name: profile.name || 'Untitled profile',
        role: profile.role || 'Role not set',
        tone: profile.tone || 'professional',
        resumeTemplate: profile.resume_template || 'ats',
        createdAt: profile.updated_at || profile.created_at || new Date().toISOString(),
        source: 'account' as const,
        assets: profile.assets || null,
        transcript: profile.transcript || profile.assets?.transcript || '',
        jobDescription: profile.job_description || '',
      }))))
      .catch(() => onToast('Saved profiles could not be loaded.', 'error'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const browserProfiles: ProfileCard[] = profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    role: profile.role,
    tone: profile.tone,
    resumeTemplate: profile.resumeTemplate,
    createdAt: profile.createdAt,
    source: 'browser',
    assets: profile.assets,
    transcript: '',
    jobDescription: '',
  }));
  const allProfiles = [...browserProfiles, ...cloudProfiles];

  const handleCreate = async () => {
    if (!newName.trim() || !newRole.trim()) {
      onToast('Enter a name and a target role.', 'error');
      return;
    }
    if (plan !== 'premium' && allProfiles.length >= 1) {
      onToast('Free keeps one profile. Extra profiles are Premium.', 'info');
      navigate('/upgrade');
      return;
    }
    const state = useVoiceCVStore.getState();
    if (user) {
      try {
        const saved = await saveCareerProfile({ userId: user.id, name: newName.trim(), role: newRole.trim(), tone: state.tone, resumeTemplate: state.resumeTemplate, assets: state.assets });
        setCloudProfiles((current) => [{
          id: saved.id,
          name: newName.trim(),
          role: newRole.trim(),
          tone: state.tone,
          resumeTemplate: state.resumeTemplate,
          createdAt: new Date().toISOString(),
          source: 'account',
          assets: state.assets,
          transcript: state.transcript,
          jobDescription: state.jobDescription,
        }, ...current]);
      } catch (error) {
        createProfile(newName.trim(), newRole.trim());
        onToast(error instanceof Error ? error.message : 'The profile was kept in this browser only.', 'error');
      }
    } else {
      createProfile(newName.trim(), newRole.trim());
    }
    setNewName('');
    setNewRole('');
    setShowCreate(false);
    onToast('Profile created.', 'success');
  };

  const handleSaveFromCurrent = async () => {
    if (!assets) {
      onToast('Record or import a story before saving a profile.', 'info');
      navigate('/record');
      return;
    }
    if (plan !== 'premium' && allProfiles.length >= 1) {
      onToast('Free keeps one profile. Extra profiles are Premium.', 'info');
      navigate('/upgrade');
      return;
    }
    const state = useVoiceCVStore.getState();
    if (user) {
      try {
        const saved = await saveCareerProfile({ userId: user.id, name: assets.name || 'My Profile', role: assets.role, tone: state.tone, resumeTemplate: state.resumeTemplate, assets });
        setCloudProfiles((current) => [{
          id: saved.id,
          name: assets.name || 'My Profile',
          role: assets.role,
          tone: state.tone,
          resumeTemplate: state.resumeTemplate,
          createdAt: new Date().toISOString(),
          source: 'account',
          assets,
          transcript: state.transcript,
          jobDescription: state.jobDescription,
        }, ...current]);
      } catch (error) {
        createProfile(assets.name || 'My Profile', assets.role);
        onToast(error instanceof Error ? error.message : 'Saved in this browser only.', 'error');
      }
    } else {
      createProfile(assets.name || 'My Profile', assets.role);
    }
    onToast('Current documents saved as a profile.', 'success');
  };

  const openProfile = (profile: ProfileCard) => {
    if (profile.source === 'browser') switchProfile(profile.id);
    if (profile.assets) {
      setAssets(profile.assets);
      setJobRole(profile.role);
      setJobDescription(profile.jobDescription);
      setTranscript(profile.transcript || profile.assets.transcript || '');
      pushVersion(`Opened ${profile.name}`);
      navigate('/results');
      return;
    }
    setJobRole(profile.role);
    onToast(`${profile.name} is active. Record a story to fill its documents.`, 'info');
    navigate('/record');
  };

  const confirmDelete = async (profile: ProfileCard) => {
    if (profile.source === 'browser') deleteProfile(profile.id);
    if (profile.source === 'account' && user) {
      try {
        await deleteCareerProfile(profile.id, user.id);
        setCloudProfiles((current) => current.filter((item) => item.id !== profile.id));
      } catch (error) {
        onToast(error instanceof Error ? error.message : 'Could not delete that profile.', 'error');
        return;
      }
    }
    setPendingDelete(null);
    onToast('Profile deleted.', 'success');
  };

  const startEdit = (profile: ProfileCard) => {
    setEditingId(profile.id);
    setEditName(profile.name);
    setEditRole(profile.role);
  };

  const saveEdit = async (profile: ProfileCard) => {
    if (!editName.trim() || !editRole.trim()) return;
    if (profile.source === 'browser') updateProfile(profile.id, { name: editName.trim(), role: editRole.trim() });
    if (profile.source === 'account' && user) {
      try {
        await updateCareerProfile(profile.id, { name: editName.trim(), role: editRole.trim() }, user.id);
        setCloudProfiles((current) => current.map((item) => item.id === profile.id ? { ...item, name: editName.trim(), role: editRole.trim() } : item));
      } catch (error) {
        onToast(error instanceof Error ? error.message : 'Could not rename that profile.', 'error');
        return;
      }
    }
    setEditingId(null);
    onToast('Profile updated.', 'success');
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-[var(--text)] sm:text-5xl">Profiles</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">Keep a profile for each role you are aiming at. Opening one loads its documents, or sends you to record if it is still empty.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void handleSaveFromCurrent()} leftIcon={<Save size={16} />}>Save current documents</Button>
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>New profile</Button>
        </div>
      </header>

      {showCreate && (
        <Card variant="solid" padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[var(--text)]">New profile</h2>
            <Button variant="ghost" size="sm" aria-label="Close new profile form" onClick={() => setShowCreate(false)}><X size={16} /></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              Profile name
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Product design applications" className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-medium normal-case tracking-normal text-[var(--text)] outline-none focus:border-[var(--accent)]" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              Target role
              <input value={newRole} onChange={(event) => setNewRole(event.target.value)} placeholder="Senior product designer" className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-medium normal-case tracking-normal text-[var(--text)] outline-none focus:border-[var(--accent)]" />
            </label>
          </div>
          <Button onClick={() => void handleCreate()}>Create profile</Button>
        </Card>
      )}

      {loading && <p className="text-sm text-[var(--muted)]">Loading saved profiles.</p>}

      {!loading && allProfiles.length === 0 && (
        <Card variant="solid" padding="lg" className="py-14 text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--text)]">No profiles yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">Create one for the role you want next, or save the documents from the session you just generated.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>Create profile</Button>
            <Button variant="secondary" onClick={() => navigate('/record')}>Record a story</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {allProfiles.map((profile) => {
          const active = profile.source === 'browser' && activeProfileId === profile.id;
          const editing = editingId === profile.id;
          return (
            <Card key={`${profile.source}-${profile.id}`} variant="solid" padding="lg" className={`flex h-full flex-col gap-4 ${active ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Briefcase size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="space-y-2">
                      <input aria-label="Profile name" value={editName} onChange={(event) => setEditName(event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                      <input aria-label="Target role" value={editRole} onChange={(event) => setEditRole(event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                    </div>
                  ) : (
                    <>
                      <h2 className="truncate font-display text-lg font-bold text-[var(--text)]">{profile.name}</h2>
                      <p className="truncate text-sm text-[var(--accent)]">{profile.role}</p>
                    </>
                  )}
                </div>
                {active && <Badge>Active</Badge>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{toneLabels[profile.tone] || profile.tone}</Badge>
                <Badge variant="outline">{templateLabels[profile.resumeTemplate] || profile.resumeTemplate}</Badge>
                <Badge variant="outline">{profile.source === 'account' ? 'Saved to account' : 'This browser'}</Badge>
                <Badge variant="outline">{profile.assets ? `Score ${profile.assets.resumeScore?.overall ?? '—'}` : 'No documents yet'}</Badge>
              </div>
              <p className="text-xs text-[var(--muted)]">Updated {new Date(profile.createdAt).toLocaleDateString()}</p>
              {pendingDelete === profile.id ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-sm text-[var(--text)]">Delete {profile.name}? This cannot be undone.</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => void confirmDelete(profile)}>Delete</Button>
                    <Button size="sm" variant="ghost" onClick={() => setPendingDelete(null)}>Keep</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-auto flex flex-wrap gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" onClick={() => void saveEdit(profile)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" className="flex-1" onClick={() => openProfile(profile)}>{profile.assets ? 'Open documents' : 'Use this role'}</Button>
                      <Button size="sm" variant="ghost" aria-label={`Rename ${profile.name}`} onClick={() => startEdit(profile)}><Edit3 size={14} /></Button>
                      <Button size="sm" variant="ghost" aria-label={`Delete ${profile.name}`} onClick={() => setPendingDelete(profile.id)}><Trash2 size={14} /></Button>
                    </>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
