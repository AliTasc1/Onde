import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, H1, Page, Txt } from '../../components/ui';
import { DAY_LABELS, weeklyInsights } from '../../lib/insights';
import { useStore } from '../../store';
import { C, em } from '../../theme';

/** 15 · Insights — usage only, never health measurements. */
export default function Insights() {
  const history = useStore((s) => s.history);
  const w = useMemo(() => weeklyInsights(history), [history]);
  const maxMin = Math.max(12, ...w.minutes);
  const topFav = w.favs[0]?.[1] ?? 1;

  return (
    <Page tabs>
      <View style={{ paddingTop: 16, paddingHorizontal: 24, gap: 4 }}>
        <H1>Your Insights</H1>
        <Txt style={{ fontSize: 15, color: C.muted }}>This week · {w.label}</Txt>
      </View>

      <View style={{ marginTop: 20, marginHorizontal: 24, padding: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(196,181,253,0.12)', gap: 16 }}>
        <LinearGradient colors={['rgba(139,92,246,0.2)', 'rgba(139,92,246,0)']} locations={[0, 0.7]} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <Txt style={{ fontSize: 52, fontWeight: '700', letterSpacing: em(-0.03, 52), lineHeight: 56 }}>{w.sessions}</Txt>
          <Txt style={{ fontSize: 17, color: C.lilac }}>{w.sessions === 1 ? 'session' : 'sessions'} this week</Txt>
        </View>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 13, color: C.muted }}>Weekly consistency</Txt>
            <Txt style={{ fontSize: 13, fontWeight: '600' }}>{w.activeDays} of 7 days</Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {DAY_LABELS.map((l, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={{ alignSelf: 'stretch', height: 8, borderRadius: 4, backgroundColor: w.perDay[i] > 0 ? C.violetLight : C.trackMuted }} />
                <Txt style={{ fontSize: 11, color: C.muted }}>{l}</Txt>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, paddingHorizontal: 24 }}>
        <Tile label="Total minutes"><Txt style={{ fontSize: 26, fontWeight: '700' }}>{w.totalMin}</Txt></Tile>
        <Tile label="Average intensity">
          <Txt style={{ fontSize: 26, fontWeight: '700' }}>{w.sessions ? w.avgInt.toFixed(1) : '–'}<Txt style={{ fontSize: 15, color: C.muted, fontWeight: '500' }}> /10</Txt></Txt>
        </Tile>
        <Tile label="Most used time">
          <Txt style={{ fontSize: 18, fontWeight: '600' }}>{w.time?.name ?? '–'}</Txt>
          {w.time ? <Txt style={{ fontSize: 13, color: C.muted }}>{w.time.range}</Txt> : null}
        </Tile>
        <Tile label="Favorite pattern">
          <Txt numberOfLines={1} style={{ fontSize: 18, fontWeight: '600' }}>{w.favs[0]?.[0] ?? '–'}</Txt>
          {w.favs[0] ? <Txt style={{ fontSize: 13, color: C.muted }}>{w.favs[0][1]} {w.favs[0][1] > 1 ? 'sessions' : 'session'}</Txt> : null}
        </Tile>
      </View>

      <Card style={{ marginTop: 12, marginHorizontal: 24, gap: 14 }}>
        <Txt style={{ fontSize: 15, fontWeight: '600' }}>Minutes per day</Txt>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', height: 120 }}>
          {w.minutes.map((m, i) => (
            <View key={i} style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <Txt style={{ fontSize: 11, color: C.muted }}>{m || '–'}</Txt>
              {i === w.todayIdx && m ? (
                <LinearGradient colors={['#F0ABFC', '#A78BFA']} style={{ alignSelf: 'stretch', height: `${Math.round((m / maxMin) * 80)}%`, minHeight: 4, borderRadius: 8 }} />
              ) : (
                <View style={{ alignSelf: 'stretch', height: `${Math.round((m / maxMin) * 80)}%`, minHeight: 4, borderRadius: 8, backgroundColor: m ? '#7C5CE6' : C.trackMuted }} />
              )}
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {DAY_LABELS.map((l, i) => <Txt key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: i === w.todayIdx ? '#fff' : C.faint }}>{l}</Txt>)}
        </View>
      </Card>

      <Card style={{ marginTop: 12, marginHorizontal: 24, gap: 14 }}>
        <Txt style={{ fontSize: 15, fontWeight: '600' }}>Favorite patterns</Txt>
        {w.favs.length ? w.favs.map(([name, n]) => (
          <View key={name} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 14 }}>{name}</Txt>
              <Txt style={{ fontSize: 14, color: C.muted }}>{n} {n > 1 ? 'sessions' : 'session'}</Txt>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: C.trackMuted }}>
              <View style={{ height: '100%', width: `${Math.round((n / topFav) * 100)}%`, borderRadius: 3, backgroundColor: C.lavender2 }} />
            </View>
          </View>
        )) : (
          <Txt style={{ fontSize: 14, lineHeight: 20, color: C.muted }}>Finish a session to see the patterns you return to most.</Txt>
        )}
      </Card>

      <Txt style={{ marginTop: 16, marginHorizontal: 32, fontSize: 12, lineHeight: 18, color: C.faint, textAlign: 'center' }}>
        {'Insights reflect how you use Onde. They aren\u2019t health measurements.'}
      </Txt>
    </Page>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, borderRadius: 22, padding: 16, gap: 6 }}>
      <Txt style={{ fontSize: 13, color: C.muted }}>{label}</Txt>
      {children}
    </View>
  );
}
