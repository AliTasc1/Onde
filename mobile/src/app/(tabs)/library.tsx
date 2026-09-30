import { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { Chip, H1, Page, RoundButton, Tap, Txt } from '../../components/ui';
import { Bars } from '../../components/visuals';
import { CATEGORIES, PATTERNS, type Pattern } from '../../data/patterns';
import { openPattern } from '../../lib/actions';
import { bars } from '../../lib/shapes';
import { useStore } from '../../store';
import { C, F } from '../../theme';

/** 07 · Pattern Library */
export default function Library() {
  const premium = useStore((s) => s.premium);
  const [cat, setCat] = useState('All');
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PATTERNS.filter((p) => (cat === 'All' || p.tags.includes(cat))
      && (!query || `${p.name} ${p.cat} ${p.tags.join(' ')} ${p.desc}`.toLowerCase().includes(query)));
  }, [cat, q]);

  return (
    <Page tabs>
      <View style={{ paddingTop: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H1>Explore Patterns</H1>
        <RoundButton icon={searching ? 'close' : 'search'} label={searching ? 'Close search' : 'Search'} bg={C.surface}
          style={{ borderWidth: 1, borderColor: C.border }}
          onPress={() => { setSearching(!searching); setQ(''); }} />
      </View>

      {searching ? (
        <View style={{ marginTop: 16, marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}>
          <Icon name="search" size={18} color={C.muted} />
          <TextInput value={q} onChangeText={setQ} autoFocus placeholder="Search patterns" placeholderTextColor={C.faint} accessibilityLabel="Search patterns"
            returnKeyType="search" style={{ flex: 1, color: '#fff', fontFamily: F.regular, fontSize: 16 }} />
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 20, paddingHorizontal: 24, paddingBottom: 4 }}>
        {CATEGORIES.map((c) => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}
      </ScrollView>

      <View style={{ gap: 12, paddingTop: 16, paddingHorizontal: 24 }}>
        {list.map((p) => <PatternCard key={p.id} p={p} locked={!!p.locked && !premium} />)}
        {!list.length ? <Txt style={{ fontSize: 15, color: C.muted, textAlign: 'center', paddingVertical: 32 }}>No patterns match your search.</Txt> : null}
      </View>
    </Page>
  );
}

function PatternCard({ p, locked }: { p: Pattern; locked: boolean }) {
  const wave = useMemo(() => bars(p.shape, p.f, 36, 1, locked ? C.locked : C.violetLight), [p, locked]);
  return (
    <Tap onPress={() => openPattern(p.id)} accessibilityRole="button"
      accessibilityLabel={`${p.name}, ${p.dur} minutes, intensity ${p.int}${locked ? ', premium' : ''}`}
      style={{ backgroundColor: C.surface2, borderWidth: 1, borderColor: C.hairline, borderRadius: 24, padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Txt style={{ fontSize: 17, fontWeight: '600' }}>{p.name}</Txt>
          <Txt style={{ fontSize: 13, color: C.muted }}>{p.cat} · {p.dur} min</Txt>
        </View>
        {locked ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(236,72,153,0.14)' }}>
            <Icon name="lock" size={12} color={C.pinkSoft} />
            <Txt style={{ fontSize: 12, fontWeight: '600', color: C.pinkSoft }}>Premium</Txt>
          </View>
        ) : null}
      </View>
      <Bars bars={wave} height={40} gap={2} radius={2} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <View key={i} style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: i < p.int ? C.lavender : C.levelOff }} />
            ))}
          </View>
          <Txt style={{ fontSize: 13, color: C.muted }}>Intensity {p.int}</Txt>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: locked ? C.track : C.violet, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={locked ? 'lock' : 'play'} size={17} color="#fff" />
        </View>
      </View>
    </Tap>
  );
}
