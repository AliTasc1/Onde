import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import { Group, H1, NavRow, Page, Tap, Txt } from '../../components/ui';
import { useT } from '../../i18n';
import { go } from '../../lib/nav';
import { useStore } from '../../store';
import { C } from '../../theme';

const version = Constants.expoConfig?.version ?? '1.0';

/** 16 · Profile */
export default function Profile() {
  const premium = useStore((s) => s.premium);
  const t = useT();
  const P = t.profile;
  const name = useStore((s) => s.name);
  const createdAt = useStore((s) => s.createdAt);
  const since = new Date(createdAt);
  const planLabel = premium ? P.premiumMember : P.freeSince(t.dates.months[since.getMonth()], since.getFullYear());
  const displayName = name || P.member;

  const groups: { title: string | null; rows: [string, IconName, () => void, string?][] }[] = [
    { title: P.account, rows: [
      [P.preferences, 'sliders', () => go('/settings')],
      [P.hapticSettings, 'wave', () => go('/settings')],
      [P.notifications, 'bell', () => go('/notifications')],
      [P.subscription, 'crown', () => go('/subscription'), premium ? t.common.premium : t.common.free],
    ] },
    { title: P.privacyGroup, rows: [
      [P.privacy, 'shield', () => go('/privacy')],
      [P.data, 'device', () => go('/privacy')],
    ] },
    { title: P.support, rows: [
      [P.help, 'help', () => go('/help')],
      [P.safety, 'info', () => go('/safety')],
      [P.terms, 'doc', () => go('/terms?tab=terms')],
      [P.privacyPolicy, 'doc', () => go('/terms?tab=privacy')],
      [P.about, 'waves', () => useStore.getState().showToast(P.aboutToast(version)), P.version(version)],
    ] },
  ];

  return (
    <Page tabs>
      <View style={{ paddingTop: 16, paddingHorizontal: 24 }}><H1>{P.title}</H1></View>
      <View style={{ marginTop: 20, marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <LinearGradient colors={['#8B5CF6', '#C45CC8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {name ? <Txt style={{ fontSize: 26, fontWeight: '700' }}>{name[0].toLocaleUpperCase()}</Txt> : <View><Icon name="user" size={28} color="#fff" /></View>}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt style={{ fontSize: 20, fontWeight: '600' }}>{displayName}</Txt>
          <Txt style={{ fontSize: 14, color: C.muted }}>{planLabel}</Txt>
        </View>
      </View>

      {!premium ? (
        <Tap onPress={() => go('/subscription')} accessibilityRole="button" accessibilityLabel={`${P.promoTitle}. ${P.promoBody}`}
          style={{ marginTop: 20, marginHorizontal: 24, padding: 16, borderRadius: 22, overflow: 'hidden', backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(196,181,253,0.18)', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <LinearGradient colors={['rgba(139,92,246,0.28)', 'rgba(236,72,153,0.16)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="crown" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontSize: 16, fontWeight: '600' }}>{P.promoTitle}</Txt>
            <Txt style={{ fontSize: 13, color: C.lilac }}>{P.promoBody}</Txt>
          </View>
          <Icon name="chev" size={18} color="#fff" />
        </Tap>
      ) : null}

      {groups.map((g) => (
        <Group key={g.title} title={g.title}>
          {g.rows.map(([label, icon, onPress, value]) => <NavRow key={label} compact label={label} icon={icon} value={value} onPress={onPress} />)}
        </Group>
      ))}
      <Group title=" ">
        <NavRow compact danger label={P.deleteAccount} icon="trash" onPress={() => go('/delete?mode=account')} />
      </Group>
    </Page>
  );
}
