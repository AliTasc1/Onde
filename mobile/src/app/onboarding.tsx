import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { PrimaryButton, Txt } from '../components/ui';
import { Bars, Orb, PulsingBars, RadialGlow, Waves } from '../components/visuals';
import { ONBOARDING } from '../data/content';
import { bars } from '../lib/shapes';
import { useStore } from '../store';
import { C, em, SLIDER_GRADIENT } from '../theme';

/** 02–05 · Onboarding */
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = Math.min(345, width - 48);
  const last = step === ONBOARDING.length - 1;

  const finish = () => {
    useStore.getState().set({ onboarded: true });
    router.replace('/(tabs)/home');
  };
  const next = () => (last ? finish() : setStep(step + 1));

  const swipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 16 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_e, g) => {
      if (g.dx < -40) setStep((s) => Math.min(ONBOARDING.length - 1, s + 1));
      if (g.dx > 40) setStep((s) => Math.max(0, s - 1));
    },
  }), []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 12) + 20 }}>
      <View style={{ height: 52, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        {!last ? (
          <Pressable onPress={finish} accessibilityRole="button" style={{ height: 44, paddingHorizontal: 12, justifyContent: 'center' }}>
            <Txt style={{ fontSize: 15, fontWeight: '600', color: C.muted }}>Skip</Txt>
          </Pressable>
        ) : null}
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} {...swipe.panHandlers}>
        {step === 0 && (
          <View style={{ width: cardW, height: 320, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <RadialGlow glows={[{ cx: 0.5, cy: 0.5, rx: 0.7, ry: 0.6, color: '#8B5CF6', opacity: 0.22, stop: 0.72 }]} />
            <Waves w={cardW} h={240} lines={[
              { a: 60, p: 1, c: '#8B5CF6', s: 10, sw: 2 },
              { a: 44, p: 2, c: '#C4B5FD', s: 14, o: 0.8, rev: true },
              { a: 30, p: 2, c: '#EC4899', s: 9, o: 0.6, ph: 1 },
              { a: 18, p: 3, c: '#F9A8D4', s: 16, o: 0.4, rev: true },
            ]} />
          </View>
        )}
        {step === 1 && (
          <View style={{ width: cardW, height: 320, borderRadius: 32, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, justifyContent: 'center', gap: 24, padding: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 13, color: C.muted }}>Calm Pulse</Txt>
              <Txt style={{ fontSize: 13, color: C.muted }}>Rhythmic</Txt>
            </View>
            <PulsingBars />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['Gentle', 'Pulse', 'Wave'].map((l, i) => (
                <View key={l} style={{ height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center', backgroundColor: i === 0 ? 'rgba(139,92,246,0.18)' : C.surface2 }}>
                  <Txt style={{ fontSize: 13, fontWeight: '600', color: i === 0 ? C.lilac : C.muted }}>{l}</Txt>
                </View>
              ))}
            </View>
          </View>
        )}
        {step === 2 && (
          <View style={{ width: cardW, borderRadius: 32, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, padding: 24, gap: 22 }}>
            <Bars bars={bars('swell', 3, 30, 1, '#A78BFA')} height={72} gap={3} radius={3} align="flex-end" />
            <DemoSlider label="Intensity" value="6 / 10" pct={58} />
            <DemoSlider label="Rhythm" value="Slow" pct={30} />
          </View>
        )}
        {step === 3 && (
          <Orb size={260} rhythm={3} intensity={4}>
            <Icon name="lock" size={44} color="#fff" />
          </Orb>
        )}
      </View>

      <View style={{ gap: 12, minHeight: 150 }}>
        <Txt accessibilityRole="header" style={{ fontSize: 30, lineHeight: 34.5, fontWeight: '700', letterSpacing: em(-0.02, 30) }}>{ONBOARDING[step][0]}</Txt>
        <Txt style={{ fontSize: 16, lineHeight: 24.8, color: C.muted }}>{ONBOARDING[step][1]}</Txt>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 16 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {ONBOARDING.map((_, i) => (
            <Pressable key={i} onPress={() => setStep(i)} accessibilityRole="button" accessibilityLabel={`Step ${i + 1}`} hitSlop={10}
              style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? '#fff' : C.offTrack }} />
          ))}
        </View>
        <PrimaryButton label={last ? 'Get Started' : 'Next'} onPress={next} shadow style={{ paddingHorizontal: 28 }} />
      </View>
    </View>
  );
}

function DemoSlider({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 14, color: C.muted }}>{label}</Txt>
        <Txt style={{ fontSize: 14, fontWeight: '600' }}>{value}</Txt>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: C.track }}>
        <LinearGradient colors={SLIDER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 3 }} />
        <View style={{ position: 'absolute', left: `${pct}%`, top: -13, marginLeft: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139,92,246,0.25)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' }} />
        </View>
      </View>
    </View>
  );
}
