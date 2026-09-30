import { Share } from 'react-native';

import { findPattern, FREE_SAVED_LIMIT } from '../data/patterns';
import { useStore } from '../store';
import { go } from './nav';

/** Open a library pattern, routing locked ones to the paywall. */
export function openPattern(pid: string) {
  const st = useStore.getState();
  const p = findPattern(pid);
  if (p.locked && !st.premium) return go('/subscription');
  st.openPattern(pid);
  go(`/pattern/${pid}`);
}

/** "rgba(r,g,b,a)" → { color: "rgb(r,g,b)", opacity: a } for SVG stops. */
export function splitRgba(c: string) {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return { color: c, opacity: 1 };
  const [r, g, b, a] = m[1].split(',').map((x) => parseFloat(x));
  return { color: `rgb(${r},${g},${b})`, opacity: a ?? 1 };
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** Save the builder draft (free plan keeps up to FREE_SAVED_LIMIT). Returns true when saved. */
export function saveCurrentDraft(): boolean {
  const st = useStore.getState();
  const name = st.draft.name.trim() || 'My Pattern';
  const replacing = st.saved.some((x) => x.name === name);
  if (!st.premium && !replacing && st.saved.length >= FREE_SAVED_LIMIT) {
    st.showToast(`Free plan saves up to ${FREE_SAVED_LIMIT} patterns`);
    go('/subscription');
    return false;
  }
  st.saveDraft();
  st.showToast('Pattern saved');
  return true;
}

/** Hand the user a JSON copy of everything Onde stores on the device. */
export async function exportData() {
  const s = useStore.getState();
  const payload = {
    exportedAt: new Date().toISOString(),
    profile: { name: s.name, createdAt: new Date(s.createdAt).toISOString(), premium: s.premium },
    settings: { toggles: s.tg, intensityLimit: s.limit, defaultDuration: s.defDur, lockMode: s.lockMode },
    favorites: Object.keys(s.fav).filter((k) => s.fav[k]),
    savedPatterns: s.saved,
    sessions: s.history.map((h) => ({ ...h, startedAt: new Date(h.startedAt).toISOString() })),
  };
  try {
    await Share.share({ title: 'Onde data export', message: JSON.stringify(payload, null, 2) });
  } catch {
    s.showToast('Something went wrong. Try again.');
  }
}

/** Notifications switch: turning on goes through the permission screen first. */
export function toggleNotifications() {
  const s = useStore.getState();
  if (s.tg.notif) s.setToggle('notif', false);
  else go('/permission');
}
