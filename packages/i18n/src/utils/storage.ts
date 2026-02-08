import type { Lang } from '../types';

const STORAGE_KEY = 'berhot_lang';

export function getStoredLang(): Lang | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
    return null;
  } catch {
    return null;
  }
}

export function setStoredLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable (SSR, private browsing)
  }
}
