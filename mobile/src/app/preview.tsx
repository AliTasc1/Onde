import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, TextInput, View } from 'react-native';

import { Icon } from '../components/Icon';
import { BackHeader, Card, Page, PrimaryButton, Stat, Tap, Txt } from '../components/ui';
import { Bars } from '../components/visuals';
import { rhythmLabel, SEG } from '../data/patterns';
import { haptics } from '../haptics/engine';
import { timelineSteps } from '../haptics/patterns';
import { saveCurrentDraft } from '../lib/actions';
import { goBack, goTab } from '../lib/nav';
import { averageIntensity, cycleSeconds, timelineBars } from '../lib/shapes';
import { useT, useUpper } from '../i18n';
import { useStore } from '../store';
import { C, F } from '../theme';

/** 13 · Pattern Preview */
export default function Preview() {
  const d = useStore((s) => s.draft);
  const t = useT();
  const up = useUpper();
  const limit = useStore((s) => s.limit);
  const updDraft = useStore((s) => s.updDraft);
  const [playing, setPlaying] = useState(false);
  const [w, setW] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [head] = useState(() => new Animated.Value(0));

  const cycle = cycleSeconds(d.segs);
  const wave = timelineBars(d.segs, d.freq, 48);

  const stop = () => {
    haptics.stop();
    clearTimeout(timer.current);
    head.stopAnimation();
    setPlaying(false);
  };

  const play = () => {
    stop();
    haptics.play(timelineSteps(d.segs, d, limit));
    setPlaying(true);
    head.setValue(0);
    Animated.timing(head, { toValue: 1, duration: cycle * 1000, easing: Easing.linear, useNativeDriver: true }).start();
    timer.current = setTimeout(() => setPlaying(false), cycle * 1000);
  };

  useEffect(() => () => { haptics.stop(); clearTimeout(timer.current); }, []);

  const save = () => {
    stop();
    if (saveCurrentDraft()) goTab('custom');
  };

  return (
    <Page contentStyle={{ flexGrow: 1 }} bottom={40}>
      <BackHeader onBack={() => { stop(); goBack(); }} title={t.preview.title} />
      <View style={{ paddingTop: 8, paddingHorizontal: 24, gap: 6 }}>
        <Txt style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.96, color: C.muted }}>{up(t.preview.name)}</Txt>
        <TextInput value={d.name} onChangeText={(v) => updDraft({ name: v })} accessibilityLabel={t.preview.nameA11y} maxLength={40}
          placeholder={t.custom.defaultName} placeholderTextColor={C.faint} returnKeyType="done"
          style={{ height: 52, borderRadius: 16, borderWidth: 1, borderColor: C.border2, backgroundColor: C.surface, color: '#fff', fontFamily: F.semibold, fontSize: 18, paddingHorizontal: 16 }} />
      </View>

      <Card style={{ marginTop: 16, marginHorizontal: 24, paddingTop: 20, gap: 12 }}>
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: 150 }}>
          <Bars bars={wave} height={150} gap={2} radius={2} />
          {playing && w > 0 ? (
            <Animated.View pointerEvents="none" style={{
              position: 'absolute', top: -6, bottom: -6, left: -1, width: 2, borderRadius: 1, backgroundColor: '#fff',
              shadowColor: '#fff', shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
              transform: [{ translateX: head.interpolate({ inputRange: [0, 1], outputRange: [0, w] }) }],
            }} />
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 3, height: 6 }}>
          {d.segs.map((g, i) => (
            <LinearGradient key={i} colors={SEG[g.type].bg.colors} start={SEG[g.type].bg.start} end={SEG[g.type].bg.end} style={{ flex: g.dur, borderRadius: 3 }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 12, color: C.faint }}>{t.preview.zero}</Txt>
          <Txt style={{ fontSize: 12, color: C.faint }}>{t.preview.loops(d.dur)}</Txt>
          <Txt style={{ fontSize: 12, color: C.faint }}>{t.common.sec(cycle)}</Txt>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, paddingTop: 12, paddingHorizontal: 24 }}>
        <Stat label={t.common.duration} value={t.common.min(d.dur)} valueSize={18} style={{ padding: 14 }} />
        <Stat label={t.common.intensity} value={averageIntensity(d.segs).toFixed(1)} valueSize={18} style={{ padding: 14 }} />
        <Stat label={t.common.rhythm} value={rhythmLabel(d.rhythm, t.common.rhythmLabels)} valueSize={18} style={{ padding: 14 }} />
      </View>

      <View style={{ flex: 1, minHeight: 24 }} />

      <View style={{ gap: 12, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tap onPress={play} accessibilityRole="button" accessibilityLabel={playing ? t.preview.playingA11y : t.preview.playA11y}
            style={{ flex: 1, height: 56, borderRadius: 18, borderWidth: 1, borderColor: C.border2, backgroundColor: playing ? 'rgba(139,92,246,0.22)' : C.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="play" size={16} color="#fff" />
            <Txt style={{ fontSize: 17, fontWeight: '600' }}>{playing ? t.preview.playing : t.preview.play}</Txt>
          </Tap>
          <Tap onPress={stop} accessibilityRole="button" accessibilityLabel={t.preview.stopA11y}
            style={{ width: 120, height: 56, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: C.redSoft }} />
            <Txt style={{ fontSize: 17, fontWeight: '600', color: C.redSoft }}>{t.preview.stop}</Txt>
          </Tap>
        </View>
        <PrimaryButton label={t.preview.save} onPress={save} />
      </View>
    </Page>
  );
}
