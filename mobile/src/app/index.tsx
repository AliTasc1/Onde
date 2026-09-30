import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '../components/ui';
import { Logo, RadialGlow, Waves } from '../components/visuals';
import { useT, useUpper } from '../i18n';
import { useStore } from '../store';
import { C } from '../theme';

/** 01 · Splash — shows briefly, tap to skip. */
export default function Splash() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const done = useRef(false);
  const t = useT();
  const up = useUpper();

  const next = () => {
    if (done.current) return;
    done.current = true;
    const st = useStore.getState();
    if (!st.onboarded) router.replace('/onboarding');
    else router.replace(st.adultAsked ? '/(tabs)/home' : '/adult?from=onboarding');
  };

  useEffect(() => {
    const timer = setTimeout(next, 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable onPress={next} accessibilityLabel={t.splash.a11y} style={s.root}>
      <RadialGlow glows={[{ cx: 0.5, cy: 0.46, rx: 0.6, ry: 0.4, color: '#8B5CF6', opacity: 0.2 }]} />
      <View style={{ position: 'absolute', left: 0, top: '50%', marginTop: -120, opacity: 0.55 }}>
        <Waves w={width} h={240} lines={[
          { a: 30, p: 2, c: '#8B5CF6', s: 14, o: 0.5 },
          { a: 22, p: 3, c: '#EC4899', s: 18, o: 0.3, rev: true },
          { a: 40, p: 1, c: '#C4B5FD', s: 22, o: 0.25 },
        ]} />
      </View>
      <View style={{ alignItems: 'center', gap: 20 }}>
        <Logo size={96} />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Txt style={{ fontSize: 34, fontWeight: '600', letterSpacing: 0.34 }}>onde</Txt>
          <Txt style={{ fontSize: 12, color: C.muted, letterSpacing: 2.9 }}>{up(t.splash.tagline)}</Txt>
        </View>
      </View>
      <Txt style={{ position: 'absolute', bottom: 56 + insets.bottom / 2, fontSize: 13, color: C.faint }}>{t.splash.private}</Txt>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
});
