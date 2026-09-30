import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import { Group, H1, NavRow, Page, Tap, Txt } from '../../components/ui';
import { go } from '../../lib/nav';
import { useStore } from '../../store';
import { C } from '../../theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const version = Constants.expoConfig?.version ?? '1.0';

/** 16 · Profile */
export default function Profile() {
  const premium = useStore((s) => s.premium);
  const name = useStore((s) => s.name);
  const createdAt = useStore((s) => s.createdAt);
  const since = new Date(createdAt);
  const planLabel = premium ? 'Premium member' : `Free plan · Member since ${MONTHS[since.getMonth()]} ${since.getFullYear()}`;
  const displayName = name || 'Onde member';

  const groups: { title: string | null; rows: [string, IconName, () => void, string?][] }[] = [
    { title: 'Account', rows: [
      ['Preferences', 'sliders', () => go('/settings')],
      ['Haptic Settings', 'wave', () => go('/settings')],
      ['Notifications', 'bell', () => go('/notifications')],
      ['Subscription', 'crown', () => go('/subscription'), premium ? 'Premium' : 'Free'],
    ] },
    { title: 'Privacy', rows: [
      ['Privacy', 'shield', () => go('/privacy')],
      ['Data', 'device', () => go('/privacy')],
    ] },
    { title: 'Support', rows: [
      ['Help & Support', 'help', () => go('/help')],
      ['Safety', 'info', () => go('/safety')],
      ['Terms', 'doc', () => go('/terms?tab=terms')],
      ['Privacy Policy', 'doc', () => go('/terms?tab=privacy')],
      ['About', 'waves', () => useStore.getState().showToast(`Onde ${version} · Made with care`), `Version ${version}`],
    ] },
  ];

  return (
    <Page tabs>
      <View style={{ paddingTop: 16, paddingHorizontal: 24 }}><H1>Profile</H1></View>
      <View style={{ marginTop: 20, marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <LinearGradient colors={['#8B5CF6', '#C45CC8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {name ? <Txt style={{ fontSize: 26, fontWeight: '700' }}>{name[0].toUpperCase()}</Txt> : <View><Icon name="user" size={28} color="#fff" /></View>}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt style={{ fontSize: 20, fontWeight: '600' }}>{displayName}</Txt>
          <Txt style={{ fontSize: 14, color: C.muted }}>{planLabel}</Txt>
        </View>
      </View>

      {!premium ? (
        <Tap onPress={() => go('/subscription')} accessibilityRole="button" accessibilityLabel="Onde Premium. All patterns and the advanced builder"
          style={{ marginTop: 20, marginHorizontal: 24, padding: 16, borderRadius: 22, overflow: 'hidden', backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(196,181,253,0.18)', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <LinearGradient colors={['rgba(139,92,246,0.28)', 'rgba(236,72,153,0.16)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="crown" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontSize: 16, fontWeight: '600' }}>Onde Premium</Txt>
            <Txt style={{ fontSize: 13, color: C.lilac }}>All patterns and the advanced builder</Txt>
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
        <NavRow compact danger label="Delete Account" icon="trash" onPress={() => go('/delete?mode=account')} />
      </Group>
    </Page>
  );
}
