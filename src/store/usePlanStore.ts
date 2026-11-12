import { create } from 'zustand';

export type PlanTier = 'free' | 'premium';
export type PlanOffer = 'free' | 'monthly' | 'pass';
export type FreeAction = 'rewrites' | 'tailors' | 'coverLetters' | 'atsLines';

const PLAN_KEY = 'voicecv-plan';
const USAGE_KEY = 'voicecv-usage-v1';
const PASS_DAYS = 30;

export const FREE_PACK_LIMIT = 1;
export const FREE_RECORDING_SECONDS = 60;
export const PREMIUM_RECORDING_SECONDS = 180;
export const FREE_ACTION_LIMITS: Record<FreeAction, number> = {
  rewrites: 1,
  tailors: 1,
  coverLetters: 1,
  atsLines: 1,
};

interface StoredPlan {
  offer: PlanOffer;
  passExpiresAt: string | null;
}

interface UsageCounts {
  rewrites: number;
  tailors: number;
  coverLetters: number;
  atsLines: number;
}

interface PlanState {
  plan: PlanTier;
  offer: PlanOffer;
  passExpiresAt: string | null;
  setPlan: (plan: PlanTier) => void;
  setOffer: (offer: PlanOffer) => void;
}

function emptyUsage(): UsageCounts {
  return { rewrites: 0, tailors: 0, coverLetters: 0, atsLines: 0 };
}

function readStoredPlan(): StoredPlan {
  try {
    const raw = window.localStorage.getItem(PLAN_KEY);
    if (raw === 'premium') return { offer: 'monthly', passExpiresAt: null };
    if (!raw || raw === 'free') return { offer: 'free', passExpiresAt: null };
    const parsed = JSON.parse(raw) as Partial<StoredPlan>;
    if (parsed.offer === 'monthly') return { offer: 'monthly', passExpiresAt: null };
    if (parsed.offer === 'pass') return { offer: 'pass', passExpiresAt: parsed.passExpiresAt || null };
    return { offer: 'free', passExpiresAt: null };
  } catch {
    return { offer: 'free', passExpiresAt: null };
  }
}

function isPassActive(stored: StoredPlan) {
  return stored.offer === 'pass' && !!stored.passExpiresAt && new Date(stored.passExpiresAt).getTime() > Date.now();
}

function resolvePlan(stored: StoredPlan): Pick<PlanState, 'plan' | 'offer' | 'passExpiresAt'> {
  if (stored.offer === 'monthly' || isPassActive(stored)) {
    return { plan: 'premium', offer: stored.offer, passExpiresAt: stored.passExpiresAt };
  }
  return { plan: 'free', offer: 'free', passExpiresAt: stored.passExpiresAt };
}

function writeStoredPlan(stored: StoredPlan) {
  window.localStorage.setItem(PLAN_KEY, JSON.stringify(stored));
}

function readUsage(): UsageCounts {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USAGE_KEY) || '') as Partial<UsageCounts>;
    return { ...emptyUsage(), ...parsed };
  } catch {
    return emptyUsage();
  }
}

export function canUseFreeAction(action: FreeAction) {
  if (isPremiumPlan()) return true;
  return readUsage()[action] < FREE_ACTION_LIMITS[action];
}

export function recordFreeAction(action: FreeAction) {
  if (isPremiumPlan()) return;
  const usage = readUsage();
  usage[action] += 1;
  window.localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export const usePlanStore = create<PlanState>((set) => ({
  ...resolvePlan(readStoredPlan()),
  setPlan: (plan) => {
    const stored: StoredPlan = plan === 'premium'
      ? { offer: 'monthly', passExpiresAt: null }
      : { offer: 'free', passExpiresAt: null };
    writeStoredPlan(stored);
    set(resolvePlan(stored));
  },
  setOffer: (offer) => {
    const stored: StoredPlan = offer === 'pass'
      ? { offer: 'pass', passExpiresAt: new Date(Date.now() + PASS_DAYS * 24 * 60 * 60 * 1000).toISOString() }
      : { offer, passExpiresAt: null };
    writeStoredPlan(stored);
    set(resolvePlan(stored));
  },
}));

export function isPremiumPlan() {
  const state = usePlanStore.getState();
  if (state.offer === 'pass' && state.passExpiresAt && new Date(state.passExpiresAt).getTime() <= Date.now()) {
    const stored: StoredPlan = { offer: 'free', passExpiresAt: state.passExpiresAt };
    writeStoredPlan(stored);
    usePlanStore.setState(resolvePlan(stored));
    return false;
  }
  return usePlanStore.getState().plan === 'premium';
}

export function recordingLimitSeconds() {
  return isPremiumPlan() ? PREMIUM_RECORDING_SECONDS : FREE_RECORDING_SECONDS;
}
