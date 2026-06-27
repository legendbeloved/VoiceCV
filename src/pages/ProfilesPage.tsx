import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Trash2, CheckCircle2, ArrowRight, Edit3, Save, X, Briefcase } from 'lucide-react';
import { useVoiceCVStore, UserProfile } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const toneLabels = { professional: 'Professional', warm: 'Warm', executive: 'Executive', confident: 'Confident', creative: 'Creative' };
const templateLabels = { ats: 'Classic ATS', modern: 'Modern Compact', executive: 'Executive', creative: 'Creative' };

export default function ProfilesPage({ onToast }: { onToast: (msg: string, v: 'success' | 'error' | 'info') => void }) {
  const { profiles, activeProfileId, createProfile, switchProfile, deleteProfile, updateProfile, assets } = useVoiceCVStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const handleCreate = () => {
    if (!newName.trim() || !newRole.trim()) {
      onToast('Please enter a name and role.', 'error');
      return;
    }
    createProfile(newName.trim(), newRole.trim());
    setNewName('');
    setNewRole('');
    setShowCreate(false);
    onToast('Profile created.', 'success');
  };

  const handleSaveFromCurrent = () => {
    if (!assets) {
      onToast('No active documents to save. Record a session first.', 'error');
      return;
    }
    const id = createProfile(assets.name || 'My Profile', assets.role);
    onToast('Current session saved as a new profile.', 'success');
  };

  const handleSwitch = (id: string) => {
    switchProfile(id);
    onToast('Profile switched.', 'success');
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    onToast('Profile deleted.', 'success');
  };

  const startEdit = (profile: UserProfile) => {
    setEditingId(profile.id);
    setEditName(profile.name);
    setEditRole(profile.role);
  };

  const saveEdit = () => {
    if (editingId && editName.trim() && editRole.trim()) {
      updateProfile(editingId, { name: editName.trim(), role: editRole.trim() });
      onToast('Profile updated.', 'success');
    }
    setEditingId(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">Multi-Profile Support</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-display font-extrabold text-[var(--text)]">Your Profiles</h1>
          <p className="mt-4 text-[var(--muted)] max-w-2xl">Save multiple profiles for different roles. Switch between them quickly with different tone and template preferences.</p>
        </div>
        <div className="flex gap-3">
          {assets && (
            <Button variant="secondary" onClick={handleSaveFromCurrent} leftIcon={<Save size={16} />}>
              Save Current Session
            </Button>
          )}
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>
            New Profile
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card variant="solid" padding="lg" className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-[var(--text)]">Create New Profile</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}><X size={16} /></Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Profile name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                </div>
                <div>
                  <label className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Target role</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} leftIcon={<CheckCircle2 size={16} />}>Create Profile</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {profiles.length === 0 ? (
        <Card variant="solid" padding="lg" className="text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-[var(--muted)] opacity-40" />
          <p className="text-lg font-bold text-[var(--text)] mb-2">No profiles yet</p>
          <p className="text-sm text-[var(--muted)] mb-6">Create your first profile or save your current session as a profile.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>Create Profile</Button>
            {assets && <Button variant="secondary" onClick={handleSaveFromCurrent} leftIcon={<Save size={16} />}>Save Current</Button>}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                variant="solid"
                padding="lg"
                className={`space-y-4 h-full flex flex-col relative ${activeProfileId === profile.id ? 'ring-2 ring-[var(--accent)]' : ''}`}
              >
                {activeProfileId === profile.id && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[var(--accent)] text-[var(--on-accent)]">Active</Badge>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                    <Briefcase size={20} className="text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    {editingId === profile.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                        <input
                          type="text"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-display text-lg font-bold text-[var(--text)] truncate">{profile.name}</h3>
                        <p className="text-sm text-[var(--accent)] truncate">{profile.role}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-[var(--border)] text-[var(--muted)]">{toneLabels[profile.tone]}</Badge>
                  <Badge variant="outline" className="border-[var(--border)] text-[var(--muted)]">{templateLabels[profile.resumeTemplate]}</Badge>
                </div>

                <p className="text-xs text-[var(--muted)]">
                  Created {new Date(profile.createdAt).toLocaleDateString()}
                </p>

                <div className="mt-auto flex gap-2">
                  {editingId === profile.id ? (
                    <>
                      <Button size="sm" onClick={saveEdit} leftIcon={<Save size={14} />}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X size={14} /></Button>
                    </>
                  ) : (
                    <>
                      {activeProfileId !== profile.id && (
                        <Button size="sm" onClick={() => handleSwitch(profile.id)} className="flex-1">Switch</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => startEdit(profile)}><Edit3 size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(profile.id)} className="text-red-400 hover:text-red-500"><Trash2 size={14} /></Button>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
