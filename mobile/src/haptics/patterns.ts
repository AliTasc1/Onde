import type { Segment, Shape } from '../data/patterns';
import { shapeVal } from '../lib/shapes';
import type { Step } from './engine';

/**
 * ~4 s looping pattern for a library session. Pulse length grows with
 * intensity and the gap shrinks as rhythm speeds up (same maths as the
 * prototype); the pattern's shape modulates strength across the loop.
 */
export function sessionSteps(shape: Shape, intensity: number, rhythm: number): Step[] {
  const on = 60 + intensity * 22;
  const off = Math.max(120, 1000 - rhythm * 85);
  const n = Math.max(1, Math.round(4000 / (on + off)));
  const steps: Step[] = [];
  for (let i = 0; i < n; i++) {
    const mod = 0.55 + 0.45 * shapeVal(shape, n === 1 ? 0 : i / (n - 1), 1);
    steps.push({ on, off, level: Math.min(1, (intensity / 10) * mod) });
  }
  return steps;
}

export type GlobalParams = { pulseLen: number; pauseLen: number };

const SLICE_ON = 110;
const SLICE_OFF = 40;

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
