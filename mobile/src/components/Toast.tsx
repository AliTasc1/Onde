import { useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '../store';
import { C } from '../theme';
import { Icon } from './Icon';
import { Txt, useTabBarHeight } from './ui';

export function Toast() {
  const toast = useStore((s) => s.toast);
  const segments = useSegments();
  const tabH = useTabBarHeight();
  const insets = useSafeAreaInsets();
  const overTabs = segments[0] === '(tabs)';

  useEffect(() => {
    if (toast) AccessibilityInfo.announceForAccessibility(toast);
  }, [toast]);

  if (!toast) return null;
  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" style={{
      position: 'absolute', left: 24, right: 24, bottom: overTabs ? tabH + 20 : insets.bottom + 108, zIndex: 50,
      flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18,
      backgroundColor: C.track, borderWidth: 1, borderColor: C.border2,
      shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, elevation: 10,
    }}>
      <Icon name="check" size={18} color={C.green} />
      <Txt style={{ fontSize: 15, fontWeight: '500', flex: 1 }}>{toast}</Txt>
    </View>
  );
}
