import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fr } from '../locales/fr';
import { ar } from '../locales/ar';

/**
 * Bilingual layer: French and Algerian Arabic.
 *
 * SCOPE
 * This translates UI chrome only — buttons, labels, navigation, form errors and
 * static page copy. Product names, descriptions and category names come from the
 * database as single String fields and are shown exactly as the client entered
 * them, in both languages. Making those bilingual means a schema change plus the
 * client writing every product twice, which is a separate decision.
 *
 * RTL
 * Arabic sets `dir="rtl"` on <html>. Components must use Tailwind's logical
 * utilities (ps/pe, ms/me, start/end, text-start/text-end) rather than physical
 * ones (pl/pr, ml/mr, left/right, text-left) so the layout mirrors. Physical
 * utilities are correct only where the thing is genuinely physical, such as an
 * icon that must always point the same way.
 *
 * The choice persists to localStorage and is applied to <html> before paint, so
 * a returning Arabic visitor never sees a frame of French in the wrong direction.
 */

const DICTIONARIES = { fr, ar };

export const LANGS = [
  { code: 'fr', label: 'Français', short: 'FR', dir: 'ltr' },
  { code: 'ar', label: 'العربية', short: 'ع', dir: 'rtl' },
];

const STORAGE_KEY = 'evora:lang';
const DEFAULT_LANG = 'fr';

const I18nContext = createContext(null);

export function dirOf(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Reads the stored choice. Falls back to French, which is the brand's voice. */
function readStoredLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'ar' || stored === 'fr' ? stored : DEFAULT_LANG;
  } catch {
    // Private browsing can throw on localStorage access.
    return DEFAULT_LANG;
  }
}

/**
 * Resolves a dotted key against the dictionary.
 *
 * Missing keys fall back to French rather than rendering the raw key, so a gap
 * in the Arabic dictionary degrades to a readable French word instead of
 * `checkout.submit` appearing in the middle of a page. In development it warns,
 * so gaps get found before the client does.
 */
function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), dict);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);

  const setLang = useCallback((next) => {
    if (next !== 'fr' && next !== 'ar') return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember the choice is not worth breaking on.
    }
  }, []);

  // Keeps <html lang> and <html dir> in step with the choice. Both matter:
  // `dir` drives the mirroring, `lang` drives font selection, hyphenation and
  // what a screen reader announces the page in.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', dirOf(lang));
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const dict = DICTIONARIES[lang] || fr;
      let value = resolve(dict, key);

      if (value === undefined) {
        value = resolve(fr, key);
        if (import.meta.env.DEV && value !== undefined) {
          console.warn(`[i18n] clé manquante en "${lang}" : ${key}`);
        }
      }

      if (value === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] clé inconnue : ${key}`);
        return key;
      }

      if (typeof value !== 'string') return value;

      // {name} style interpolation. Deliberately minimal: anything needing more
      // than substitution belongs in the component, not the dictionary.
      if (vars) {
        return value.replace(/\{(\w+)\}/g, (match, name) =>
          vars[name] === undefined ? match : String(vars[name])
        );
      }

      return value;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, dir: dirOf(lang), isRtl: lang === 'ar' }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans un I18nProvider');
  return ctx;
}

/** Shorthand for the common case of only needing the translate function. */
export function useT() {
  return useI18n().t;
}
