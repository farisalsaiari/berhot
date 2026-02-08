import { createContext, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Lang, I18nConfig, I18nContextValue, TranslationMap } from './types';
import { getLangDir } from './types';
import { detectLang } from './utils/detect';
import { setStoredLang } from './utils/storage';
import { getNestedValue, interpolate } from './utils/interpolate';
import commonEn from './locales/en/common.json';
import commonAr from './locales/ar/common.json';

export const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  config?: I18nConfig;
}

function deepMerge(base: TranslationMap, override: TranslationMap): TranslationMap {
  const result: TranslationMap = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overrideVal = override[key];
    if (
      typeof baseVal === 'object' &&
      baseVal !== null &&
      typeof overrideVal === 'object' &&
      overrideVal !== null
    ) {
      result[key] = deepMerge(baseVal as TranslationMap, overrideVal as TranslationMap);
    } else {
      result[key] = overrideVal;
    }
  }
  return result;
}

export function I18nProvider({ children, config }: I18nProviderProps) {
  const { lang: urlLang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const lang = detectLang(urlLang, config?.defaultLang ?? 'en');
  const dir = getLangDir(lang);

  // Merge common translations with app-specific translations
  const mergedTranslations = useMemo(() => {
    const appEn = config?.translations?.en ?? {};
    const appAr = config?.translations?.ar ?? {};
    return {
      en: deepMerge(commonEn as TranslationMap, appEn),
      ar: deepMerge(commonAr as TranslationMap, appAr),
    };
  }, [config?.translations]);

  // Set HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    setStoredLang(lang);
  }, [lang, dir]);

  const setLang = useCallback(
    (newLang: Lang) => {
      // Replace /:lang/ in URL with new lang
      const currentPath = location.pathname;
      const newPath = currentPath.replace(`/${lang}/`, `/${newLang}/`);
      navigate(newPath === currentPath ? `/${newLang}` : newPath, { replace: true });
    },
    [lang, location.pathname, navigate]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translations = mergedTranslations[lang];
      const value = getNestedValue(translations, key);
      if (value === undefined) {
        // Fallback to English
        const fallback = getNestedValue(mergedTranslations.en, key);
        if (fallback !== undefined) return interpolate(fallback, params);
        return key; // Return key itself as last resort
      }
      return interpolate(value, params);
    },
    [lang, mergedTranslations]
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({ lang, dir, setLang, t }),
    [lang, dir, setLang, t]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}
