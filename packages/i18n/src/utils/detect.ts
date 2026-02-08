import type { Lang } from '../types';
import { getStoredLang } from './storage';

const SUPPORTED: Lang[] = ['en', 'ar'];

/** Detect language: URL param → localStorage → browser → fallback */
export function detectLang(urlLang?: string, fallback: Lang = 'en'): Lang {
  // 1. URL param
  if (urlLang && SUPPORTED.includes(urlLang as Lang)) {
    return urlLang as Lang;
  }

  // 2. localStorage
  const stored = getStoredLang();
  if (stored) return stored;

  // 3. Browser language
  try {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && SUPPORTED.includes(browserLang as Lang)) {
      return browserLang as Lang;
    }
  } catch {
    // navigator unavailable
  }

  return fallback;
}
