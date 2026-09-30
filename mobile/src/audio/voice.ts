import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import linesTr from '../../voice/lines.tr.json';
import { VOICE_CLIPS } from '../data/voiceManifest';

export type VoiceGroup = 'open' | 'flow' | 'ask' | 'rising' | 'close';
export type VoiceContext = { progress: number; intensity: number; rhythm: number };
export type VoiceFrequency = 0 | 1 | 2;

type LineFile = { groups: Record<VoiceGroup, { id: string; text: string }[]> };
const LINE_FILES: Record<string, LineFile> = { tr: linesTr as LineFile };

export const VOICE_LANG = 'tr';
export const FREQUENCY_LABELS = ['Rarely', 'Normal', 'Often'] as const;
const FREQUENCY_FACTOR = [1.6, 1, 0.6];

/** Number of bundled clips for a language (0 until the voice pack is generated). */
export const voiceClipCount = (lang = VOICE_LANG) => Object.keys(VOICE_CLIPS[lang] ?? {}).length;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Whispered voice companion. Picks lines that fit the moment (opening,
 * steady flow, check-ins, rising intensity, winding down) and leaves
 * natural pauses between them. Faster rhythm → shorter pauses.
 */
class VoiceCompanion {
  private player: AudioPlayer | null = null;
  private sub: { remove: () => void } | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private running = false;
  private paused = false;
  private speaking = false;
  private played = 0;
  private bags: Partial<Record<VoiceGroup, string[]>> = {};
  private lang = VOICE_LANG;
  private frequency: VoiceFrequency = 1;
  private getContext: () => VoiceContext = () => ({ progress: 0, intensity: 5, rhythm: 4 });

  start(opts: { lang?: string; volume: number; frequency: VoiceFrequency; getContext: () => VoiceContext }) {
    this.stop();
    this.lang = opts.lang ?? VOICE_LANG;
    if (!voiceClipCount(this.lang)) return;
    this.frequency = opts.frequency;
    this.getContext = opts.getContext;
    this.running = true;
    this.paused = false;
    this.played = 0;
    this.bags = {};
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers', shouldPlayInBackground: false }).catch(() => {});
    try {
      this.player = createAudioPlayer(null);
      this.player.volume = opts.volume;
      this.sub = this.player.addListener('playbackStatusUpdate', (s) => {
        if (s.didJustFinish && this.speaking) {
          this.speaking = false;
          this.schedule(this.gap());
        }
      });
    } catch {
      this.running = false;
      return;
    }
    this.schedule(2500);
  }

  pause() {
    if (!this.running) return;
    this.paused = true;
    clearTimeout(this.timer);
    this.speaking = false;
    this.player?.pause();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.schedule(1500);
  }

  setVolume(v: number) {
    if (this.player) this.player.volume = v;
  }

  stop() {
    this.running = false;
    this.paused = false;
    this.speaking = false;
    clearTimeout(this.timer);
    this.sub?.remove();
    this.sub = null;
    if (this.player) {
      try { this.player.pause(); this.player.remove(); } catch { /* already released */ }
    }
    this.player = null;
  }

  private schedule(ms: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.speak(), ms);
  }

  private gap() {
    const { rhythm } = this.getContext();
    const [lo, hi] = rhythm <= 3 ? [10, 16] : rhythm <= 7 ? [7, 12] : [4, 8];
    return rand(lo, hi) * 1000 * FREQUENCY_FACTOR[this.frequency];
  }

  private pickGroup(): VoiceGroup {
    const { progress, intensity, rhythm } = this.getContext();
    if (this.played < 2 && progress < 0.25) return 'open';
    if (progress >= 0.88) return 'close';
    const r = Math.random();
    if (intensity >= 7 || rhythm >= 7) return r < 0.55 ? 'rising' : r < 0.8 ? 'ask' : 'flow';
    return r < 0.7 ? 'flow' : 'ask';
  }

  /** Shuffle-bag per group so lines don't repeat until all have played. */
  private nextId(group: VoiceGroup): string | null {
    const clips = VOICE_CLIPS[this.lang] ?? {};
    let bag = this.bags[group];
    if (!bag?.length) {
      bag = (LINE_FILES[this.lang]?.groups[group] ?? []).map((l) => l.id).filter((id) => clips[id] != null);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      this.bags[group] = bag;
    }
    return bag.pop() ?? null;
  }

  private speak() {
    if (!this.running || this.paused || !this.player) return;
    const group = this.pickGroup();
    const id = this.nextId(group) ?? this.nextId('flow');
    const src = id ? VOICE_CLIPS[this.lang]?.[id] : undefined;
    if (src == null) return this.schedule(this.gap());
    try {
      this.player.replace(src);
      this.player.play();
      this.speaking = true;
      this.played++;
      // Watchdog in case the finish event never arrives.
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.speaking) { this.speaking = false; this.schedule(this.gap()); }
      }, 20000);
    } catch {
      this.schedule(this.gap());
    }
  }
}

export const voice = new VoiceCompanion();
