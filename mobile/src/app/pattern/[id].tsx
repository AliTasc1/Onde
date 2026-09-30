import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { Slider } from '../../components/Slider';
import { Chip, H1, Page, PrimaryButton, RoundButton, Txt } from '../../components/ui';
import { Orb, Waves } from '../../components/visuals';
import { DURATIONS } from '../../data/content';
import { findPattern, rhythmLabel } from '../../data/patterns';
import { go, goBack } from '../../lib/nav';
import { useStore } from '../../store';
import { C, em } from '../../theme';

/** 08 · Pattern Detail */
export default function PatternDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pat = findPattern(id);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const play = useStore((s) => s.play);
  const setPlay = useStore((s) => s.setPlay);
  const isFav = useStore((s) => !!s.fav[pat.id]);
  const toggleFav = useStore((s) => s.toggleFav);
  const premium = useStore((s) => s.premium);

  useEffect(() => {
    if (pat.locked && !premium) router.replace('/subscription');
    else if (play.pid !== pat.id) useStore.getState().openPattern(pat.id);
  }, [pat.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { intensity, rhythm, duration } = play;
  const waveW = Math.min(width, 600) - 48;
  const period = Math.max(1, Math.round(rhythm / 2));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Page bottom={170}>
        <View style={{ height: 60, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <RoundButton icon="back" label="Back" onPress={goBack} />
          <Pressable onPress={() => toggleFav(pat.id)} accessibilityRole="button" accessibilityLabel="Favorite" accessibilityState={{ selected: isFav }}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={isFav ? 'heartF' : 'heart'} size={20} color={isFav ? C.pinkSoft : '#fff'} />
          </Pressable>
        </View>

        <View style={{ paddingTop: 4, paddingHorizontal: 24, gap: 6 }}>
          <Txt style={{ fontSize: 12, color: C.lavender, fontWeight: '600', letterSpacing: em(0.1, 12), textTransform: 'uppercase' }}>{pat.cat} · {pat.dur} min</Txt>
          <H1 size={30}>{pat.name}</H1>
          <Txt style={{ color: C.muted, fontSize: 15, lineHeight: 22.5 }}>{pat.desc}</Txt>
        </View>

        <View style={{ marginTop: 16, marginHorizontal: 24, height: 56 }}>
          <Waves w={waveW} h={56} lines={[
            { a: 10 + intensity * 1.6, p: period, c: '#C4B5FD', s: Math.max(2, 9 - rhythm * 0.6), sw: 2 },
            { a: 6 + intensity, p: period + 1, c: '#EC4899', s: Math.max(2, 11 - rhythm * 0.6), o: 0.5, rev: true },
          ]} />
        </View>

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Orb size={184} rhythm={rhythm} intensity={intensity}>
            <Txt style={{ fontSize: 36, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{intensity}</Txt>
            <Txt style={{ fontSize: 12, color: C.lilacSoft, letterSpacing: em(0.08, 12), textTransform: 'uppercase' }}>Intensity</Txt>
          </Orb>
        </View>

        <View style={{ paddingTop: 16, paddingHorizontal: 24, gap: 20 }}>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 15, fontWeight: '600' }}>Intensity</Txt>
              <Txt style={{ fontSize: 15, color: C.muted, fontVariant: ['tabular-nums'] }}>{intensity} / 10</Txt>
            </View>
            <Slider label="Intensity" value={intensity} min={1} max={10} onChange={(v) => setPlay({ intensity: v })} valueText={`${intensity} of 10`} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 12, color: C.faint }}>1</Txt>
              <Txt style={{ fontSize: 12, color: C.faint }}>10</Txt>
            </View>
          </View>
          {pat.shape !== 'constant' ? <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 15, fontWeight: '600' }}>Rhythm</Txt>
              <Txt style={{ fontSize: 15, color: C.muted }}>{rhythmLabel(rhythm)}</Txt>
            </View>
            <Slider label="Rhythm" value={rhythm} min={1} max={10} onChange={(v) => setPlay({ rhythm: v })} valueText={rhythmLabel(rhythm)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 12, color: C.faint }}>Slow</Txt>
              <Txt style={{ fontSize: 12, color: C.faint }}>Fast</Txt>
            </View>
          </View> : null}
          <View style={{ gap: 12 }}>
            <Txt style={{ fontSize: 15, fontWeight: '600' }}>Duration</Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {DURATIONS.map((d) => (
                <Chip key={d} label={`${d} min`} active={duration === d} onPress={() => setPlay({ duration: d })}
                  style={{ flex: 1, height: 48, borderRadius: 14, paddingHorizontal: 0 }} />
              ))}
            </View>
          </View>
        </View>
      </Page>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 24, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 12) + 16, alignItems: 'center', gap: 12 }}>
        <LinearGradient colors={['rgba(11,11,18,0)', C.bg, C.bg]} locations={[0, 0.3, 1]} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none" />
        <PrimaryButton label="Start Experience" onPress={() => go('/session')} shadow style={{ alignSelf: 'stretch' }}
          icon={<Icon name="play" size={18} color="#fff" />} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Txt style={{ fontSize: 13, color: C.muted }}>Stop anytime</Txt>
          <Txt style={{ fontSize: 13, color: C.muted }}>·</Txt>
          <Txt onPress={() => go('/safety')} accessibilityRole="link" style={{ fontSize: 13, color: C.lavender }}>Use responsibly</Txt>
        </View>
      </View>
    </View>
  );
}
