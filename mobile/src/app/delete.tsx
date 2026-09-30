import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Icon } from '../components/Icon';
import { BackHeader, DangerButton, H1, Page, SecondaryButton, Txt } from '../components/ui';
import { exportData } from '../lib/actions';
import { goBack } from '../lib/nav';
import { openManageSubscriptions } from '../services/purchases';
import { useStore } from '../store';
import { C, F } from '../theme';

/** 27 · Delete Account (and Delete My Data). Requires typing DELETE. */
export default function Delete() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isData = mode === 'data';
  const [text, setText] = useState('');
  const confirmed = text.trim().toUpperCase() === 'DELETE';
  const items = isData
    ? ['Saved patterns', 'Session history & insights', 'Favorites']
    : ['Your profile', 'Saved patterns', 'Session history & insights', 'Preferences and settings'];

  const doDelete = () => {
    if (!confirmed) return;
    const st = useStore.getState();
    if (isData) {
      st.deleteData();
      goBack();
      st.showToast('Your data has been deleted');
    } else {
      st.deleteAccount();
      if (router.canDismiss()) router.dismissAll();
      router.replace('/onboarding');
      st.showToast('Your account has been deleted');
    }
  };

  return (
    <Page contentStyle={{ flexGrow: 1, paddingHorizontal: 24 }} bottom={40}>
      <BackHeader onBack={goBack} inset={false} />
      <View style={{ gap: 12, marginTop: 8 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(248,113,113,0.12)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="trash" size={26} color={C.red} />
        </View>
        <H1 style={{ marginTop: 4 }}>{isData ? 'Delete your data?' : 'Delete your account?'}</H1>
        <Txt style={{ fontSize: 15, lineHeight: 22.5, color: C.muted }}>{'This can\u2019t be undone. The following will be permanently removed:'}</Txt>
      </View>
      <View style={{ marginTop: 16, padding: 16, borderRadius: 20, backgroundColor: C.surface, gap: 12 }}>
        {items.map((d) => (
          <View key={d} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.red }} />
            <Txt style={{ fontSize: 15 }}>{d}</Txt>
          </View>
        ))}
      </View>
      <Txt style={{ marginTop: 12, marginHorizontal: 4, fontSize: 13, lineHeight: 19.5, color: C.muted }}>
        {'Your subscription isn\u2019t cancelled automatically. '}
        <Txt onPress={openManageSubscriptions} accessibilityRole="link" style={{ fontSize: 13, color: C.lavender }}>Manage Subscription</Txt>
      </Txt>
      <View style={{ marginTop: 20, gap: 8 }}>
        <Txt style={{ fontSize: 14, color: C.textDim }}>Type <Txt style={{ fontSize: 14, fontWeight: '700', color: C.textDim }}>DELETE</Txt> to confirm</Txt>
        <TextInput value={text} onChangeText={setText} accessibilityLabel="Type DELETE to confirm" autoCapitalize="characters" autoCorrect={false} autoComplete="off"
          style={{ height: 52, borderRadius: 16, borderWidth: 1, borderColor: C.border2, backgroundColor: C.surface, color: '#fff', fontFamily: F.regular, fontSize: 17, paddingHorizontal: 16, letterSpacing: 1.36 }} />
      </View>
      <View style={{ flex: 1, minHeight: 24 }} />
      <View style={{ gap: 12 }}>
        <DangerButton label={isData ? 'Delete My Data' : 'Delete Account'} onPress={doDelete} disabled={!confirmed} />
        <SecondaryButton label="Export My Data First" onPress={exportData} />
      </View>
    </Page>
  );
}
