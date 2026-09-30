import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Icon, type IconName } from '../components/Icon';
import { Fill, H1, PrimaryButton, SecondaryButton, Txt } from '../components/ui';
import { Orb } from '../components/visuals';
import { goBack } from '../lib/nav';
import { useStore } from '../store';
import { C, em } from '../theme';

const POINTS: [IconName, string][] = [
  ['sound', 'A soft, whispered voice that accompanies your sessions'],
  ['headphones', 'Best with headphones'],
  ['sliders', 'Change or turn it off anytime in Settings'],
];

/** Voice companion age gate. The voice stays off until an adult opts in. */
export default function AdultGate() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromEntry = from === 'onboarding';

  const leave = () => {
    if (fromEntry) router.replace('/(tabs)/home');
    else goBack();
  };

  const confirm = () => {
    const st = useStore.getState();
    st.set({ adultAsked: true, adultConfirmed: true });
    st.setToggle('voice', true);
    leave();
    st.showToast('Voice companion on');
  };

  const decline = () => {
    useStore.getState().set({ adultAsked: true });
    leave();
  };

  return (
    <Fill>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Orb size={180} rhythm={2} intensity={4}><Icon name="sound" size={40} color="#fff" /></Orb>
        <View style={{ marginTop: 12, height: 26, paddingHorizontal: 12, borderRadius: 13, backgroundColor: 'rgba(236,72,153,0.16)', justifyContent: 'center' }}>
          <Txt style={{ fontSize: 12, fontWeight: '700', letterSpacing: em(0.1, 12), color: C.pinkSoft }}>18+ ONLY</Txt>
        </View>
        <H1 style={{ textAlign: 'center' }}>Voice Companion</H1>
        <Txt style={{ fontSize: 15, lineHeight: 22.5, color: C.muted, textAlign: 'center', maxWidth: 320 }}>
          This optional voice uses intimate, adult language and is intended for adults only. It stays off unless you turn it on.
        </Txt>
        <View style={{ alignSelf: 'stretch', marginTop: 12, gap: 12 }}>
          {POINTS.map(([icon, t]) => (
            <View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139,92,246,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={16} color={C.lilac} />
              </View>
              <Txt style={{ flex: 1, fontSize: 15 }}>{t}</Txt>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton label="I'm 18 or older — Turn On" onPress={confirm} />
        <SecondaryButton label="Not Now" onPress={decline} />
        <Txt style={{ fontSize: 12, lineHeight: 18, color: C.faint, textAlign: 'center' }}>
          By turning it on you confirm you are at least 18 years old.
        </Txt>
      </View>
    </Fill>
  );
}
