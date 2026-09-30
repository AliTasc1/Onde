import { useStore } from '../store';
import { en, type Dict } from './en';
import { tr } from './tr';

export type Lang = 'tr' | 'en';
export type { Dict };

export const DICTS: Record<Lang, Dict> = { tr, en };
export const LANG_NAMES: Record<Lang, string> = { tr: 'Türkçe', en: 'English' };
export const LANGS = Object.keys(DICTS) as Lang[];

/** Current strings inside React components. */
export function useT(): Dict {
  const lang = useStore((s) => s.lang);
  return DICTS[lang] ?? tr;
}

/** Current strings outside React (actions, services, audio). */
export const getT = (): Dict => DICTS[useStore.getState().lang] ?? tr;

/** Locale tag for number / date formatting. */
export const localeOf = (lang: Lang) => (lang === 'tr' ? 'tr-TR' : 'en-US');

/** Locale-aware upper-casing (textTransform turns Turkish "i" into "I", not "İ"). */
export function useUpper() {
  const lang = useStore((s) => s.lang);
  return (s: string) => s.toLocaleUpperCase(localeOf(lang));
}

/** Translated library pattern name/description (saved patterns keep the user's own name). */
export const patName = (t: Dict, p: { id: string; name: string }) => t.patterns[p.id]?.name ?? p.name;
export const patDesc = (t: Dict, p: { id: string; desc: string }) => t.patterns[p.id]?.desc ?? p.desc;
