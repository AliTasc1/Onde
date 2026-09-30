import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { BackHeader, Fill, H1, PrimaryButton, SecondaryButton, Txt } from '../components/ui';
import { ERROR_STEPS } from '../data/content';
import { haptics } from '../haptics/engine';
import { goBack, goTab } from '../lib/nav';
import { useStore } from '../store';
import { C } from '../theme';

/** 24 · Error State — shown when the device rejects haptics. */
export default function HapticsError() {
  const retry = async () => {
    const ok = await haptics.test();
    const st = useStore.getState();
    if (ok) { st.showToast('Haptics are working'); goTab('home'); }
    else st.showToast('Something went wrong. Try again.');
  };
  const visualMode = () => {
    useStore.getState().setToggle('visual', true);
    goTab('home');
  };

  return (
    <Fill>
      <BackHeader onBack={goBack} inset={false} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="alert" size={38} color={C.red} />
        </View>
        <H1 size={26} style={{ marginTop: 8, textAlign: 'center' }}>{'Haptic feedback isn\u2019t available.'}</H1>
        <Txt style={{ fontSize: 15, lineHeight: 22.5, color: C.muted, maxWidth: 300, textAlign: 'center' }}>
          {'Your device doesn\u2019t support this feature, or vibration is turned off.'}
        </Txt>
        <View style={{ alignSelf: 'stretch', marginTop: 12, padding: 16, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, gap: 12 }}>
          <Txt style={{ fontSize: 14, fontWeight: '600' }}>Please check your device settings</Txt>
          {ERROR_STEPS.map((t, i) => (
            <View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.trackMuted, alignItems: 'center', justifyContent: 'center' }}>
                <Txt style={{ fontSize: 12, fontWeight: '700' }}>{i + 1}</Txt>
              </View>
              <Txt style={{ flex: 1, fontSize: 14, color: C.textDim }}>{t}</Txt>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Try Again" onPress={retry} />
        <SecondaryButton label="Continue with visual mode" onPress={visualMode} />
      </View>
    </Fill>
  );
}
