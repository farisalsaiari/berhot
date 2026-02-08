import type { TranslationMap } from '../types';

/**
 * Deep-get a value from a nested translation object using dot notation.
 * e.g. get(translations, "nav.tables") → "Tables"
 */
export function getNestedValue(obj: TranslationMap, path: string): string | undefined {
  const keys = path.split('.');
  let current: TranslationMap | string = obj;

  for (const key of keys) {
    if (current === undefined || current === null || typeof current === 'string') {
      return undefined;
    }
    current = current[key] as TranslationMap | string;
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate params into a string.
 * e.g. interpolate("Hello {{name}}", { name: "John" }) → "Hello John"
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
}
