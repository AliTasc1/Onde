import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { Fill, H1, PrimaryButton, SecondaryButton, Txt } from '../components/ui';
import { Orb } from '../components/visuals';
import { PERMISSION_POINTS } from '../data/content';
import { goBack } from '../lib/nav';
import { requestNotificationPermission } from '../services/notifications';
import { useStore } from '../store';
import { C } from '../theme';

/** 25 · Permission Screen — explains before the OS prompt. */
export default function Permission() {
  const allow = async () => {
    const granted = await requestNotificationPermission();
    const st = useStore.getState();
    if (granted) {
      st.setToggle('notif', true);
      goBack();
      st.showToast('Notifications on');
    } else {
      goBack();
      st.showToast('Turn on notifications for Onde in your device settings');
    }
  };

  return (
    <Fill>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Orb size={200} rhythm={2} intensity={3}><Icon name="bell" size={44} color="#fff" /></Orb>
        <H1 style={{ marginTop: 16, textAlign: 'center' }}>Allow Notifications?</H1>
        <Txt style={{ fontSize: 16, color: C.muted, textAlign: 'center' }}>Stay updated with your wellness routines.</Txt>
        <View style={{ alignSelf: 'stretch', marginTop: 16, gap: 12 }}>
          {PERMISSION_POINTS.map((p) => (
            <View key={p} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(139,92,246,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={15} color={C.lilac} />
              </View>
              <Txt style={{ flex: 1, fontSize: 15 }}>{p}</Txt>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Allow" onPress={allow} />
        <SecondaryButton label="Not Now" onPress={goBack} />
      </View>
    </Fill>
  );
}
