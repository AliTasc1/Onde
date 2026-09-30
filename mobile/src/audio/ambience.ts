import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { AMBIENCE } from '../data/ambienceManifest';
import { voice, type VoiceContext } from './voice';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const ambienceCounts = () => ({ bed: AMBIENCE.bed.length, rhythm: AMBIENCE.rhythm.length, accents: AMBIENCE.accents.length, cries: AMBIENCE.cries.length });
export const ambienceTotal = () => AMBIENCE.bed.length + AMBIENCE.rhythm.length + AMBIENCE.accents.length + AMBIENCE.cries.length;

/** How far the background drops while the voice is speaking. */
const DUCK = 0.4;
/** Relative level of each layer under the volume setting. */
const MIX = { bed: 0.8, rhythm: 0.7, accents: 0.75, cries: 0.9 };

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
 *   the voice lines, busier as intensity rises and near the peak;
 * - cries: louder exclamations, only in the voice's pauses, mostly once the
 *   session has warmed up.
 * Everything ducks while the voice is speaking so the voice stays on top.
 */
class Ambience {
  private bed: AudioPlayer | null = null;
  private beats: AudioPlayer[] = [];
  private accent: AudioPlayer | null = null;
  private cry: AudioPlayer | null = null;
  private cryTimer: ReturnType<typeof setTimeout> | undefined;
  private lastCry = -1;
  private tick: ReturnType<typeof setInterval> | undefined;
  private beatTimer: ReturnType<typeof setTimeout> | undefined;
  private accentTimer: ReturnType<typeof setTimeout> | undefined;
  private running = false;
  private paused = false;
  private volume = 0.35;
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
      if (AMBIENCE.cries.length) {
        this.cry = createAudioPlayer(null);
        this.scheduleCry(rand(8000, 14000));
      }
    } catch {
      this.stop();
      return;
    }
    // Frequent enough to duck smoothly when the voice starts a line.
    this.tick = setInterval(() => this.apply(), 250);
  }

  pause() {
    if (!this.running) return;
    this.paused = true;
    clearTimeout(this.beatTimer);
    clearTimeout(this.accentTimer);
    clearTimeout(this.cryTimer);
    for (const p of [this.bed, this.accent, this.cry, ...this.beats]) p?.pause();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.bed?.play();
    if (this.beats.length) this.scheduleBeat(100);
    if (this.accent) this.scheduleAccent(rand(500, 1200));
    if (this.cry) this.scheduleCry(rand(4000, 8000));
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
    clearTimeout(this.cryTimer);
    for (const p of [this.bed, this.accent, this.cry, ...this.beats]) {
      if (!p) continue;
      try { p.pause(); p.remove(); } catch { /* already released */ }
    }
    this.bed = null;
    this.accent = null;
    this.cry = null;
    this.beats = [];
  }

  /** Layer volume: setting × layer mix × intensity (55–100 %) × ducking under the voice. */
  private level(layer: keyof typeof MIX) {
    const duck = voice.isSpeaking ? DUCK : 1;
    return Math.min(1, this.volume * MIX[layer] * (0.5 + 0.05 * this.getContext().intensity) * duck);
  }

  private apply() {
    if (!this.running || this.paused || !this.bed) return;
    const { rhythm } = this.getContext();
    this.bed.volume = this.level('bed');
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
      p.volume = this.level('rhythm') * rand(0.85, 1);
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
      this.accent.volume = this.level('accents');
      this.accent.play();
    } catch { /* skip this one */ }
    const { intensity, progress } = this.getContext();
    const busy = Math.min(1, (intensity / 10) * 0.7 + (progress > 0.6 && progress < 0.92 ? 0.3 : 0));
    // Dense: roughly every 1.5–4 s, down to ~1–2 s at full intensity near the peak.
    this.scheduleAccent(rand(1.5, 4) * 1000 * (1.2 - busy * 0.6));
  }

  private scheduleCry(ms: number) {
    clearTimeout(this.cryTimer);
    this.cryTimer = setTimeout(() => this.playCry(), ms);
  }

  private playCry() {
    if (!this.running || this.paused || !this.cry) return;
    const { intensity, progress } = this.getContext();
    // Wait for a pause in the voice, and for the session to warm up.
    if (voice.isSpeaking || (progress < 0.2 && intensity < 7)) return this.scheduleCry(700);
    const list = AMBIENCE.cries;
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === this.lastCry) i = (i + 1) % list.length;
    this.lastCry = i;
    try {
      this.cry.replace(list[i]);
      this.cry.volume = this.level('cries');
      this.cry.play();
    } catch { /* skip this one */ }
    const busy = Math.min(1, (intensity / 10) * 0.6 + (progress > 0.55 ? 0.4 : 0));
    // Occasional: ~every 12–25 s, down to ~6–12 s at full intensity near the peak.
    this.scheduleCry(rand(12, 25) * 1000 * (1.1 - busy * 0.6));
  }
}

export const ambience = new Ambience();
