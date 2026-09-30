import type { Segment, Shape } from '../data/patterns';
import { shapeVal } from '../lib/shapes';
import type { Step } from './engine';

/**
 * ~4 s looping pattern for a library session.
 * - `constant`: one unbroken vibration (strength from intensity).
 * - others: rhythm sets the pulse rate; intensity sets how much of each
 *   pulse is "on" (10 ≈ almost continuous) and how strong it is. The
 *   pattern's shape still colours the loop.
 */
export function sessionSteps(shape: Shape, intensity: number, rhythm: number): Step[] {
  const strength = 0.35 + 0.065 * intensity; // 1 → 0.42, 10 → 1.0
  if (shape === 'constant') return [{ on: 4000, off: 0, level: Math.min(1, strength) }];
  const period = Math.max(260, 1500 - rhythm * 120); // slow 1380 ms … fast 300 ms
  const duty = Math.min(0.92, 0.45 + intensity * 0.05); // 1 → 50 %, 10 → 92 %
  const on = Math.round(period * duty);
  const off = period - on;
  const n = Math.max(1, Math.round(4000 / period));
  const steps: Step[] = [];
  for (let i = 0; i < n; i++) {
    const mod = 0.75 + 0.25 * shapeVal(shape, n === 1 ? 0 : i / (n - 1), 1);
    steps.push({ on, off, level: Math.min(1, strength * mod) });
  }
  return steps;
}

export type GlobalParams = { pulseLen: number; pauseLen: number };

const SLICE_ON = 130;
const SLICE_OFF = 20;

/** One pass through a custom timeline. */
export function timelineSteps(segs: Segment[], g: GlobalParams, limit = 10): Step[] {
  const out: Step[] = [];
  segs.forEach((seg) => {
    const ms = seg.dur * 1000;
    const lvl = Math.min(seg.int, limit) / 10;
    if (seg.type === 'Pause' || lvl <= 0) {
      out.push({ on: 0, off: ms, level: 0 });
      return;
    }
    if (seg.type === 'Constant') {
      out.push({ on: ms, off: 0, level: Math.max(lvl, 0.5) });
      return;
    }
    if (seg.type === 'Pulse') {
      for (let t = 0; t < ms; t += g.pulseLen + g.pauseLen) out.push({ on: g.pulseLen, off: g.pauseLen, level: lvl });
      return;
    }
    // Wave / ramps: short slices whose strength follows the segment's curve.
    const slice = SLICE_ON + SLICE_OFF;
    for (let t = 0; t < ms; t += slice) {
      out.push({ on: SLICE_ON, off: SLICE_OFF, level: lvl * shapeVal(seg.type, t / ms, 1) });
    }
  });
  return out;
}
