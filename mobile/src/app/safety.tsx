import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { BackHeader, H1, Page, SecondaryButton, Txt } from '../components/ui';
import { SAFETY } from '../data/content';
import { go, goBack } from '../lib/nav';
import { C } from '../theme';

/** 20 · Safety */
export default function Safety() {
  return (
    <Page>
      <BackHeader onBack={goBack} />
      <View style={{ paddingTop: 4, paddingHorizontal: 24, gap: 6 }}>
        <H1>Use responsibly</H1>
        <Txt style={{ fontSize: 15, color: C.muted, lineHeight: 22.5 }}>A few simple guidelines for a comfortable experience.</Txt>
      </View>
      <View style={{ gap: 10, paddingTop: 20, paddingHorizontal: 24 }}>
        {SAFETY.map(([icon, t]) => (
          <View key={t} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139,92,246,0.16)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={19} color={C.lilac} />
            </View>
            <Txt style={{ flex: 1, fontSize: 15, lineHeight: 21.75 }}>{t}</Txt>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 16, marginHorizontal: 24, gap: 12 }}>
        <SecondaryButton label="Set an intensity limit" onPress={() => go('/settings')} textStyle={{ fontSize: 16 }} />
        <Txt style={{ fontSize: 12, lineHeight: 18, color: C.faint, textAlign: 'center' }}>
          {'Onde is a relaxation tool and isn\u2019t intended to diagnose, treat or prevent any condition.'}
        </Txt>
      </View>
    </Page>
  );
}
