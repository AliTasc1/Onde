import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Icon } from '../components/Icon';
import { ListPage } from '../components/ListPage';
import { Group, NavRow, ToggleRow, Txt } from '../components/ui';
import { PRIVACY_ICONS } from '../data/content';
import { useT } from '../i18n';
import { exportData, toggleNotifications } from '../lib/actions';
import { go } from '../lib/nav';
import { useStore } from '../store';
import { C } from '../theme';

/** 17 · Privacy Center */
export default function Privacy() {
  const tg = useStore((s) => s.tg);
  const flip = useStore((s) => s.flip);
  const showToast = useStore((s) => s.showToast);
  const T = useT().privacy;

  return (
    <ListPage title={T.title} sub={T.sub}>
      <View style={{ marginTop: 20, marginHorizontal: 24, padding: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(196,181,253,0.12)', gap: 14 }}>
        <LinearGradient colors={['rgba(139,92,246,0.16)', 'rgba(139,92,246,0)']} locations={[0, 0.7]} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFill} />
        <Txt style={{ fontSize: 15, fontWeight: '600' }}>{T.howTitle}</Txt>
        {T.facts.map(([t, d], i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(139,92,246,0.18)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={PRIVACY_ICONS[i]} size={18} color={C.lilac} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={{ fontSize: 15, fontWeight: '600' }}>{t}</Txt>
              <Txt style={{ fontSize: 13, lineHeight: 19, color: C.muted }}>{d}</Txt>
            </View>
          </View>
        ))}
      </View>

      <Group title={T.permissions}>
        <ToggleRow label={T.analytics} sub={T.analyticsSub} icon="chart" on={tg.analytics} onPress={() => flip('analytics')} />
        <ToggleRow label={T.personalization} sub={T.personalizationSub} icon="sliders" on={tg.personalization} onPress={() => flip('personalization')} />
        <ToggleRow label={T.notifications} sub={T.notificationsSub} icon="bell" on={tg.notif} onPress={toggleNotifications} />
      </Group>
      <Group title={T.storage}>
        <ToggleRow label={T.local} sub={T.localSub} icon="device" on={tg.local} onPress={() => flip('local')} />
        <ToggleRow label={T.cloud} sub={T.cloudSub} icon="cloud" on={tg.cloud}
          onPress={() => (tg.cloud ? flip('cloud') : showToast(T.cloudSoon))} />
      </Group>
      <Group title={T.yourData}>
        <NavRow label={T.export} icon="download" onPress={exportData} />
        <NavRow label={T.deleteData} icon="trash" danger onPress={() => go('/delete?mode=data')} />
        <NavRow label={T.deleteAccount} icon="user" danger onPress={() => go('/delete?mode=account')} />
      </Group>
    </ListPage>
  );
}
