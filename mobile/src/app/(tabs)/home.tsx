import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { H1, Page, RoundButton, Tap, Txt } from '../../components/ui';
import { Bars, RadialGlow } from '../../components/visuals';
import { MOODS } from '../../data/content';
import { findPattern } from '../../data/patterns';
import { greeting, openPattern, splitRgba } from '../../lib/actions';
import { go, goTab } from '../../lib/nav';
import { bars } from '../../lib/shapes';
import { useStore } from '../../store';
import { C, em } from '../../theme';

const HOME_BARS = bars('sine', 2, 22, 1);

/** 06 · Home — mood card → detail → Start is the 2-tap core flow. */
export default function Home() {
  const { width } = useWindowDimensions();
  const name = useStore((s) => s.name);
  const last = useStore((s) => s.last);
  const defDur = useStore((s) => s.defDur);
  const cont = last ?? { pid: 'soft', intensity: 6, rhythm: 4, duration: defDur };
  const contPattern = findPattern(cont.pid);
  const cardW = (Math.min(width, 600) - 48 - 12) / 2;

  const continueLast = () => {
    const st = useStore.getState();
    if (contPattern.locked && !st.premium) return go('/subscription');
    st.setPlay(cont);
    go(`/pattern/${cont.pid}`);
  };

  return (
    <Page tabs>
      <View style={{ paddingTop: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ gap: 6, flex: 1 }}>
          <Txt style={{ fontSize: 15, color: C.muted }}>{greeting()}{name ? `, ${name}` : ''}</Txt>
          <H1 style={{ maxWidth: 260 }}>How would you like to feel?</H1>
        </View>
        <RoundButton icon="bell" label="Notifications" bg={C.surface} onPress={() => go('/notifications')}
          style={{ borderWidth: 1, borderColor: C.border }} />
      </View>

      <Tap onPress={continueLast} accessibilityRole="button"
        accessibilityLabel={`Continue ${contPattern.name}, ${cont.duration} minutes, intensity ${cont.intensity}`}
        style={{ marginTop: 24, marginHorizontal: 24, padding: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(196,181,253,0.14)', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <LinearGradient colors={['rgba(139,92,246,0.22)', 'rgba(236,72,153,0.1)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={{ flex: 1, gap: 10 }}>
          <Txt style={{ fontSize: 12, fontWeight: '600', letterSpacing: em(0.08, 12), textTransform: 'uppercase', color: C.lavender }}>Continue</Txt>
          <Txt style={{ fontSize: 18, fontWeight: '600' }}>{contPattern.name}</Txt>
          <Bars bars={HOME_BARS} height={20} barWidth={4} gap={2} radius={2} align="flex-end" color="rgba(221,211,255,0.8)" />
          <Txt style={{ fontSize: 13, color: C.muted }}>{cont.duration} min · Intensity {cont.intensity}</Txt>
        </View>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={22} color={C.bg} />
        </View>
      </Tap>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 16, paddingHorizontal: 24 }}>
        {MOODS.map(([label, sub, icon, pid, glow]) => {
          const g = splitRgba(glow);
          return (
            <MoodCard key={label} width={cardW} label={label} sub={sub} icon={<Icon name={icon} size={20} color={C.iconTint} />} onPress={() => openPattern(pid)}>
              <RadialGlow glows={[{ cx: 1, cy: 0, rx: 1.2, ry: 0.9, color: g.color, opacity: g.opacity, stop: 0.62 }]} />
            </MoodCard>
          );
        })}
        <MoodCard width={MOODS.length % 2 ? cardW : cardW * 2 + 12} label="Custom" sub="Build your own" dashed icon={<Icon name="plus" size={20} color={C.iconTint} />} onPress={() => goTab('custom')} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        <Icon name="shield" size={15} color={C.faint} />
        <Txt style={{ fontSize: 13, color: C.faint }}>Your data stays on this device</Txt>
      </View>
    </Page>
  );
}

function MoodCard({ width, label, sub, icon, onPress, dashed, children }: {
  width: number; label: string; sub: string; icon: React.ReactNode; onPress: () => void; dashed?: boolean; children?: React.ReactNode;
}) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}, ${sub}`}
      style={{
        width, height: 140, borderRadius: 24, padding: 16, justifyContent: 'space-between', overflow: 'hidden',
        backgroundColor: dashed ? 'rgba(139,92,246,0.05)' : C.surface2,
        borderWidth: dashed ? 1.5 : 1, borderStyle: dashed ? 'dashed' : 'solid', borderColor: dashed ? 'rgba(196,181,253,0.3)' : C.hairline,
      }}>
      {children}
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ gap: 4 }}>
        <Txt style={{ fontSize: 18, fontWeight: '600' }}>{label}</Txt>
        <Txt style={{ fontSize: 13, color: C.muted }}>{sub}</Txt>
      </View>
    </Tap>
  );
}
