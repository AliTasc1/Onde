import { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';

import { Icon, type IconName } from '../components/Icon';
import { BackHeader, H1, Overline, Page, Tap, Txt } from '../components/ui';
import { FAQS, SUPPORT_EMAIL } from '../data/content';
import { go, goBack } from '../lib/nav';
import { useStore } from '../store';
import { C, F } from '../theme';

/** 26 · Help & Support */
export default function Help() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(0);
  const query = q.trim().toLowerCase();
  const faqs = FAQS.map(([question, a], i) => ({ question, a, i })).filter((f) => !query || `${f.question} ${f.a}`.toLowerCase().includes(query));

  const email = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Onde support')}`;
    try {
      await Linking.openURL(url);
    } catch {
      useStore.getState().showToast(`Email us at ${SUPPORT_EMAIL}`);
    }
  };

  return (
    <Page>
      <BackHeader onBack={goBack} />
      <View style={{ paddingTop: 4, paddingHorizontal: 24, gap: 16 }}>
        <H1>Help &amp; Support</H1>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}>
          <Icon name="search" size={18} color={C.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search help" placeholderTextColor={C.faint} accessibilityLabel="Search help"
            returnKeyType="search" style={{ flex: 1, color: '#fff', fontFamily: F.regular, fontSize: 16 }} />
        </View>
      </View>

      <View style={{ paddingTop: 24, paddingHorizontal: 24 }}>
        <Overline style={{ marginLeft: 4, marginBottom: 10 }}>Common questions</Overline>
        <View style={{ gap: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
          {faqs.map((f) => {
            const isOpen = open === f.i;
            return (
              <View key={f.i} style={{ backgroundColor: C.surface }}>
                <Pressable onPress={() => setOpen(isOpen ? -1 : f.i)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 12, paddingHorizontal: 16 }}>
                  <Txt style={{ flex: 1, fontSize: 15, fontWeight: '600' }}>{f.question}</Txt>
                  <View style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}><Icon name="chev" size={16} color={C.muted} /></View>
                </Pressable>
                {isOpen ? <Txt style={{ paddingHorizontal: 16, paddingBottom: 16, fontSize: 14, lineHeight: 21.7, color: C.muted }}>{f.a}</Txt> : null}
              </View>
            );
          })}
          {!faqs.length ? <Txt style={{ backgroundColor: C.surface, padding: 16, fontSize: 14, color: C.muted }}>No answers match. Try other words, or email us.</Txt> : null}
        </View>
      </View>

      <View style={{ paddingTop: 24, paddingHorizontal: 24 }}>
        <Overline style={{ marginLeft: 4, marginBottom: 10 }}>Contact</Overline>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <ContactCard icon="mail" title="Email us" sub="Reply within 24h" onPress={email} />
          <ContactCard icon="info" title="Safety" sub="Use responsibly" onPress={() => go('/safety')} />
        </View>
      </View>
    </Page>
  );
}

function ContactCard({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`}
      style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: C.hairline, backgroundColor: C.surface, gap: 10 }}>
      <Icon name={icon} size={20} color={C.lavender} />
      <Txt style={{ fontSize: 15, fontWeight: '600' }}>{title}</Txt>
      <Txt style={{ fontSize: 12, color: C.muted }}>{sub}</Txt>
    </Tap>
  );
}
