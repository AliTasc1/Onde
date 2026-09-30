import { BlurView } from 'expo-blur';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '../i18n';
import { useStore } from '../store';
import { C } from '../theme';
import { Icon, type IconName } from './Icon';
import { TAB_BAR_BASE, Txt } from './ui';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, IconName> = { home: 'home', library: 'wave', custom: 'sliders', insights: 'activity', profile: 'user' };

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const setStore = useStore((s) => s.set);
  const t = useT();
  return (
    <View style={[s.bar, { height: TAB_BAR_BASE + Math.max(insets.bottom, 12), paddingBottom: Math.max(insets.bottom, 12) }]} accessibilityRole="tablist">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,11,18,0.88)' }]} />
      {state.routes.map((route, index) => {
        const icon = TABS[route.name];
        if (!icon) return null;
        const label = t.tabs[route.name as keyof typeof t.tabs];
        const focused = state.index === index;
        const color = focused ? '#fff' : C.tabIdle;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (route.name === 'custom') setStore({ customView: 'create' });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label}
            style={s.tab}>
            <Icon name={icon} size={24} color={color} />
            <Txt style={{ fontSize: 11, fontWeight: '600', color }}>{label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingTop: 6, paddingHorizontal: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
