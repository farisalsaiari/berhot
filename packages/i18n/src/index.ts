// Context & Provider
export { I18nProvider, I18nContext } from './context';

// Hooks
export { useTranslation } from './hooks/useTranslation';
export { useDirection } from './hooks/useDirection';

// Components
export { LanguageSwitcher } from './components/LanguageSwitcher';
export { LangRedirect } from './components/LangRedirect';

// Types
export type { Lang, Dir, I18nConfig, I18nContextValue, Translations, TranslationMap } from './types';
export { getLangDir, RTL_LANGS } from './types';

// Utils
export { detectLang } from './utils/detect';
export { getStoredLang, setStoredLang } from './utils/storage';
export { getNestedValue, interpolate } from './utils/interpolate';
