import { View } from 'react-native';

import { ListPage } from '../components/ListPage';
import { Slider } from '../components/Slider';
import { Group, NavRow, ToggleRow, Txt } from '../components/ui';
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
