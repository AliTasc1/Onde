import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { AMBIENCE } from '../data/ambienceManifest';
import { voice, type VoiceContext } from './voice';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const ambienceCounts = () => ({ bed: AMBIENCE.bed.length, rhythm: AMBIENCE.rhythm.length, accents: AMBIENCE.accents.length, cries: AMBIENCE.cries.length });
export const ambienceTotal = () => AMBIENCE.bed.length + AMBIENCE.rhythm.length + AMBIENCE.accents.length + AMBIENCE.cries.length;

/** How far the background drops while the voice is speaking. */
const DUCK = 0.4;
/** Relative level of each layer under the volume setting. */
const MIX = { bed: 0.8, rhythm: 0.65, accents: 0.75, cries: 0.9 };

/**
 * One slow body movement. Deliberately slower than the vibration pulse:
 * rhythm 1 ≈ 2.1 s, rhythm 5 ≈ 1.6 s, rhythm 10 ≈ 1.0 s.
 */
export const motionMs = (rhythm: number) => Math.max(950, 2200 - rhythm * 120);

const MOTION_VOICES = 3;
/** Minimum breathing room after a breath / moan / cry before the next one. */
const BREATHING_ROOM = 1800;

/**
 * Background "bed scene" (18+), mixed under the voice. It starts with the
 * session and is paced like people, not a metronome:
 * - bed: one looping track that slowly swells and settles;
 * - motion: slow, heavy movements in phrases of a few moves followed by a
 *   pause, each phrase rising and falling in loudness;
 * - accents: breaths / sighs / moans placed in the voice's pauses, never
 *   stacked on each other;
 * - cries: rarer, fuller exclamations, also only in the pauses.
 * Everything ducks while the voice speaks so the voice stays on top.
 */
class Ambience {
  private bed: AudioPlayer | null = null;
  private moves: AudioPlayer[] = [];
  private accent: AudioPlayer | null = null;
  private cry: AudioPlayer | null = null;
  private tick: ReturnType<typeof setInterval> | undefined;
  private moveTimer: ReturnType<typeof setTimeout> | undefined;
  private accentTimer: ReturnType<typeof setTimeout> | undefined;
  private cryTimer: ReturnType<typeof setTimeout> | undefined;
  private running = false;
  private paused = false;
  private volume = 0.35;
  private startedAt = 0;
  private moveN = 0;
  private phraseLeft = 0;
  private phraseLen = 0;
  private quietUntil = 0;
  private last = { move: -1, accent: -1, cry: -1 };
  private getContext: () => VoiceContext = () => ({ progress: 0, intensity: 5, rhythm: 4 });

  start(opts: { volume: number; getContext: () => VoiceContext }) {
    this.stop();
    if (!ambienceTotal()) return;
    this.volume = opts.volume;
    this.getContext = opts.getContext;
    this.running = true;
    this.paused = false;
    this.startedAt = Date.now();
    this.quietUntil = 0;
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
        for (let i = 0; i < MOTION_VOICES; i++) this.moves.push(createAudioPlayer(null));
        this.phraseLeft = 0;
        this.scheduleMove(rand(600, 1200));
      }
      if (AMBIENCE.accents.length) {
        this.accent = createAudioPlayer(null);
        this.scheduleAccent(rand(2500, 4500));
      }
      if (AMBIENCE.cries.length) {
        this.cry = createAudioPlayer(null);
        this.scheduleCry(rand(18000, 28000));
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
    for (const t of [this.moveTimer, this.accentTimer, this.cryTimer]) clearTimeout(t);
    for (const p of [this.bed, this.accent, this.cry, ...this.moves]) p?.pause();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.bed?.play();
    if (this.moves.length) { this.phraseLeft = 0; this.scheduleMove(rand(800, 1500)); }
    if (this.accent) this.scheduleAccent(rand(2000, 4000));
    if (this.cry) this.scheduleCry(rand(10000, 18000));
  }

  setVolume(v: number) {
    this.volume = v;
    this.apply();
  }

  stop() {
    this.running = false;
    clearInterval(this.tick);
    for (const t of [this.moveTimer, this.accentTimer, this.cryTimer]) clearTimeout(t);
    for (const p of [this.bed, this.accent, this.cry, ...this.moves]) {
      if (!p) continue;
      try { p.pause(); p.remove(); } catch { /* already released */ }
    }
    this.bed = null;
    this.accent = null;
    this.cry = null;
    this.moves = [];
  }

  /** Layer volume: setting × layer mix × intensity (55–100 %) × ducking under the voice. */
  private level(layer: keyof typeof MIX) {
    const duck = voice.isSpeaking ? DUCK : 1;
    return Math.min(1, this.volume * MIX[layer] * (0.5 + 0.05 * this.getContext().intensity) * duck);
  }

  /** Slow swell of the whole scene (~20 s period) so it never sits flat. */
  private swell() {
    const t = (Date.now() - this.startedAt) / 1000;
    return 0.82 + 0.18 * Math.sin((t / 20) * 2 * Math.PI);
  }

  private apply() {
    if (!this.running || this.paused || !this.bed) return;
    const { rhythm } = this.getContext();
    this.bed.volume = this.level('bed') * this.swell();
    const rate = 0.85 + rhythm * 0.03; // slow 0.88× … fast 1.15×
    if (Math.abs(this.bed.playbackRate - rate) > 0.02) {
      try { this.bed.setPlaybackRate(rate); } catch { /* unsupported on this platform */ }
    }
  }

  private pick(list: number[], key: keyof Ambience['last']) {
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === this.last[key]) i = (i + 1) % list.length;
    this.last[key] = i;
    return list[i];
  }

  /** Can a breath / moan / cry play now without crowding the voice or each other? */
  private quiet() {
    return !voice.isSpeaking && Date.now() >= this.quietUntil;
  }

  private hold(p: AudioPlayer) {
    const dur = p.duration > 0 && Number.isFinite(p.duration) ? p.duration * 1000 : 2500;
    this.quietUntil = Date.now() + dur + BREATHING_ROOM;
  }

  // ---- slow movements, in phrases ----
  private scheduleMove(ms: number) {
    clearTimeout(this.moveTimer);
    this.moveTimer = setTimeout(() => this.playMove(), ms);
  }

  private playMove() {
    if (!this.running || this.paused || !this.moves.length) return;
    const { rhythm, intensity } = this.getContext();
    if (this.phraseLeft <= 0) {
      // New phrase: a handful of movements, more of them as intensity rises.
      this.phraseLen = Math.round(rand(3, 5) + intensity * 0.4);
      this.phraseLeft = this.phraseLen;
    }
    // Loudness rises through the phrase and eases off at its end.
    const pos = 1 - this.phraseLeft / this.phraseLen;
    const shape = 0.6 + 0.4 * Math.sin(pos * Math.PI);
    if (Math.random() > 0.12) { // the odd skipped move keeps it human
      const p = this.moves[this.moveN++ % this.moves.length];
      try {
        p.replace(this.pick(AMBIENCE.rhythm, 'move'));
        p.volume = this.level('rhythm') * shape * this.swell() * rand(0.85, 1);
        p.shouldCorrectPitch = false;
        p.setPlaybackRate(rand(0.86, 0.97)); // heavier, slower
        p.play();
      } catch { /* skip this move */ }
    }
    this.phraseLeft--;
    const beat = motionMs(rhythm) * rand(0.88, 1.14);
    if (this.phraseLeft > 0) return this.scheduleMove(beat);
    // Pause between phrases: longer when calm, shorter as intensity rises.
    this.scheduleMove(beat + rand(1400, 3800) * (1.2 - intensity * 0.06));
  }

  // ---- breaths, sighs, moans in the pauses ----
  private scheduleAccent(ms: number) {
    clearTimeout(this.accentTimer);
    this.accentTimer = setTimeout(() => this.playAccent(), ms);
  }

  private playAccent() {
    if (!this.running || this.paused || !this.accent) return;
    if (!this.quiet()) return this.scheduleAccent(700);
    try {
      this.accent.replace(this.pick(AMBIENCE.accents, 'accent'));
      this.accent.volume = this.level('accents');
      this.accent.play();
      this.hold(this.accent);
    } catch { /* skip this one */ }
    const { intensity, progress } = this.getContext();
    const busy = Math.min(1, (intensity / 10) * 0.6 + (progress > 0.6 && progress < 0.92 ? 0.3 : 0));
    // Roughly every 6–12 s when calm, ~4–7 s at full intensity near the peak.
    this.scheduleAccent(rand(6, 12) * 1000 * (1.1 - busy * 0.5));
  }

  // ---- rarer, fuller cries ----
  private scheduleCry(ms: number) {
    clearTimeout(this.cryTimer);
    this.cryTimer = setTimeout(() => this.playCry(), ms);
  }

  private playCry() {
    if (!this.running || this.paused || !this.cry) return;
    const { intensity, progress } = this.getContext();
    if (!this.quiet() || (progress < 0.25 && intensity < 7)) return this.scheduleCry(900);
    try {
      this.cry.replace(this.pick(AMBIENCE.cries, 'cry'));
      this.cry.volume = this.level('cries');
      this.cry.play();
      this.hold(this.cry);
    } catch { /* skip this one */ }
    const busy = Math.min(1, (intensity / 10) * 0.6 + (progress > 0.55 ? 0.4 : 0));
    this.scheduleCry(rand(22, 40) * 1000 * (1.15 - busy * 0.5));
  }
}

export const ambience = new Ambience();
