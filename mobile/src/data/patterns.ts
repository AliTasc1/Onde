export type Shape = 'sine' | 'pulse' | 'rhythm' | 'fade' | 'swell' | 'constant';

export type Pattern = {
  id: string;
  name: string;
  cat: string;
  tags: string[];
  /** Suggested duration, minutes. */
  dur: number;
  /** Base intensity 1–10. */
  int: number;
  shape: Shape;
  /** Visual frequency used when drawing the waveform bars. */
  f: number;
  locked?: boolean;
  desc: string;
};

export const PATTERNS: Pattern[] = [
  { id: 'constant', name: 'Constant Vibe', cat: 'Steady', tags: ['Steady', 'Intense'], dur: 10, int: 8, shape: 'constant', f: 1, desc: 'One strong, unbroken vibration — like a classic vibrator. Intensity sets the strength.' },
  { id: 'soft', name: 'Soft Wave', cat: 'Gentle', tags: ['Gentle', 'Wave', 'Relax'], dur: 5, int: 4, shape: 'sine', f: 2, desc: 'Slow, rolling waves that rise and fall gently.' },
  { id: 'calm', name: 'Calm Pulse', cat: 'Pulse', tags: ['Pulse', 'Relax'], dur: 3, int: 5, shape: 'pulse', f: 5, desc: 'Even, steady pulses at a resting pace.' },
  { id: 'deep', name: 'Deep Rhythm', cat: 'Rhythmic', tags: ['Rhythmic'], dur: 10, int: 7, shape: 'rhythm', f: 6, locked: true, desc: 'A layered rhythm with strong and soft beats.' },
  { id: 'slow', name: 'Slow Flow', cat: 'Relax', tags: ['Wave', 'Relax', 'Sleep'], dur: 15, int: 3, shape: 'sine', f: 1, desc: 'One long, unhurried wave on repeat.' },
  { id: 'night', name: 'Night Wave', cat: 'Sleep', tags: ['Sleep', 'Gentle', 'Wave'], dur: 10, int: 2, shape: 'fade', f: 2, desc: 'Softens gradually as the session winds down.' },
  { id: 'balanced', name: 'Balanced Pulse', cat: 'Focus', tags: ['Focus', 'Pulse', 'Rhythmic'], dur: 5, int: 6, shape: 'pulse', f: 7, desc: 'A clear, even pulse that helps you settle in.' },
  { id: 'tide', name: 'Evening Tide', cat: 'Wave', tags: ['Wave', 'Relax'], dur: 10, int: 5, shape: 'swell', f: 3, locked: true, desc: 'Builds like a tide, then slowly recedes.' },
  { id: 'still', name: 'Still Point', cat: 'Focus', tags: ['Focus', 'Gentle'], dur: 3, int: 3, shape: 'rhythm', f: 3, desc: 'Minimal taps with long, quiet pauses.' },
];

export const CATEGORIES = ['All', 'Steady', 'Intense', 'Gentle', 'Rhythmic', 'Pulse', 'Wave', 'Relax', 'Focus', 'Sleep'];

export const findPattern = (id?: string | null) => PATTERNS.find((p) => p.id === id) ?? PATTERNS.find((p) => p.id === 'soft')!;

export type SegType = 'Constant' | 'Pulse' | 'Wave' | 'Ramp Up' | 'Ramp Down' | 'Pause';

export type Segment = { type: SegType; int: number; dur: number };

export type GradientSpec = { colors: readonly [string, string, ...string[]]; start: { x: number; y: number }; end: { x: number; y: number } };

const vertical = (a: string, b: string): GradientSpec => ({ colors: [a, b], start: { x: 0, y: 0 }, end: { x: 0, y: 1 } });
const horizontal = (a: string, b: string): GradientSpec => ({ colors: [a, b], start: { x: 0, y: 0 }, end: { x: 1, y: 0 } });

export const SEG: Record<SegType, { bg: GradientSpec; c: string; short: string; desc: string }> = {
  Constant: { bg: vertical('#EC4899', '#A12D8F'), c: '#EC4899', short: 'Steady', desc: 'One unbroken, strong vibration' },
  Pulse: { bg: vertical('#8B5CF6', '#6A3DE0'), c: '#8B5CF6', short: 'Pulse', desc: 'Short, distinct taps' },
  Wave: { bg: vertical('#B197FC', '#7C5CE6'), c: '#B197FC', short: 'Wave', desc: 'Smooth rise and fall' },
  'Ramp Up': { bg: horizontal('#4C2FA6', '#C45CC8'), c: '#C45CC8', short: 'Ramp ↑', desc: 'Gradually builds intensity' },
  'Ramp Down': { bg: horizontal('#C45CC8', '#4C2FA6'), c: '#A560D8', short: 'Ramp ↓', desc: 'Gradually softens' },
  Pause: { bg: vertical('#2A2A38', '#2A2A38'), c: '#3A3A4D', short: 'Pause', desc: 'A moment of stillness' },
};

export const SEG_TYPES = Object.keys(SEG) as SegType[];

export const MAX_SEGMENTS = 10;
/** Saved-pattern allowance on the free plan (shown on the paywall). */
export const FREE_SAVED_LIMIT = 3;

export const DEFAULT_SEGMENTS: Segment[] = [
  { type: 'Pulse', int: 6, dur: 4 },
  { type: 'Pause', int: 0, dur: 2 },
  { type: 'Pulse', int: 5, dur: 3 },
  { type: 'Wave', int: 7, dur: 8 },
  { type: 'Ramp Down', int: 6, dur: 5 },
];

export const rhythmLabel = (r: number, labels: readonly [string, string, string]) => labels[r <= 3 ? 0 : r <= 7 ? 1 : 2];
