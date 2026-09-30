import * as ExpoHaptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

/**
 * One haptic step: vibrate for `on` ms at `level` (0–1), then rest for `off` ms.
 *
 * Android plays steps through the system vibrator at full motor strength;
 * lower levels trim the "on" time slightly. iOS has no duration API from JS,
 * so strong steps (level ≥ 0.45) use the system vibration — the same strong
 * buzz as an incoming call — re-fired every ~400 ms for as long as the step
 * lasts, which gives a continuous vibration. Gentle steps use Taptic impacts.
 * A Core Haptics / VibrationEffect module (development build) would add true
 * amplitude control; this is the strongest option available in Expo Go.
 */
export type Step = { on: number; off: number; level: number };

type ErrorListener = (e: unknown) => void;

const IMPACT_SPACING = 45;
/** iOS system vibration lasts ~400 ms; re-fire just before it ends. */
const IOS_BUZZ_MS = 380;
const IOS_STRONG_LEVEL = 0.45;

class HapticEngine {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private token = 0;
  private errorListener: ErrorListener | null = null;

  onError(fn: ErrorListener | null) {
    this.errorListener = fn;
  }

  play(steps: Step[], opts: { loop?: boolean } = {}) {
    this.stop();
    if (!steps.length) return;
    const token = ++this.token;
    if (Platform.OS === 'android') {
      // Full motor strength; only very low levels shorten the pulse a little.
      const pattern = [0];
      steps.forEach((s) => {
        // Unbroken steps (off = 0) stay unbroken whatever the level.
        const on = s.level <= 0.02 ? 0 : s.off === 0 ? s.on : s.on * (0.7 + 0.3 * Math.max(0, Math.min(1, s.level)));
        pattern.push(Math.round(on), Math.round(s.off + s.on - on));
      });
      try {
        Vibration.vibrate(pattern, !!opts.loop);
      } catch (e) {
        this.fail(e);
      }
      return;
    }
    if (Platform.OS === 'web') {
      const nav = (globalThis as { navigator?: { vibrate?: (p: number[]) => boolean } }).navigator;
      const flat: number[] = [];
      steps.forEach((s) => flat.push(Math.round(s.on), Math.round(s.off)));
      nav?.vibrate?.(flat);
      if (opts.loop) {
        const total = flat.reduce((a, b) => a + b, 0);
        this.timers.push(setTimeout(() => token === this.token && this.play(steps, opts), total));
      }
      return;
    }
    this.runIOS(steps, 0, token, !!opts.loop);
  }

  stop() {
    this.token++;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (Platform.OS === 'web') {
      const nav = (globalThis as { navigator?: { vibrate?: (p: number) => boolean } }).navigator;
      nav?.vibrate?.(0);
    } else {
      Vibration.cancel();
    }
  }

  /** Fires one light tap; resolves false if the device rejects haptics. */
  async test(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(80);
        return true;
      }
      if (Platform.OS === 'web') {
        const nav = (globalThis as { navigator?: { vibrate?: (p: number) => boolean } }).navigator;
        return !!nav?.vibrate?.(80);
      }
      await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
      return true;
    } catch {
      return false;
    }
  }

  private runIOS(steps: Step[], i: number, token: number, loop: boolean) {
    if (token !== this.token) return;
    // Everything scheduled for the previous step has fired by now.
    this.timers = [];
    if (i >= steps.length) {
      if (loop) this.runIOS(steps, 0, token, loop);
      return;
    }
    const s = steps[i];
    if (s.on > 0 && s.level >= IOS_STRONG_LEVEL) {
      // Strong: chain system vibrations across the whole "on" window.
      const count = Math.max(1, Math.ceil(s.on / IOS_BUZZ_MS));
      for (let k = 0; k < count; k++) {
        this.timers.push(setTimeout(() => {
          if (token !== this.token) return;
          try { Vibration.vibrate(); } catch (e) { this.fail(e); }
        }, k * IOS_BUZZ_MS));
      }
    } else if (s.on > 0 && s.level > 0.02) {
      const style = s.level < 0.25 ? ExpoHaptics.ImpactFeedbackStyle.Medium : ExpoHaptics.ImpactFeedbackStyle.Heavy;
      const count = Math.max(1, Math.floor(s.on / IMPACT_SPACING));
      for (let k = 0; k < count; k++) {
        this.timers.push(setTimeout(() => {
          if (token !== this.token) return;
          ExpoHaptics.impactAsync(style).catch((e) => this.fail(e));
        }, k * IMPACT_SPACING));
      }
    }
    this.timers.push(setTimeout(() => this.runIOS(steps, i + 1, token, loop), Math.max(1, s.on + s.off)));
  }

  private fail(e: unknown) {
    this.stop();
    this.errorListener?.(e);
  }
}

export const haptics = new HapticEngine();
