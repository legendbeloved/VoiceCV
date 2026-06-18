import { create } from 'zustand';
import { CareerAssets, ResumeTemplate, ToneStyle } from '../lib/gemini';

export type ProcessingStep = 'idle' | 'transcribing' | 'understanding' | 'resume' | 'coverLetter' | 'linkedin' | 'complete';
export type AudioState = 'idle' | 'recording' | 'paused' | 'complete';
export type PageType = 'landing' | 'record' | 'processing' | 'results' | '404';

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
  updateAssetField: (field: keyof CareerAssets, value: any) => void;
  reset: () => void;
}

export const useVoiceCVStore = create<VoiceCVState>((set) => ({
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
}));
