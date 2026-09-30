import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { Fill, H1, PrimaryButton, SecondaryButton, Txt } from '../components/ui';
import { Orb, RadialGlow } from '../components/visuals';
import { goTab } from '../lib/nav';
import { openManageSubscriptions, PLANS, storeName } from '../services/purchases';
import { useStore } from '../store';
import { C } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 22 · Payment Confirmation */
export default function Payment() {
  const plan = useStore((s) => s.plan);
  const p = PLANS[plan];
  const renew = new Date();
  renew.setMonth(renew.getMonth() + p.renewMonths);
  const receipt: [string, string][] = [
    ['Plan', plan === 'yearly' ? 'Premium Yearly' : 'Premium Monthly'],
    ['Price', `${p.price} / ${p.per}`],
    ['Renews', `${MONTHS[renew.getMonth()]} ${renew.getDate()}, ${renew.getFullYear()}`],
    ['Paid with', storeName],
  ];

  const finish = () => {
    const st = useStore.getState();
    st.set({ premium: true });
    goTab('home');
    st.showToast('Premium unlocked');
  };

  return (
    <Fill>
      <RadialGlow glows={[{ cx: 0.5, cy: 0.28, rx: 0.8, ry: 0.4, color: '#8B5CF6', opacity: 0.22 }]} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Orb size={140} rhythm={3} intensity={5}><Icon name="check" size={44} color="#fff" /></Orb>
        <H1 size={30} style={{ marginTop: 12 }}>{'You\u2019re all set'}</H1>
        <Txt style={{ fontSize: 16, color: C.muted }}>Onde Premium is now active.</Txt>
        <View style={{ alignSelf: 'stretch', marginTop: 16, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, overflow: 'hidden' }}>
          {receipt.map(([k, v], i) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.04)' }}>
              <Txt style={{ fontSize: 15, color: C.muted }}>{k}</Txt>
              <Txt style={{ fontSize: 15, fontWeight: '600' }}>{v}</Txt>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Start Exploring" onPress={finish} />
        <SecondaryButton label="Manage Subscription" onPress={openManageSubscriptions} />
      </View>
    </Fill>
  );
}
