import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { BackHeader, H1, Page, SecondaryButton, Txt } from '../components/ui';
import { SAFETY_ICONS } from '../data/content';
import { useT } from '../i18n';
import { go, goBack } from '../lib/nav';
import { C } from '../theme';

/** 20 · Safety */
export default function Safety() {
  const T = useT().safety;
  return (
    <Page>
      <BackHeader onBack={goBack} />
      <View style={{ paddingTop: 4, paddingHorizontal: 24, gap: 6 }}>
        <H1>{T.title}</H1>
        <Txt style={{ fontSize: 15, color: C.muted, lineHeight: 22.5 }}>{T.sub}</Txt>
      </View>
      <View style={{ gap: 10, paddingTop: 20, paddingHorizontal: 24 }}>
        {T.items.map((t, i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139,92,246,0.16)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={SAFETY_ICONS[i]} size={19} color={C.lilac} />
            </View>
            <Txt style={{ flex: 1, fontSize: 15, lineHeight: 21.75 }}>{t}</Txt>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 16, marginHorizontal: 24, gap: 12 }}>
        <SecondaryButton label={T.setLimit} onPress={() => go('/settings')} textStyle={{ fontSize: 16 }} />
        <Txt style={{ fontSize: 12, lineHeight: 18, color: C.faint, textAlign: 'center' }}>
          {T.disclaimer}
        </Txt>
      </View>
    </Page>
  );
}
