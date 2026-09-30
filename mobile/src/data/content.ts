import type { IconName } from '../components/Icon';

/** Home mood cards: label key (see `home.moods`), icon, pattern id, corner glow colour. Text lives in src/i18n. */
export const MOODS: ['intense' | 'relax' | 'unwind' | 'focus' | 'calm' | 'sleep', IconName, string, string][] = [
  ['intense', 'wave', 'constant', 'rgba(236,72,153,.5)'],
  ['relax', 'waves', 'soft', 'rgba(139,92,246,.45)'],
  ['unwind', 'leaf', 'slow', 'rgba(236,72,153,.3)'],
  ['focus', 'target', 'balanced', 'rgba(110,120,250,.38)'],
  ['calm', 'breath', 'calm', 'rgba(196,181,253,.3)'],
  ['sleep', 'moon', 'night', 'rgba(91,47,201,.55)'],
];

export const DURATIONS = [1, 3, 5, 10, 15];

export const PRIVACY_ICONS: IconName[] = ['device', 'shield', 'cloud'];

export const SAFETY_ICONS: IconName[] = ['hand', 'pauseC', 'clock', 'thermo', 'car'];

export const SUPPORT_EMAIL = 'support@onde.app';
