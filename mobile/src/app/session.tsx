import { LinearGradient } from 'expo-linear-gradient';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { ambience, ambienceTotal } from '../audio/ambience';
import { voice, voiceClipCount } from '../audio/voice';
import { Icon } from '../components/Icon';
import { Txt } from '../components/ui';
import { Orb, RadialGlow } from '../components/visuals';
import { findPattern } from '../data/patterns';
import { haptics } from '../haptics/engine';
import { sessionSteps } from '../haptics/patterns';
import { patName, useT, useUpper } from '../i18n';
import { useStore } from '../store';
import { C, em, PRIMARY_GRADIENT } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING = 917.3; // 2π · 146
const DOUBLE_TAP_MS = 320;
const KEEP_AWAKE_TAG = 'onde-session';

/** 09 / 10 · Active Session & Pause State. Stop is always the largest control. */
export default function Session() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const up = useUpper();
  const play = useStore((s) => s.play);
  const limit = useStore((s) => s.limit);
  const autostop = useStore((s) => s.tg.autostop);
  const visual = useStore((s) => s.tg.visual);
  const adultConfirmed = useStore((s) => s.adultConfirmed);
  const voiceOn = useStore((s) => s.tg.voice) && adultConfirmed && voiceClipCount() > 0;
  const voiceVolume = useStore((s) => s.voiceVolume);
  const ambienceOn = useStore((s) => s.tg.ambience) && adultConfirmed && ambienceTotal() > 0;
  const ambienceVolume = useStore((s) => s.ambienceVolume);
  const pat = findPattern(play.pid);

  const total = play.duration * 60;
  const [remaining, setRemaining] = useState(total);
  const [paused, setPaused] = useState(false);
  const elapsed = useRef(0);
  const finished = useRef(false);
  const lastTap = useRef(0);
  const level = Math.min(play.intensity, limit);

  const finish = useCallback((ended: boolean) => {
    if (finished.current) return;
    finished.current = true;
    haptics.stop();
    voice.stop();
    ambience.stop();
    const st = useStore.getState();
    st.recordSession({ ended, elapsed: elapsed.current, pid: st.play.pid, intensity: Math.min(st.play.intensity, st.limit) });
    router.replace('/complete');
  }, []);

  // Haptics follow the live intensity / rhythm and pause state.
  useEffect(() => {
    if (paused) { haptics.stop(); return; }
    haptics.play(sessionSteps(pat.shape, level, play.rhythm), { loop: true });
  }, [paused, level, play.rhythm, pat.shape]);

  // Voice companion follows the session: its lines read progress, intensity and rhythm live.
  const voiceCtx = useRef({ progress: 0, intensity: level, rhythm: play.rhythm });
  useEffect(() => {
    voiceCtx.current = { progress: 1 - remaining / Math.max(1, total), intensity: level, rhythm: play.rhythm };
  }, [remaining, total, level, play.rhythm]);

  useEffect(() => {
    if (!voiceOn) { voice.stop(); return; }
    voice.start({ volume: useStore.getState().voiceVolume, frequency: useStore.getState().voiceFreq, getContext: () => voiceCtx.current });
    return () => voice.stop();
  }, [voiceOn]);

  useEffect(() => { voice.setVolume(voiceVolume); }, [voiceVolume]);

  useEffect(() => {
    if (!ambienceOn) { ambience.stop(); return; }
    ambience.start({ volume: useStore.getState().ambienceVolume, getContext: () => voiceCtx.current });
    return () => ambience.stop();
  }, [ambienceOn]);

  useEffect(() => { ambience.setVolume(ambienceVolume); }, [ambienceVolume]);

  useEffect(() => {
    if (paused) { voice.pause(); ambience.pause(); } else { voice.resume(); ambience.resume(); }
  }, [paused]);

  useEffect(() => {
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      haptics.stop();
      voice.stop();
      ambience.stop();
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, []);

  // Countdown.
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      elapsed.current += 1;
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [paused]);

  useEffect(() => {
    if (remaining === 0 && autostop) finish(false);
  }, [remaining, autostop, finish]);

  // Screen-lock behaviour from Settings.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'background') return;
      const mode = useStore.getState().lockMode;
      if (mode === 0) finish(true);
      else if (mode === 1) setPaused(true);
    });
    return () => sub.remove();
  }, [finish]);

  const [ring] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(ring, { toValue: RING * (1 - remaining / Math.max(1, total)), duration: 1000, easing: Easing.linear, useNativeDriver: false }).start();
  }, [remaining, total, ring]);

  const onBackgroundPress = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) finish(true);
    lastTap.current = now;
  };

  const setIntensity = (v: number) => useStore.getState().setPlay({ intensity: Math.max(1, Math.min(limit, v)) });
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeStr = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;

  return (
    <Pressable onPress={onBackgroundPress} accessible={false}
      style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 12) + 16 }}>
      <RadialGlow glows={[{ cx: 0.5, cy: 0.42, rx: 0.8, ry: 0.5, color: '#8B5CF6', opacity: 0.16 }]} />
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Txt style={{ fontSize: 12, fontWeight: '600', letterSpacing: em(0.12, 12), color: C.muted }}>{up(t.session.current)}</Txt>
        <Txt style={{ fontSize: 20, fontWeight: '600' }}>{patName(t, pat)}</Txt>
        {voiceOn ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon name="headphones" size={13} color={C.faint} />
            <Txt style={{ fontSize: 12, color: C.faint }}>{t.session.voiceOn}</Txt>
          </View>
        ) : null}
      </View>
      {adultConfirmed ? (
        <Pressable onPress={() => (voiceClipCount() ? useStore.getState().flip('voice') : useStore.getState().showToast(t.session.noVoicePack))} accessibilityRole="switch" accessibilityLabel={t.session.voiceToggle}
          accessibilityState={{ checked: voiceOn }} hitSlop={6}
          style={{ position: 'absolute', top: insets.top + 16, right: 24, width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={voiceOn ? 'sound' : 'soundOff'} size={20} color={voiceOn ? C.lavender : C.faint} />
        </Pressable>
      ) : null}

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 300, height: 300, opacity: paused ? 0.45 : 1 }}>
          <Orb size={300} rhythm={play.rhythm} intensity={level} paused={paused} still={!visual} />
          <Svg width={300} height={300} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
            <Circle cx={150} cy={150} r={146} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
            <AnimatedCircle cx={150} cy={150} r={146} fill="none" stroke={C.lilac} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${RING}`} strokeDashoffset={ring} />
          </Svg>
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', alignItems: 'center', gap: 6 }}>
          {paused ? (
            <View style={{ height: 26, paddingHorizontal: 12, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
              <Txt style={{ fontSize: 12, fontWeight: '600', letterSpacing: em(0.1, 12) }}>{up(t.session.paused)}</Txt>
            </View>
          ) : null}
          <Txt accessibilityRole="timer" accessibilityLabel={t.session.remainingA11y(mm, ss)}
            style={{ fontSize: 60, fontWeight: '600', letterSpacing: em(-0.02, 60), fontVariant: ['tabular-nums'], lineHeight: 72 }}>{timeStr}</Txt>
          <Txt style={{ fontSize: 14, color: C.lilacSoft }}>{t.session.remaining}</Txt>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <StepButton label="−" a11y={t.session.lower} onPress={() => setIntensity(play.intensity - 1)} />
        <View style={{ minWidth: 120, alignItems: 'center' }}>
          <Txt style={{ fontSize: 12, color: C.muted, letterSpacing: em(0.08, 12) }}>{up(t.common.intensity)}</Txt>
          <Txt style={{ fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{level}/10</Txt>
        </View>
        <StepButton label="+" a11y={t.session.raise} onPress={() => setIntensity(play.intensity + 1)} />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, alignSelf: 'stretch' }}>
        {/* One button that stays mounted and switches between Duraklat and Başlat, so it never drops out on native. */}
        <Pressable onPress={() => setPaused(!paused)} accessibilityRole="button" accessibilityLabel={paused ? t.session.resume : t.session.pause}
          style={({ pressed }) => [s.pill, { width: 140, backgroundColor: paused ? C.violet : C.surface2, borderWidth: paused ? 0 : 1, borderColor: 'rgba(255,255,255,0.12)', opacity: pressed ? 0.8 : 1 }]}>
          {paused ? <LinearGradient {...PRIMARY_GRADIENT} pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 36 }]} /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name={paused ? 'play' : 'pause'} size={paused ? 18 : 20} color="#fff" />
            <Txt style={{ fontSize: 17, fontWeight: '600' }}>{paused ? t.session.resume : t.session.pause}</Txt>
          </View>
        </Pressable>
        <Pressable onPress={() => finish(true)} accessibilityRole="button" accessibilityLabel={t.session.stopA11y}
          style={({ pressed }) => [s.pill, { flex: 1, backgroundColor: C.red, gap: 10, opacity: pressed ? 0.85 : 1 }]}>
          <View style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: C.redInk }} />
          <Txt style={{ fontSize: 19, fontWeight: '700', color: C.redInk }}>{t.session.stop}</Txt>
        </Pressable>
      </View>
      <Txt style={{ marginTop: 14, fontSize: 13, color: C.faint }}>{t.session.doubleTap}</Txt>
    </Pressable>
  );
}

function StepButton({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: C.border2, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Txt style={{ fontSize: 22, lineHeight: 26 }}>{label}</Txt>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pill: { height: 72, borderRadius: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
