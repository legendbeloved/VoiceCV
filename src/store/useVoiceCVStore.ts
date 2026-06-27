import { create } from 'zustand';
import { CareerAssets, ResumeTemplate, ToneStyle } from '../lib/gemini';

export type ProcessingStep = 'idle' | 'transcribing' | 'understanding' | 'resume' | 'coverLetter' | 'linkedin' | 'complete';
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
  tone: 'professional',
  resumeTemplate: 'ats',
  transcript: '',
  assets: null,
  processingStep: 'idle',
  isRecording: false,
  recordingTime: 60,
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
    tone: 'professional',
    resumeTemplate: 'ats',
    transcript: '',
    assets: null,
    processingStep: 'idle',
    isRecording: false,
    recordingTime: 60,
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
