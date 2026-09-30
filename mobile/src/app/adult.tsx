import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Icon, type IconName } from '../components/Icon';
import { Fill, H1, PrimaryButton, SecondaryButton, Txt } from '../components/ui';
import { Orb } from '../components/visuals';
import { goBack } from '../lib/nav';
import { useT } from '../i18n';
import { useStore } from '../store';
import { C, em } from '../theme';

const POINT_ICONS: IconName[] = ['sound', 'headphones', 'sliders'];

/** Voice companion age gate. The voice stays off until an adult opts in. */
export default function AdultGate() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromEntry = from === 'onboarding';
  const t = useT();

  const leave = () => {
    if (fromEntry) router.replace('/(tabs)/home');
    else goBack();
  };

  const confirm = () => {
    const st = useStore.getState();
    st.set({ adultAsked: true, adultConfirmed: true });
    st.setToggle('voice', true);
    st.setToggle('ambience', true);
    leave();
    st.showToast(t.adult.on);
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
          <Txt style={{ fontSize: 12, fontWeight: '700', letterSpacing: em(0.1, 12), color: C.pinkSoft }}>{t.adult.badge}</Txt>
        </View>
        <H1 style={{ textAlign: 'center' }}>{t.adult.title}</H1>
        <Txt style={{ fontSize: 15, lineHeight: 22.5, color: C.muted, textAlign: 'center', maxWidth: 320 }}>
          {t.adult.body}
        </Txt>
        <View style={{ alignSelf: 'stretch', marginTop: 12, gap: 12 }}>
          {t.adult.points.map((point, i) => (
            <View key={point} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139,92,246,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={POINT_ICONS[i]} size={16} color={C.lilac} />
              </View>
              <Txt style={{ flex: 1, fontSize: 15 }}>{point}</Txt>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton label={t.adult.confirm} onPress={confirm} />
        <SecondaryButton label={t.adult.notNow} onPress={decline} />
        <Txt style={{ fontSize: 12, lineHeight: 18, color: C.faint, textAlign: 'center' }}>
          {t.adult.fine}
        </Txt>
      </View>
    </Fill>
  );
}
