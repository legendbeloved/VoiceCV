import { create } from 'zustand';
import { CareerAssets, ResumeTemplate, ToneStyle } from '../lib/gemini';
import { recordingLimitSeconds } from './usePlanStore';

export type ProcessingStep = 'idle' | 'transcribing' | 'writing' | 'complete' | 'error';

const DRAFT_KEY = 'voicecv-draft-v1';

export interface VoiceDraft {
  jobRole: string;
  jobDescription: string;
  tone: ToneStyle;
  resumeTemplate: ResumeTemplate;
  transcript: string;
  savedAt: string;
}

export function readVoiceDraft(): VoiceDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VoiceDraft;
    if (!parsed || typeof parsed.transcript !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeVoiceDraft(draft: Omit<VoiceDraft, 'savedAt'>): string {
  const savedAt = new Date().toISOString();
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt }));
  return savedAt;
}

export function clearVoiceDraft() {
  window.localStorage.removeItem(DRAFT_KEY);
}

const DEFAULTS_KEY = 'voicecv-defaults';
const toneOptions: ToneStyle[] = ['professional', 'warm', 'executive', 'confident', 'creative'];
const templateOptions: ResumeTemplate[] = ['ats', 'modern', 'executive', 'creative'];

export function readVoiceDefaults(): { tone: ToneStyle; resumeTemplate: ResumeTemplate } {
  const fallback = { tone: 'professional' as ToneStyle, resumeTemplate: 'ats' as ResumeTemplate };
  try {
    const raw = window.localStorage.getItem(DEFAULTS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { tone?: ToneStyle; resumeTemplate?: ResumeTemplate };
    return {
      tone: parsed.tone && toneOptions.includes(parsed.tone) ? parsed.tone : fallback.tone,
      resumeTemplate: parsed.resumeTemplate && templateOptions.includes(parsed.resumeTemplate) ? parsed.resumeTemplate : fallback.resumeTemplate,
    };
  } catch {
    return fallback;
  }
}

export function writeVoiceDefaults(tone: ToneStyle, resumeTemplate: ResumeTemplate) {
  window.localStorage.setItem(DEFAULTS_KEY, JSON.stringify({ tone, resumeTemplate }));
}

export interface DocumentVersion {
  id: string;
  label: string;
  createdAt: string;
  resume: string;
  coverLetter: string;
  linkedinBio: string;
}
export type AudioState = 'idle' | 'recording' | 'paused' | 'complete';
export type PageType = 'landing' | 'record' | 'processing' | 'results' | '404';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  tone: ToneStyle;
  resumeTemplate: ResumeTemplate;
  assets: CareerAssets | null;
  createdAt: string;
}

interface VoiceCVState {
  jobRole: string;
  jobDescription: string;
  tone: ToneStyle;
  resumeTemplate: ResumeTemplate;
  transcript: string;
  assets: CareerAssets | null;
  processingStep: ProcessingStep;
  processingError: string | null;
  hadAudio: boolean;
  companyName: string;
  draftSavedAt: string | null;
  versions: DocumentVersion[];
  answeredPrompts: string[];
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  error: string | null;
  audioState: AudioState;
  hasSeenOnboarding: boolean;
  onboardingStep: number;

  profiles: UserProfile[];
  activeProfileId: string | null;

  setJobRole: (role: string) => void;
  setJobDescription: (description: string) => void;
  setTone: (tone: ToneStyle) => void;
  setResumeTemplate: (template: ResumeTemplate) => void;
  setTranscript: (text: string) => void;
  setAssets: (assets: CareerAssets | null) => void;
  setProcessingStep: (step: ProcessingStep) => void;
  setProcessingError: (error: string | null) => void;
  setHadAudio: (hadAudio: boolean) => void;
  setCompanyName: (companyName: string) => void;
  setDraftSavedAt: (savedAt: string | null) => void;
  markPromptAnswered: (prompt: string) => void;
  pushVersion: (label: string) => void;
  restoreVersion: (id: string) => void;
  setIsRecording: (recording: boolean) => void;
  setRecordingTime: (time: number) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setError: (error: string | null) => void;
  setAudioState: (state: AudioState) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setOnboardingStep: (step: number) => void;
  updateAssetField: (field: keyof CareerAssets, value: any) => void;
  reset: () => void;

  createProfile: (name: string, role: string) => string;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  getActiveProfile: () => UserProfile | null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export const useVoiceCVStore = create<VoiceCVState>((set, get) => ({
  jobRole: '',
  jobDescription: '',
  tone: readVoiceDefaults().tone,
  resumeTemplate: readVoiceDefaults().resumeTemplate,
  transcript: '',
  assets: null,
  processingStep: 'idle',
  processingError: null,
  hadAudio: false,
  companyName: '',
  draftSavedAt: null,
  versions: [],
  answeredPrompts: [],
  isRecording: false,
  recordingTime: recordingLimitSeconds(),
  audioBlob: null,
  error: null,
  audioState: 'idle',
  hasSeenOnboarding: false,
  onboardingStep: 0,

  profiles: [],
  activeProfileId: null,

  setJobRole: (jobRole) => set({ jobRole }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setTone: (tone) => set({ tone }),
  setResumeTemplate: (resumeTemplate) => set({ resumeTemplate }),
  setTranscript: (transcript) => set({ transcript }),
  setAssets: (assets) => set({ assets }),
  setProcessingStep: (processingStep) => set({ processingStep }),
  setProcessingError: (processingError) => set({ processingError }),
  setHadAudio: (hadAudio) => set({ hadAudio }),
  setCompanyName: (companyName) => set({ companyName }),
  setDraftSavedAt: (draftSavedAt) => set({ draftSavedAt }),
  markPromptAnswered: (prompt) => set((state) => ({
    answeredPrompts: state.answeredPrompts.includes(prompt) ? state.answeredPrompts : [...state.answeredPrompts, prompt],
  })),
  pushVersion: (label) => set((state) => {
    if (!state.assets) return state;
    const version: DocumentVersion = {
      id: generateId(),
      label,
      createdAt: new Date().toISOString(),
      resume: state.assets.resume,
      coverLetter: state.assets.coverLetter,
      linkedinBio: state.assets.linkedinBio,
    };
    return { versions: [version, ...state.versions].slice(0, 20) };
  }),
  restoreVersion: (id) => set((state) => {
    const version = state.versions.find((item) => item.id === id);
    if (!version || !state.assets) return state;
    return {
      assets: {
        ...state.assets,
        resume: version.resume,
        coverLetter: version.coverLetter,
        linkedinBio: version.linkedinBio,
      },
    };
  }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordingTime: (recordingTime) => set({ recordingTime }),
  setAudioBlob: (audioBlob) => set({ audioBlob }),
  setError: (error) => set({ error }),
  setAudioState: (audioState) => set({ audioState }),
  setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),

  updateAssetField: (field, value) => set((state) => ({
    assets: state.assets ? { ...state.assets, [field]: value } : null
  })),

  reset: () => set({
    jobRole: '',
    jobDescription: '',
    tone: readVoiceDefaults().tone,
    resumeTemplate: readVoiceDefaults().resumeTemplate,
    transcript: '',
    assets: null,
    processingStep: 'idle',
    processingError: null,
    hadAudio: false,
    companyName: '',
    versions: [],
    answeredPrompts: [],
    isRecording: false,
    recordingTime: recordingLimitSeconds(),
    audioBlob: null,
    error: null,
    audioState: 'idle',
  }),

  createProfile: (name, role) => {
    const id = generateId();
    const state = get();
    const newProfile: UserProfile = {
      id,
      name,
      role,
      tone: state.tone,
      resumeTemplate: state.resumeTemplate,
      assets: state.assets,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      profiles: [...s.profiles, newProfile],
      activeProfileId: id,
    }));
    return id;
  },

  switchProfile: (id) => {
    const state = get();
    const profile = state.profiles.find((p) => p.id === id);
    if (profile) {
      set({
        activeProfileId: id,
        tone: profile.tone,
        resumeTemplate: profile.resumeTemplate,
        assets: profile.assets,
        jobRole: profile.role,
      });
    }
  },

  deleteProfile: (id) => set((state) => ({
    profiles: state.profiles.filter((p) => p.id !== id),
    activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
  })),

  updateProfile: (id, updates) => set((state) => ({
    profiles: state.profiles.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),

  getActiveProfile: () => {
    const state = get();
    return state.profiles.find((p) => p.id === state.activeProfileId) || null;
  },
}));
