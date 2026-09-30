import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Bar } from '../lib/shapes';
import { sinePath } from '../lib/shapes';
import { useStore } from '../store';

/** Reduce Motion = in-app switch OR the OS accessibility setting. */
export function useReduceMotion() {
  const inApp = useStore((s) => s.tg.rm);
  const [os, setOs] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setOs).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOs);
    return () => sub.remove();
  }, []);
  return inApp || os;
}

let gid = 0;
const useGradientId = (p: string) => useMemo(() => `${p}${++gid}`, [p]);

type Glow = { cx: number; cy: number; rx: number; ry: number; color: string; opacity: number; stop?: number };

/**
 * CSS `radial-gradient(RX% RY% at CX% CY%, color, transparent STOP%)` painted
 * as an absolute backdrop. All geometry is in fractions of the box.
 */
export function RadialGlow({ glows, style }: { glows: Glow[]; style?: StyleProp<ViewStyle> }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const id = useGradientId('rg');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box.w > 0 ? (
        <Svg width={box.w} height={box.h}>
          <Defs>
            {glows.map((g, i) => (
              <RadialGradient key={i} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" cx={g.cx * box.w} cy={g.cy * box.h} fx={g.cx * box.w} fy={g.cy * box.h} rx={g.rx * box.w} ry={g.ry * box.h}>
                <Stop offset={0} stopColor={g.color} stopOpacity={g.opacity} />
                <Stop offset={g.stop ?? 0.7} stopColor={g.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {glows.map((_, i) => <Rect key={i} x={0} y={0} width={box.w} height={box.h} fill={`url(#${id}-${i})`} />)}
        </Svg>
      ) : null}
    </View>
  );
}

function useLoop(duration: number, run: boolean, opts: { yoyo?: boolean; easing?: (t: number) => number; delay?: number } = {}) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!run) return;
    const ease = opts.easing ?? Easing.linear;
    const anim = opts.yoyo
      ? Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: ease, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: ease, useNativeDriver: true }),
      ]))
      : Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: ease, useNativeDriver: true }));
    if (!opts.yoyo) v.setValue(0);
    const started = opts.delay ? Animated.sequence([Animated.delay(opts.delay), anim]) : anim;
    started.start();
    return () => started.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, run, opts.yoyo]);
  return v;
}

/** (v + offset) mod 1, expressed as an interpolation. */
const phase = (v: Animated.Value, o: number) => (o === 0 ? v : v.interpolate({ inputRange: [0, 1 - o, 1 - o + 0.0001, 1], outputRange: [o, 1, 0, o] }));

export type WaveLine = { a: number; p: number; c: string; s: number; o?: number; sw?: number; ph?: number; rev?: boolean };

function WaveLineView({ w, h, l, still }: { w: number; h: number; l: WaveLine; still: boolean }) {
  const v = useLoop(l.s * 1000, !still);
  const d = useMemo(() => sinePath(w * 2, h, l.a, l.p * 2, l.ph ?? 0, 320), [w, h, l.a, l.p, l.ph]);
  const tx = v.interpolate({ inputRange: [0, 1], outputRange: l.rev ? [-w, 0] : [0, -w] });
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: w * 2, height: h, transform: still ? [] : [{ translateX: tx }] }}>
      <Svg width={w * 2} height={h}>
        <Path d={d} fill="none" stroke={l.c} strokeWidth={l.sw ?? 1.5} strokeOpacity={l.o ?? 1} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

/** Horizontally drifting sine lines (splash, onboarding, detail). */
export function Waves({ w, h, lines }: { w: number; h: number; lines: WaveLine[] }) {
  const rm = useReduceMotion();
  return (
    <View pointerEvents="none" style={{ width: w, height: h, overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {lines.map((l, i) => <WaveLineView key={i} w={w} h={h} l={l} still={rm} />)}
    </View>
  );
}

/** The breathing orb with ripple rings. Children render centred on top. */
export function Orb({ size, rhythm = 4, intensity = 5, paused = false, still = false, children, style }: {
  size: number; rhythm?: number; intensity?: number; paused?: boolean; still?: boolean; children?: ReactNode; style?: StyleProp<ViewStyle>;
}) {
  const rm = useReduceMotion() || still;
  const dur = Math.max(1.4, 5.6 - rhythm * 0.42);
  const run = !rm && !paused;
  const ripple = useLoop(dur * 1.4 * 1000, run);
  const breathe = useLoop(dur * 1.6 * 1000, run, { yoyo: true, easing: Easing.inOut(Easing.ease) });
  const id = useGradientId('orb');

  const inset = (26 - intensity * 0.9) / 100;
  const core = size * (1 - inset * 2);
  const glow = size * 1.36;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Svg width={glow} height={glow} style={{ position: 'absolute', left: -size * 0.18, top: -size * 0.18 }}>
          <Defs>
            <RadialGradient id={`${id}-g`} cx="50%" cy="50%" r="70.7%">
              <Stop offset={0} stopColor="#8B5CF6" stopOpacity={0.28} />
              <Stop offset={0.62} stopColor="#8B5CF6" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={glow} height={glow} fill={`url(#${id}-g)`} />
        </Svg>

        {[0, 1, 2].map((i) => {
          const p = phase(ripple, i / 3);
          const ringStyle = rm
            ? { opacity: 0.35 - i * 0.1, transform: [{ scale: 0.72 + i * 0.14 }] }
            : {
              opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0], easing: Easing.out(Easing.quad) }),
              transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1.18], easing: Easing.out(Easing.quad) }) }],
            };
          return <Animated.View key={i} style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.55)' }, ringStyle]} />;
        })}

        <Animated.View style={{
          position: 'absolute', left: size * inset, top: size * inset, width: core, height: core, borderRadius: core / 2,
          opacity: rm ? 1 : breathe.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }),
          transform: rm ? [] : [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
          shadowColor: '#8B5CF6', shadowOpacity: 0.45, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
        }}>
          <Svg width={core} height={core}>
            <Defs>
              <RadialGradient id={`${id}-c`} gradientUnits="userSpaceOnUse" cx={core * 0.34} cy={core * 0.28} fx={core * 0.34} fy={core * 0.28} r={core * 0.977}>
                <Stop offset={0} stopColor="#C9B8FF" />
                <Stop offset={0.38} stopColor="#8B5CF6" />
                <Stop offset={0.72} stopColor="#5B2FC9" />
                <Stop offset={1} stopColor="#2A1660" />
              </RadialGradient>
            </Defs>
            <Circle cx={core / 2} cy={core / 2} r={core / 2} fill={`url(#${id}-c)`} />
          </Svg>
        </Animated.View>

        <Animated.View style={{
          position: 'absolute', left: size * 0.3, top: size * 0.3, width: size * 0.4, height: size * 0.4,
          opacity: rm ? 1 : breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] }),
          transform: rm ? [] : [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) }],
        }}>
          <Svg width={size * 0.4} height={size * 0.4}>
            <Defs>
              <RadialGradient id={`${id}-p`} cx="50%" cy="50%" r="50%">
                <Stop offset={0} stopColor="#F9A8D4" stopOpacity={0.5} />
                <Stop offset={1} stopColor="#F9A8D4" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={size * 0.4} height={size * 0.4} fill={`url(#${id}-p)`} />
          </Svg>
        </Animated.View>
      </View>
      {children ? <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>{children}</View> : null}
    </View>
  );
}

/** App mark: three stacked waves on a dark tile. */
export function Logo({ size }: { size: number }) {
  const rm = useReduceMotion();
  const [v] = useState(() => new Animated.Value(rm ? 1 : 0));
  useEffect(() => {
    if (!rm) Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [rm, v]);
  const g = size * 0.56;
  const lines: [number, number, string][] = [[16, 4, '#C4B5FD'], [24, 6, '#A78BFA'], [32, 4, '#F0ABFC']];
  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size * 0.26, borderWidth: 1, borderColor: 'rgba(196,181,253,0.18)',
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#8B5CF6', shadowOpacity: 0.35, shadowRadius: 30, shadowOffset: { width: 0, height: 20 }, elevation: 12,
      opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
    }}>
      <LinearGradient colors={['#231A3F', '#15151F']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: size * 0.26 }]} />
      <Svg width={g} height={g} viewBox="0 0 48 48" style={{ position: 'relative' }}>
        {lines.map(([y, amp, c], i) => (
          <Path key={i} d={sinePath(32, 8, amp / 2, 1.5, 0, 40)} transform={`translate(8 ${y - 4})`} fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" />
        ))}
      </Svg>
    </Animated.View>
  );
}

/** A row of waveform bars. Heights are percentages of `height`. */
export function Bars({ bars, height, gap = 2, radius = 2, color = '#A78BFA', barWidth, align = 'center', style }: {
  bars: Bar[]; height: number; gap?: number; radius?: number; color?: string; barWidth?: number; align?: 'center' | 'flex-end'; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: align, gap, height }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((b, i) => (
        <View key={i} style={[barWidth ? { width: barWidth } : { flex: 1 }, { height: `${b.h}%`, borderRadius: radius, backgroundColor: b.c ?? color }]} />
      ))}
    </View>
  );
}

/** Onboarding step 2: bouncing equaliser bars. */
export function PulsingBars({ count = 26, height = 140 }: { count?: number; height?: number }) {
  const rm = useReduceMotion();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => <PulsingBar key={i} i={i} still={rm} />)}
    </View>
  );
}

function PulsingBar({ i, still }: { i: number; still: boolean }) {
  const period = (1.6 + (i % 4) * 0.25) * 1000;
  // Stagger the bars so they ripple rather than bounce in unison.
  const v = useLoop(period, !still, { yoyo: true, easing: Easing.inOut(Easing.ease), delay: (i * 120) % period });
  return (
    <Animated.View style={{
      flex: 1, height: `${30 + 60 * Math.abs(Math.sin(i * 0.5))}%`, borderRadius: 3,
      backgroundColor: i % 5 === 0 ? '#F0ABFC' : '#A78BFA', opacity: 0.55 + 0.45 * Math.abs(Math.cos(i * 0.3)),
      transform: still ? [] : [{ scaleY: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }) }],
    }} />
  );
}
