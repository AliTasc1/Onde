import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { AMBIENCE } from '../data/ambienceManifest';
import type { VoiceContext } from './voice';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const ambienceCounts = () => ({ bed: AMBIENCE.bed.length, rhythm: AMBIENCE.rhythm.length, accents: AMBIENCE.accents.length });
export const ambienceTotal = () => AMBIENCE.bed.length + AMBIENCE.rhythm.length + AMBIENCE.accents.length;

/** Beat length matches the haptic pulse period for the same rhythm. */
export const beatMs = (rhythm: number) => Math.max(260, 1500 - rhythm * 120);

const RHYTHM_VOICES = 3;

/**
 * Background sound layer (18+), mixed under the voice. Starts the moment a
 * session starts:
 * - bed: one looping track; speed follows rhythm, loudness follows intensity;
 * - rhythm: short sounds fired on every beat, in time with the vibration,
 *   so 1–2 s clips become one continuous rhythmic texture;
 * - accents: short one-shots (breaths, sighs…) dropped in densely between
 *   the voice lines, busier as intensity rises and near the peak.
 */
class Ambience {
  private bed: AudioPlayer | null = null;
  private beats: AudioPlayer[] = [];
  private accent: AudioPlayer | null = null;
  private tick: ReturnType<typeof setInterval> | undefined;
  private beatTimer: ReturnType<typeof setTimeout> | undefined;
  private accentTimer: ReturnType<typeof setTimeout> | undefined;
  private running = false;
  private paused = false;
  private volume = 0.7;
  private beatN = 0;
  private lastBeat = -1;
  private lastAccent = -1;
  private getContext: () => VoiceContext = () => ({ progress: 0, intensity: 5, rhythm: 4 });

  start(opts: { volume: number; getContext: () => VoiceContext }) {
    this.stop();
    if (!ambienceTotal()) return;
    this.volume = opts.volume;
    this.getContext = opts.getContext;
    this.running = true;
    this.paused = false;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers', shouldPlayInBackground: false }).catch(() => {});
    try {
      if (AMBIENCE.bed.length) {
        this.bed = createAudioPlayer(AMBIENCE.bed[Math.floor(Math.random() * AMBIENCE.bed.length)]);
        this.bed.loop = true;
        this.bed.shouldCorrectPitch = false;
        this.apply();
        this.bed.play();
      }
      if (AMBIENCE.rhythm.length) {
        for (let i = 0; i < RHYTHM_VOICES; i++) this.beats.push(createAudioPlayer(null));
        this.scheduleBeat(80);
      }
      if (AMBIENCE.accents.length) {
        this.accent = createAudioPlayer(null);
        this.scheduleAccent(rand(700, 1400));
      }
    } catch {
      this.stop();
      return;
    }
    this.tick = setInterval(() => this.apply(), 1000);
  }

  pause() {
    if (!this.running) return;
    this.paused = true;
    clearTimeout(this.beatTimer);
    clearTimeout(this.accentTimer);
    for (const p of [this.bed, this.accent, ...this.beats]) p?.pause();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.bed?.play();
    if (this.beats.length) this.scheduleBeat(100);
    if (this.accent) this.scheduleAccent(rand(500, 1200));
  }

  setVolume(v: number) {
    this.volume = v;
    this.apply();
  }

  stop() {
    this.running = false;
    clearInterval(this.tick);
    clearTimeout(this.beatTimer);
    clearTimeout(this.accentTimer);
    for (const p of [this.bed, this.accent, ...this.beats]) {
      if (!p) continue;
      try { p.pause(); p.remove(); } catch { /* already released */ }
    }
    this.bed = null;
    this.accent = null;
    this.beats = [];
  }

  /** 0.55 … 1.0 of the volume setting, following intensity. */
  private level() {
    return this.volume * (0.5 + 0.05 * this.getContext().intensity);
  }

  private apply() {
    if (!this.running || this.paused || !this.bed) return;
    const { rhythm } = this.getContext();
    this.bed.volume = this.level();
    const rate = 0.8 + rhythm * 0.06; // slow 0.86× … fast 1.4×
    if (Math.abs(this.bed.playbackRate - rate) > 0.02) {
      try { this.bed.setPlaybackRate(rate); } catch { /* unsupported on this platform */ }
    }
  }

  private scheduleBeat(ms: number) {
    clearTimeout(this.beatTimer);
    this.beatTimer = setTimeout(() => this.playBeat(), ms);
  }

  private playBeat() {
    if (!this.running || this.paused || !this.beats.length) return;
    const list = AMBIENCE.rhythm;
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === this.lastBeat) i = (i + 1) % list.length;
    this.lastBeat = i;
    // Rotate players so a beat never cuts off the previous one's tail.
    const p = this.beats[this.beatN++ % this.beats.length];
    try {
      p.replace(list[i]);
      p.volume = Math.min(1, this.level() * rand(0.85, 1));
      p.shouldCorrectPitch = false;
      p.setPlaybackRate(rand(0.94, 1.06));
      p.play();
    } catch { /* skip this beat */ }
    // A little human timing so it never sounds like a metronome.
    this.scheduleBeat(beatMs(this.getContext().rhythm) * rand(0.93, 1.07));
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
      this.accent.volume = Math.min(1, this.level() * 1.05);
      this.accent.play();
    } catch { /* skip this one */ }
    const { intensity, progress } = this.getContext();
    const busy = Math.min(1, (intensity / 10) * 0.7 + (progress > 0.6 && progress < 0.92 ? 0.3 : 0));
    // Dense: roughly every 1.5–4 s, down to ~1–2 s at full intensity near the peak.
    this.scheduleAccent(rand(1.5, 4) * 1000 * (1.2 - busy * 0.6));
  }
}

export const ambience = new Ambience();
