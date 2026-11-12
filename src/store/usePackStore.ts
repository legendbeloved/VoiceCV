import { create } from 'zustand';
import { FREE_PACK_LIMIT, isPremiumPlan } from './usePlanStore';

export type ApplicationStatus = 'draft' | 'applied' | 'interview' | 'offer';

export interface InterviewDebrief {
  clarity: number;
  evidence: number;
  missing: string[];
  summary: string;
}

export interface PackDocuments {
  resume: string;
  coverLetter: string;
  linkedinBio: string;
}

export interface ApplicationPack extends PackDocuments {
  id: string;
  name: string;
  company: string;
  role: string;
  jobDescription: string;
  status: ApplicationStatus;
  language: string;
  translations: Record<string, PackDocuments>;
  matchScore: number | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  themeId: string;
  interviewDebrief: InterviewDebrief | null;
  companyBrief: string;
  followUp: string;
  thankYou: string;
  updatedAt: string;
}

const PACK_KEY = 'voicecv-packs-v1';

function readPacks(): ApplicationPack[] {
  try {
    const raw = window.localStorage.getItem(PACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((pack) => ({
      ...pack,
      companyBrief: pack.companyBrief || '',
      followUp: pack.followUp || '',
      thankYou: pack.thankYou || '',
    }));
  } catch {
    return [];
  }
}

function writePacks(packs: ApplicationPack[]) {
  window.localStorage.setItem(PACK_KEY, JSON.stringify(packs));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface PackState {
  packs: ApplicationPack[];
  activePackId: string | null;
  savePack: (input: Omit<ApplicationPack, 'id' | 'updatedAt' | 'translations' | 'interviewDebrief' | 'status' | 'companyBrief' | 'followUp' | 'thankYou'> & { id?: string; status?: ApplicationStatus }) => { ok: true; id: string } | { ok: false; reason: 'limit' };
  setStatus: (id: string, status: ApplicationStatus) => void;
  setActive: (id: string) => void;
  attachDebrief: (id: string, debrief: InterviewDebrief) => void;
  attachTranslation: (id: string, language: string, documents: PackDocuments) => void;
  attachOutreach: (id: string, kind: 'brief' | 'follow-up' | 'thank-you', text: string) => void;
}

export const usePackStore = create<PackState>((set, get) => ({
  packs: readPacks(),
  activePackId: null,
  savePack: (input) => {
    const existing = input.id ? get().packs.find((pack) => pack.id === input.id) : undefined;
    if (!existing && !isPremiumPlan() && get().packs.length >= FREE_PACK_LIMIT) {
      return { ok: false, reason: 'limit' };
    }
    const pack: ApplicationPack = {
      id: existing?.id || input.id || makeId(),
      name: input.name,
      company: input.company,
      role: input.role,
      jobDescription: input.jobDescription,
      status: input.status || existing?.status || 'draft',
      resume: input.resume,
      coverLetter: input.coverLetter,
      linkedinBio: input.linkedinBio,
      language: input.language,
      translations: existing?.translations || {},
      matchScore: input.matchScore,
      matchedKeywords: input.matchedKeywords,
      missingKeywords: input.missingKeywords,
      themeId: input.themeId,
      interviewDebrief: existing?.interviewDebrief || null,
      companyBrief: existing?.companyBrief || '',
      followUp: existing?.followUp || '',
      thankYou: existing?.thankYou || '',
      updatedAt: new Date().toISOString(),
    };
    const packs = [pack, ...get().packs.filter((item) => item.id !== pack.id)];
    writePacks(packs);
    set({ packs, activePackId: pack.id });
    return { ok: true, id: pack.id };
  },
  setStatus: (id, status) => {
    const packs = get().packs.map((pack) => pack.id === id ? { ...pack, status, updatedAt: new Date().toISOString() } : pack);
    writePacks(packs);
    set({ packs });
  },
  setActive: (id) => set({ activePackId: id }),
  attachDebrief: (id, debrief) => {
    const packs = get().packs.map((pack) => pack.id === id ? { ...pack, interviewDebrief: debrief, status: pack.status === 'draft' ? 'interview' : pack.status, updatedAt: new Date().toISOString() } : pack);
    writePacks(packs);
    set({ packs });
  },
  attachTranslation: (id, language, documents) => {
    const packs = get().packs.map((pack) => pack.id === id ? { ...pack, translations: { ...pack.translations, [language]: documents }, updatedAt: new Date().toISOString() } : pack);
    writePacks(packs);
    set({ packs });
  },
  attachOutreach: (id, kind, text) => {
    const field = kind === 'brief' ? 'companyBrief' : kind === 'follow-up' ? 'followUp' : 'thankYou';
    const packs = get().packs.map((pack) => pack.id === id ? { ...pack, [field]: text, updatedAt: new Date().toISOString() } : pack);
    writePacks(packs);
    set({ packs });
  },
}));
