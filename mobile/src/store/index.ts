import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_SEGMENTS, findPattern, type Segment } from '../data/patterns';

export type Toggles = {
  analytics: boolean; personalization: boolean; notif: boolean; local: boolean; cloud: boolean;
  sound: boolean; dark: boolean; autostop: boolean; battery: boolean; rm: boolean; visual: boolean;
  n_routine: boolean; n_checkin: boolean; n_tips: boolean;
  /** Voice companion (18+). Only switchable after the age confirmation. */
  voice: boolean;
};

export type SavedPattern = {
  id: string;
  name: string;
  segs: Segment[];
  freq: number;
  rhythm: number;
  pulseLen: number;
  pauseLen: number;
  /** Session length, minutes. */
  dur: number;
  createdAt: number;
};

export type SessionRecord = {
  id: string;
  pid: string;
  name: string;
  startedAt: number;
  seconds: number;
  intensity: number;
  feel?: string;
};

export type PlayConfig = { pid: string; intensity: number; rhythm: number; duration: number };

export type SessionResult = { ended: boolean; elapsed: number; pid: string; intensity: number };

export type Draft = {
  segs: Segment[];
  sel: number;
  freq: number;
  rhythm: number;
  pulseLen: number;
  pauseLen: number;
  dur: number;
  name: string;
};

export const LOCK_MODES = ['Stop session', 'Pause session', 'Keep running'] as const;

const DEFAULT_TOGGLES: Toggles = {
  analytics: false, personalization: true, notif: true, local: true, cloud: false, sound: false, dark: true,
  autostop: true, battery: true, rm: false, visual: true, n_routine: true, n_checkin: true, n_tips: false,
  voice: false,
};

const newDraft = (dur = 5): Draft => ({
  segs: DEFAULT_SEGMENTS.map((s) => ({ ...s })), sel: 3, freq: 5, rhythm: 4, pulseLen: 250, pauseLen: 600, dur, name: 'Evening Drift',
});

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

type Persisted = {
  onboarded: boolean;
  /** The 18+ voice screen has been shown once (confirmed or declined). */
  adultAsked: boolean;
  adultConfirmed: boolean;
  voiceVolume: number;
  voiceFreq: 0 | 1 | 2;
  createdAt: number;
  name: string;
  premium: boolean;
  plan: 'yearly' | 'monthly';
  tg: Toggles;
  limit: number;
  defDur: number;
  lockMode: number;
  fav: Record<string, boolean>;
  saved: SavedPattern[];
  history: SessionRecord[];
  last: PlayConfig | null;
  draft: Draft;
};

type Transient = {
  hydrated: boolean;
  toast: string | null;
  play: PlayConfig;
  result: SessionResult | null;
  customView: 'create' | 'saved';
};

type Actions = {
  set: (p: Partial<Persisted & Transient>) => void;
  showToast: (msg: string) => void;
  flip: (k: keyof Toggles) => void;
  setToggle: (k: keyof Toggles, v: boolean) => void;
  toggleFav: (pid: string) => void;
  openPattern: (pid: string) => void;
  setPlay: (p: Partial<PlayConfig>) => void;
  recordSession: (r: SessionResult) => void;
  updDraft: (p: Partial<Draft>) => void;
  updSeg: (p: Partial<Segment>) => void;
  moveSeg: (from: number, to: number) => void;
  loadSaved: (id: string) => void;
  saveDraft: () => void;
  deleteSaved: (id: string) => void;
  deleteData: () => void;
  deleteAccount: () => void;
};

export type Store = Persisted & Transient & Actions;

let toastTimer: ReturnType<typeof setTimeout> | undefined;

const initialPersisted = (): Persisted => ({
  onboarded: false,
  adultAsked: false,
  adultConfirmed: false,
  voiceVolume: 0.8,
  voiceFreq: 1,
  createdAt: Date.now(),
  name: '',
  premium: false,
  plan: 'yearly',
  tg: { ...DEFAULT_TOGGLES },
  limit: 8,
  defDur: 5,
  lockMode: 0,
  fav: {},
  saved: [],
  history: [],
  last: null,
  draft: newDraft(),
});

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialPersisted(),
      hydrated: false,
      toast: null,
      play: { pid: 'soft', intensity: 6, rhythm: 4, duration: 5 },
      result: null,
      customView: 'create',

      set: (p) => set(p),
      showToast: (msg) => {
        clearTimeout(toastTimer);
        set({ toast: msg });
        toastTimer = setTimeout(() => set({ toast: null }), 2200);
      },
      flip: (k) => set((s) => ({ tg: { ...s.tg, [k]: !s.tg[k] } })),
      setToggle: (k, v) => set((s) => ({ tg: { ...s.tg, [k]: v } })),
      toggleFav: (pid) => set((s) => ({ fav: { ...s.fav, [pid]: !s.fav[pid] } })),
      openPattern: (pid) => {
        const p = findPattern(pid);
        set((s) => ({ play: { ...s.play, pid, intensity: Math.min(p.int + 2, 10), duration: p.dur } }));
      },
      setPlay: (p) => set((s) => ({ play: { ...s.play, ...p } })),
      recordSession: (r) => set((s) => {
        const p = findPattern(r.pid);
        const history = r.elapsed >= 10
          ? [...s.history, { id: uid(), pid: r.pid, name: p.name, startedAt: Date.now() - r.elapsed * 1000, seconds: r.elapsed, intensity: r.intensity }].slice(-500)
          : s.history;
        return { result: r, history, last: { ...s.play } };
      }),
      updDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
      updSeg: (p) => set((s) => ({
        draft: { ...s.draft, segs: s.draft.segs.map((g, i) => (i === s.draft.sel ? { ...g, ...p } : g)) },
      })),
      moveSeg: (from, to) => {
        const d = get().draft;
        if (from === to || to < 0 || to >= d.segs.length) return;
        const a = d.segs.slice();
        const [g] = a.splice(from, 1);
        a.splice(to, 0, g);
        set({ draft: { ...d, segs: a, sel: to } });
      },
      loadSaved: (id) => {
        const p = get().saved.find((x) => x.id === id);
        if (!p) return;
        set({ draft: { segs: p.segs.map((g) => ({ ...g })), sel: 0, freq: p.freq, rhythm: p.rhythm, pulseLen: p.pulseLen, pauseLen: p.pauseLen, dur: p.dur, name: p.name } });
      },
      saveDraft: () => set((s) => {
        const d = s.draft;
        const pat: SavedPattern = {
          id: uid(), name: d.name.trim() || 'My Pattern', segs: d.segs.map((g) => ({ ...g })), freq: d.freq, rhythm: d.rhythm,
          pulseLen: d.pulseLen, pauseLen: d.pauseLen, dur: d.dur, createdAt: Date.now(),
        };
        return { saved: [pat, ...s.saved.filter((x) => x.name !== pat.name)], customView: 'saved' };
      }),
      deleteSaved: (id) => set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),
      deleteData: () => set({ saved: [], history: [], fav: {}, last: null }),
      deleteAccount: () => set({ ...initialPersisted(), result: null, customView: 'create' }),
    }),
    {
      name: 'onde-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s): Persisted => ({
        onboarded: s.onboarded, adultAsked: s.adultAsked, adultConfirmed: s.adultConfirmed, voiceVolume: s.voiceVolume, voiceFreq: s.voiceFreq, createdAt: s.createdAt, name: s.name, premium: s.premium, plan: s.plan, tg: s.tg, limit: s.limit,
        defDur: s.defDur, lockMode: s.lockMode, fav: s.fav, saved: s.saved, history: s.history, last: s.last, draft: s.draft,
      }),
      // Shallow merge would drop newly added toggles from older saves.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Persisted>;
        return { ...current, ...p, tg: { ...current.tg, ...p.tg } };
      },
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);

export const isPremiumLocked = (locked: boolean | undefined, premium: boolean) => !!locked && !premium;
