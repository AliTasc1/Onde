import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '../components/Icon';
import { H1, Page, PrimaryButton, RoundButton, Txt } from '../components/ui';
import { RadialGlow } from '../components/visuals';
import { PATTERNS } from '../data/patterns';
import { goBack } from '../lib/nav';
import { openManageSubscriptions, PLANS, purchase, restorePurchases, type Plan } from '../services/purchases';
import { useStore } from '../store';
import { C, em } from '../theme';

const freeCount = PATTERNS.filter((p) => !p.locked).length;
const FEATURES: [string, string][] = [
  ['All patterns', `${freeCount} of ${PATTERNS.length}`],
  ['Advanced pattern builder', 'Basic'],
  ['Unlimited saved patterns', '3'],
  ['Advanced controls', '—'],
  ['Detailed insights', 'Basic'],
  ['Premium themes', '—'],
];

/** 21 · Subscription — honest paywall, clear pricing. */
export default function Subscription() {
  const plan = useStore((s) => s.plan);
  const set = useStore((s) => s.set);
  const showToast = useStore((s) => s.showToast);
  const [busy, setBusy] = useState(false);
  const p = PLANS[plan];

  const restore = async () => {
    const r = await restorePurchases();
    if (r.restored) { set({ premium: true }); showToast('Premium restored'); goBack(); }
    else showToast('No previous purchases found');
  };

  const buy = async () => {
    setBusy(true);
    try {
      const r = await purchase(plan);
      if (r.ok) router.replace('/payment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <RadialGlow glows={[{ cx: 0.5, cy: 0, rx: 0.9, ry: 0.4, color: '#8B5CF6', opacity: 0.25 }]} />
      <Page bottom={40} style={{ backgroundColor: 'transparent' }}>
        <View style={{ height: 60, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <RoundButton icon="close" label="Close" bg="rgba(255,255,255,0.08)" size={18} onPress={goBack} />
          <Pressable onPress={restore} accessibilityRole="button" style={{ height: 44, paddingHorizontal: 12, justifyContent: 'center' }}>
            <Txt style={{ fontSize: 15, fontWeight: '600', color: C.lilac }}>Restore</Txt>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 24, gap: 8 }}>
          <H1 size={30} style={{ lineHeight: 34.5 }}>Unlock Your Personal Experience</H1>
          <Txt style={{ fontSize: 15, color: C.muted }}>Everything in Onde, on all your devices.</Txt>
        </View>

        <View style={{ marginTop: 20, marginHorizontal: 24, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16 }}>
            <View style={{ flex: 1 }} />
            <Txt style={{ width: 64, textAlign: 'center', fontSize: 12, fontWeight: '600', letterSpacing: em(0.08, 12), textTransform: 'uppercase', color: C.muted }}>Free</Txt>
            <Txt style={{ width: 72, textAlign: 'center', fontSize: 12, fontWeight: '600', letterSpacing: em(0.08, 12), textTransform: 'uppercase', color: C.lilac }}>Premium</Txt>
          </View>
          {FEATURES.map(([l, free]) => (
            <View key={l} accessible accessibilityLabel={`${l}: free ${free === '—' ? 'not included' : free}, premium included`}
              style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
              <Txt style={{ flex: 1, fontSize: 14 }}>{l}</Txt>
              <Txt style={{ width: 64, textAlign: 'center', color: C.muted, fontSize: 13 }}>{free}</Txt>
              <View style={{ width: 72, alignItems: 'center' }}><Icon name="check" size={18} color={C.lavender} /></View>
            </View>
          ))}
        </View>

        <View style={{ gap: 10, paddingTop: 16, paddingHorizontal: 24 }} accessibilityRole="radiogroup">
          {(Object.keys(PLANS) as Plan[]).map((k) => {
            const pl = PLANS[k];
            const a = plan === k;
            return (
              <Pressable key={k} onPress={() => set({ plan: k })} accessibilityRole="radio" accessibilityState={{ checked: a }}
                accessibilityLabel={`${pl.name}, ${pl.price}, ${pl.note}${pl.badge ? `, ${pl.badge}` : ''}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, borderWidth: a ? 1.5 : 1, borderColor: a ? C.violetLight : C.border, backgroundColor: a ? 'rgba(139,92,246,0.12)' : C.surface }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: a ? C.violetLight : C.locked, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: a ? C.violetLight : 'transparent' }} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Txt style={{ fontSize: 16, fontWeight: '600' }}>{pl.name}</Txt>
                    {pl.badge ? (
                      <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: C.pink, justifyContent: 'center' }}>
                        <Txt style={{ fontSize: 11, fontWeight: '700' }}>{pl.badge}</Txt>
                      </View>
                    ) : null}
                  </View>
                  <Txt style={{ fontSize: 13, color: C.muted }}>{pl.note}</Txt>
                </View>
                <Txt style={{ fontSize: 17, fontWeight: '600' }}>{pl.price}</Txt>
              </Pressable>
            );
          })}
        </View>

        <View style={{ paddingTop: 16, paddingHorizontal: 24, gap: 12 }}>
          <PrimaryButton label={`Continue — ${p.price} / ${p.per}`} onPress={buy} disabled={busy} shadow />
          <Txt style={{ fontSize: 12, lineHeight: 18, color: C.faint, textAlign: 'center' }}>
            Billed {p.price} {plan === 'yearly' ? 'once a year' : 'every month'}. Renews automatically. Cancel anytime in your store settings.
          </Txt>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
            <Txt onPress={restore} accessibilityRole="link" style={{ fontSize: 13, color: C.lavender }}>Restore Purchases</Txt>
            <Txt onPress={openManageSubscriptions} accessibilityRole="link" style={{ fontSize: 13, color: C.lavender }}>Manage Subscription</Txt>
            <Txt onPress={() => router.push('/terms?tab=terms')} accessibilityRole="link" style={{ fontSize: 13, color: C.lavender }}>Terms</Txt>
          </View>
        </View>
      </Page>
    </View>
  );
}
