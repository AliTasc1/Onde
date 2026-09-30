import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { AMBIENCE } from '../data/ambienceManifest';
import type { VoiceContext } from './voice';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const ambienceCounts = () => ({ bed: AMBIENCE.bed.length, accents: AMBIENCE.accents.length });

/**
 * Background sound layer (18+), mixed under the voice:
 * - bed: one looping track whose speed follows rhythm and whose loudness
 *   follows intensity;
 * - accents: one-shot sounds (breaths, sighs…) dropped in between, more
 *   often as intensity rises and the session nears its peak.
 */
class Ambience {
  private bed: AudioPlayer | null = null;
  private accent: AudioPlayer | null = null;
  private tick: ReturnType<typeof setInterval> | undefined;
  private accentTimer: ReturnType<typeof setTimeout> | undefined;
  private running = false;
  private paused = false;
  private volume = 0.6;
  private bedIndex = 0;
  private lastAccent = -1;
  private getContext: () => VoiceContext = () => ({ progress: 0, intensity: 5, rhythm: 4 });

  start(opts: { volume: number; getContext: () => VoiceContext }) {
    this.stop();
    const { bed, accents } = ambienceCounts();
    if (!bed && !accents) return;
    this.volume = opts.volume;
    this.getContext = opts.getContext;
    this.running = true;
    this.paused = false;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers', shouldPlayInBackground: false }).catch(() => {});
    try {
      if (bed) {
        this.bedIndex = Math.floor(Math.random() * bed);
        this.bed = createAudioPlayer(AMBIENCE.bed[this.bedIndex]);
        this.bed.loop = true;
        this.bed.shouldCorrectPitch = false;
        this.apply();
        this.bed.play();
      }
      if (accents) {
        this.accent = createAudioPlayer(null);
        this.scheduleAccent(rand(3000, 6000));
      }
    } catch {
      this.stop();
      return;
    }
    // Follow intensity / rhythm changes during the session.
    this.tick = setInterval(() => this.apply(), 1000);
  }

  pause() {
    if (!this.running) return;
    this.paused = true;
    clearTimeout(this.accentTimer);
    this.bed?.pause();
    this.accent?.pause();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.bed?.play();
    if (this.accent) this.scheduleAccent(rand(2000, 4000));
  }

  setVolume(v: number) {
    this.volume = v;
    this.apply();
  }

  stop() {
    this.running = false;
    clearInterval(this.tick);
    clearTimeout(this.accentTimer);
    for (const p of [this.bed, this.accent]) {
      if (!p) continue;
      try { p.pause(); p.remove(); } catch { /* already released */ }
    }
    this.bed = null;
    this.accent = null;
  }

  private apply() {
    if (!this.running || this.paused) return;
    const { intensity, rhythm } = this.getContext();
    if (this.bed) {
      this.bed.volume = this.volume * (0.45 + 0.055 * intensity); // 1 → 50 %, 10 → 100 % of the setting
      const rate = 0.8 + rhythm * 0.06; // slow 0.86× … fast 1.4×
      if (Math.abs(this.bed.playbackRate - rate) > 0.02) {
        try { this.bed.setPlaybackRate(rate); } catch { /* unsupported on this platform */ }
      }
    }
  }

  private scheduleAccent(ms: number) {
    clearTimeout(this.accentTimer);
    this.accentTimer = setTimeout(() => this.playAccent(), ms);
  }

  private playAccent() {
    if (!this.running || this.paused || !this.accent) return;
    const list = AMBIENCE.accents;
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === this.lastAccent) i = (i + 1) % list.length;
    this.lastAccent = i;
    try {
      this.accent.replace(list[i]);
      this.accent.volume = Math.min(1, this.volume * 0.9);
      this.accent.play();
    } catch { /* skip this one */ }
    const { intensity, progress } = this.getContext();
    // Busier as intensity rises and the session approaches its peak.
    const busy = Math.min(1, intensity / 10 * 0.7 + (progress > 0.6 && progress < 0.92 ? 0.3 : 0));
    this.scheduleAccent(rand(5, 9) * 1000 * (1.6 - busy));
  }
}

export const ambience = new Ambience();
