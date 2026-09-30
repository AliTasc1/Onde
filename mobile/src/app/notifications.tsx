import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Icon } from '../components/Icon';
import { ListPage } from '../components/ListPage';
import { Group, NavRow, ToggleRow, Txt } from '../components/ui';
import { NOTIF_PREVIEWS } from '../data/content';
import { toggleNotifications } from '../lib/actions';
import { useStore } from '../store';
import { C } from '../theme';

/** 19 · Notifications */
export default function Notifications() {
  const tg = useStore((s) => s.tg);
  const flip = useStore((s) => s.flip);
  const showToast = useStore((s) => s.showToast);

  return (
    <ListPage title="Notifications" sub="Gentle reminders, only when you want them.">
      <View style={{ marginTop: 20, marginHorizontal: 24, gap: 8 }} accessibilityLabel="Example notifications">
        {NOTIF_PREVIEWS.map(([t, m]) => (
          <View key={t} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(40,40,56,0.75)', borderWidth: 1, borderColor: C.hairline, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              <LinearGradient colors={['#6D3FE0', '#B45CC8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View><Icon name="waves" size={20} color="#fff" /></View>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt style={{ fontSize: 13, fontWeight: '600' }}>Onde</Txt>
                <Txt style={{ fontSize: 13, color: C.muted }}>{t}</Txt>
              </View>
              <Txt style={{ fontSize: 14, color: C.textSoft }}>{m}</Txt>
            </View>
          </View>
        ))}
      </View>

      <Group>
        <ToggleRow label="Allow notifications" icon="bell" on={tg.notif} onPress={toggleNotifications} />
      </Group>
      <Group title="Types">
        <ToggleRow label="Evening routine" sub="Daily at 9:00 PM" icon="moon" on={tg.n_routine} onPress={() => flip('n_routine')} />
        <ToggleRow label="Gentle check-ins" sub={'If you haven’t taken a break in a while'} icon="breath" on={tg.n_checkin} onPress={() => flip('n_checkin')} />
        <ToggleRow label="New patterns & tips" icon="waves" on={tg.n_tips} onPress={() => flip('n_tips')} />
      </Group>
      <Group title="Schedule">
        <NavRow label="Quiet hours" value="11 PM – 8 AM" icon="clock" onPress={() => showToast('Custom quiet hours are coming soon')} />
      </Group>
    </ListPage>
  );
}
