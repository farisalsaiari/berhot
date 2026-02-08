export type Lang = 'en' | 'ar';
export type Dir = 'ltr' | 'rtl';

export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

export interface Translations {
  en: TranslationMap;
  ar: TranslationMap;
}

export interface I18nConfig {
  supportedLangs?: Lang[];
  defaultLang?: Lang;
  translations?: Translations;
}

export interface I18nContextValue {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const RTL_LANGS: Lang[] = ['ar'];

export function getLangDir(lang: Lang): Dir {
  return RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
}
