import type { Segment } from '../data/patterns';
import { SEG } from '../data/patterns';

/** Normalised amplitude (0–1) of a waveform shape at t ∈ [0, 1]. */
export function shapeVal(shape: string, t: number, f: number): number {
  const s = Math.sin;
  switch (shape) {
    case 'constant': return 0.92;
    case 'Constant': return 0.95;
    case 'pulse': return Math.floor(t * f * 2) % 2 === 0 ? 0.85 : 0.2;
    case 'rhythm': return [0.9, 0.35, 0.62, 0.25][Math.floor(t * f * 4) % 4];
    case 'fade': return (0.55 + 0.4 * s(t * 2 * Math.PI * f)) * (1 - t * 0.65);
    case 'swell': return 0.15 + 0.8 * s(t * Math.PI) * (0.75 + 0.25 * s(t * 2 * Math.PI * f * 2));
    case 'Pulse': return Math.floor(t * f) % 2 === 0 ? 0.9 : 0.25;
    case 'Wave': return 0.5 + 0.45 * s(t * 2 * Math.PI);
    case 'Ramp Up': return 0.12 + 0.85 * t;
    case 'Ramp Down': return 0.97 - 0.85 * t;
    case 'Pause': return 0.05;
    default: return 0.5 + 0.42 * s(t * 2 * Math.PI * f);
  }
}

export type Bar = { h: number; c?: string };

/** Bar heights as percentages (8–100). */
export function bars(shape: string, f: number, n: number, scale = 1, c?: string): Bar[] {
  const a: Bar[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    a.push({ h: Math.max(8, Math.round(shapeVal(shape, t, f) * scale * 100)), c });
  }
  return a;
}

export const segScale = (g: Segment) => (g.type === 'Pause' ? 1 : 0.35 + g.int * 0.065);

export const segBars = (g: Segment, n: number) => bars(g.type, 6, n, segScale(g));

export const cycleSeconds = (segs: Segment[]) => segs.reduce((a, g) => a + g.dur, 0);

/** Sampled waveform of a whole segment timeline (Pattern Preview). */
export function timelineBars(segs: Segment[], freq: number, n: number, minH = 4): Bar[] {
  const cycle = cycleSeconds(segs);
  const out: Bar[] = [];
  if (!segs.length || cycle <= 0) return out;
  for (let k = 0; k < n; k++) {
    const t = ((k + 0.5) / n) * cycle;
    let acc = 0;
    let g = segs[0];
    for (const x of segs) {
      if (t < acc + x.dur) { g = x; break; }
      acc += x.dur;
    }
    const lt = (t - acc) / g.dur;
    const v = shapeVal(g.type, lt, Math.max(1, Math.round((g.dur * freq) / 6))) * segScale(g);
    out.push({ h: Math.max(minH, Math.round(v * 100)), c: SEG[g.type].c });
  }
  return out;
}

export const averageIntensity = (segs: Segment[]) => {
  const act = segs.filter((g) => g.type !== 'Pause');
  return act.length ? act.reduce((a, g) => a + g.int, 0) / act.length : 0;
};

/** SVG path for a sine wave across width w. */
export function sinePath(w: number, h: number, amp: number, periods: number, phase = 0, steps = 160): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = h / 2 + amp * Math.sin((i / steps) * periods * 2 * Math.PI + phase);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}
