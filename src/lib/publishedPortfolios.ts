import type { CareerAssets } from './gemini';

export type PortfolioVisibility = 'resume' | 'resume-bio' | 'contact';

export interface PublishedPortfolio {
  id: string;
  visibility: PortfolioVisibility;
  assets: CareerAssets;
  publishedAt: string;
}

const KEY = 'voicecv-published-portfolios';

function readAll(): PublishedPortfolio[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: PublishedPortfolio[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function getPublishedPortfolio(id: string) {
  return readAll().find((item) => item.id === id) || null;
}

export function publishPortfolio(assets: CareerAssets, visibility: PortfolioVisibility) {
  const id = assets.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'profile';
  const unique = `${id}-${Date.now().toString(36)}`;
  const item: PublishedPortfolio = { id: unique, visibility, assets, publishedAt: new Date().toISOString() };
  writeAll([item, ...readAll()]);
  return item;
}

export function unpublishPortfolio(id: string) {
  writeAll(readAll().filter((item) => item.id !== id));
}
