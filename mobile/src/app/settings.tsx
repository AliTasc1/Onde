import { View } from 'react-native';

import { ListPage } from '../components/ListPage';
import { Slider } from '../components/Slider';
import { Group, NavRow, ToggleRow, Txt } from '../components/ui';
import { ambienceCounts } from '../audio/ambience';
import { FREQUENCY_LABELS, voiceClipCount } from '../audio/voice';
import { go } from '../lib/nav';
import { LOCK_MODES, useStore } from '../store';
import { C } from '../theme';

const NEXT_DUR: Record<number, number> = { 1: 3, 3: 5, 5: 10, 10: 15, 15: 1 };

/** 18 · Settings */
export default function Settings() {
  const tg = useStore((s) => s.tg);
  const flip = useStore((s) => s.flip);
  const limit = useStore((s) => s.limit);
  const defDur = useStore((s) => s.defDur);
  const lockMode = useStore((s) => s.lockMode);
  const set = useStore((s) => s.set);
  const showToast = useStore((s) => s.showToast);
  const adultConfirmed = useStore((s) => s.adultConfirmed);
  const voiceVolume = useStore((s) => s.voiceVolume);
  const voiceFreq = useStore((s) => s.voiceFreq);
  const clips = voiceClipCount();
  const ambienceVolume = useStore((s) => s.ambienceVolume);
  const amb = ambienceCounts();

  return (
    <ListPage title="Settings" sub="Tune how Onde works for you.">
      <View style={{ marginTop: 20, marginHorizontal: 24, padding: 16, borderRadius: 20, backgroundColor: C.surface, gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 16 }}>Haptic intensity limit</Txt>
          <Txt style={{ fontSize: 16, color: C.muted }}>{limit} / 10</Txt>
        </View>
        <Slider label="Haptic intensity limit" value={limit} min={1} max={10} onChange={(v) => set({ limit: v })} valueText={`${limit} of 10`} />
        <Txt style={{ fontSize: 13, color: C.faint }}>No session will go above this level.</Txt>
      </View>

      <Group title="Haptics">
        <NavRow label="Default duration" value={`${defDur} min`} icon="timer" onPress={() => set({ defDur: NEXT_DUR[defDur] ?? 5 })} />
        <ToggleRow label="Auto stop" sub="End sessions when the timer finishes" icon="clock" on={tg.autostop} onPress={() => flip('autostop')} />
        <NavRow label="Screen lock behavior" value={LOCK_MODES[lockMode]} icon="lock" onPress={() => set({ lockMode: (lockMode + 1) % LOCK_MODES.length })} />
      </Group>
      <Group title="Voice companion · 18+">
        <ToggleRow label="Voice companion" sub="Whispered voice during sessions" icon="sound" on={tg.voice && adultConfirmed}
          onPress={() => (adultConfirmed ? flip('voice') : go('/adult'))} />
        {tg.voice && adultConfirmed ? (
          <>
            <NavRow label="How often" value={FREQUENCY_LABELS[voiceFreq]} icon="waves" onPress={() => set({ voiceFreq: ((voiceFreq + 1) % 3) as 0 | 1 | 2 })} />
            <NavRow label="Voice pack" value={clips ? `Turkish · ${clips} clips` : 'Not installed'} icon="headphones"
              onPress={() => showToast(clips ? 'More voices and languages are coming' : 'The voice pack has not been added to this build yet')} />
          </>
        ) : null}
        <ToggleRow label="Background sounds" sub="Breaths and sounds under the voice" icon="waves" on={tg.ambience && adultConfirmed}
          onPress={() => (adultConfirmed ? flip('ambience') : go('/adult'))} />
        {tg.ambience && adultConfirmed ? (
          <NavRow label="Sound pack" value={amb.bed + amb.accents ? `${amb.bed} loop · ${amb.accents} sounds` : 'Not installed'} icon="headphones"
            onPress={() => showToast(amb.bed + amb.accents ? 'Add more sounds to assets/ambience' : 'No background sounds in this build yet')} />
        ) : null}
      </Group>
      {tg.voice && adultConfirmed ? (
        <View style={{ marginTop: 12, marginHorizontal: 24, padding: 16, borderRadius: 20, backgroundColor: C.surface, gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 16 }}>Voice volume</Txt>
            <Txt style={{ fontSize: 16, color: C.muted }}>{Math.round(voiceVolume * 100)}%</Txt>
          </View>
          <Slider label="Voice volume" value={Math.round(voiceVolume * 10)} min={1} max={10} onChange={(v) => set({ voiceVolume: v / 10 })} valueText={`${Math.round(voiceVolume * 100)} percent`} />
        </View>
      ) : null}
      {tg.ambience && adultConfirmed ? (
        <View style={{ marginTop: 12, marginHorizontal: 24, padding: 16, borderRadius: 20, backgroundColor: C.surface, gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 16 }}>Background volume</Txt>
            <Txt style={{ fontSize: 16, color: C.muted }}>{Math.round(ambienceVolume * 100)}%</Txt>
          </View>
          <Slider label="Background volume" value={Math.round(ambienceVolume * 10)} min={1} max={10} onChange={(v) => set({ ambienceVolume: v / 10 })} valueText={`${Math.round(ambienceVolume * 100)} percent`} />
        </View>
      ) : null}
      <Group title="App">
        <ToggleRow label="Sound effects" icon="sound" on={tg.sound} onPress={() => flip('sound')} />
        <ToggleRow label="Dark mode" icon="moon" on={tg.dark} onPress={() => (tg.dark ? showToast('Light mode is coming soon') : flip('dark'))} />
        <NavRow label="Notifications" icon="bell" onPress={() => go('/notifications')} />
        <NavRow label="Language" value="English" icon="globe" onPress={() => showToast('More languages coming soon')} />
      </Group>
      <Group title="Accessibility">
        <ToggleRow label="Reduce Motion" sub="Calmer, static visuals" icon="eye" on={tg.rm} onPress={() => flip('rm')} />
        <ToggleRow label="Visual pulse cues" sub="On-screen pulses as a haptic alternative" icon="waves" on={tg.visual} onPress={() => flip('visual')} />
      </Group>
      <Group title="Device">
        <ToggleRow label="Battery optimization" sub="Lower haptic power in Low Power Mode" icon="battery" on={tg.battery} onPress={() => flip('battery')} />
        <NavRow label="Privacy" icon="shield" onPress={() => go('/privacy')} />
      </Group>
    </ListPage>
  );
}
