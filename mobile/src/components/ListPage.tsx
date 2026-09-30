import type { ReactNode } from 'react';
import { View } from 'react-native';

import { goBack } from '../lib/nav';
import { C } from '../theme';
import { BackHeader, H1, Page, Txt } from './ui';

/** Back button, large title and subtitle, then grouped rows. */
export function ListPage({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <Page>
      <BackHeader onBack={goBack} />
      <View style={{ paddingTop: 4, paddingHorizontal: 24, gap: 6 }}>
        <H1>{title}</H1>
        <Txt style={{ fontSize: 15, color: C.muted, lineHeight: 22.5 }}>{sub}</Txt>
      </View>
      {children}
    </Page>
  );
}
