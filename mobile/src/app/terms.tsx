import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BackHeader, H1, Page, Segmented, Txt } from '../components/ui';
import { useT } from '../i18n';
import { goBack } from '../lib/nav';
import { C } from '../theme';

/** 28 · Terms / Privacy */
export default function Terms() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<'terms' | 'privacy'>(params.tab === 'privacy' ? 'privacy' : 'terms');
  const T = useT().legal;
  return (
    <Page>
      <BackHeader onBack={goBack} />
      <View style={{ paddingTop: 4, paddingHorizontal: 24, gap: 16 }}>
        <H1>{T.title}</H1>
        <Segmented items={[['terms', T.terms], ['privacy', T.privacy]]} value={tab} onChange={setTab} />
        <Txt style={{ fontSize: 13, color: C.faint }}>{T.updated}</Txt>
      </View>
      <View style={{ paddingTop: 8, paddingHorizontal: 24, gap: 20 }}>
        {T.sections[tab].map(([h, p]) => (
          <View key={h} style={{ gap: 6 }}>
            <Txt accessibilityRole="header" style={{ fontSize: 17, fontWeight: '600' }}>{h}</Txt>
            <Txt style={{ fontSize: 15, lineHeight: 24, color: C.muted }}>{p}</Txt>
          </View>
        ))}
      </View>
    </Page>
  );
}
