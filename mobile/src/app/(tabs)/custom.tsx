import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { Slider } from '../../components/Slider';
import { Timeline } from '../../components/Timeline';
import { Card, Chip, H1, Page, PrimaryButton, SecondaryButton, Segmented, Tap, Txt } from '../../components/ui';
import { Bars } from '../../components/visuals';
import { DURATIONS } from '../../data/content';
import { MAX_SEGMENTS, rhythmLabel, SEG, SEG_TYPES, type SegType } from '../../data/patterns';
import { useT, useUpper } from '../../i18n';
import { saveCurrentDraft } from '../../lib/actions';
import { go } from '../../lib/nav';
import { averageIntensity, cycleSeconds, segBars, timelineBars } from '../../lib/shapes';
import { useStore, type SavedPattern } from '../../store';
import { C, em } from '../../theme';

/** 12 · Custom Pattern Builder / 14 · Saved Patterns / 23 · Empty State */
export default function Custom() {
  const view = useStore((s) => s.customView);
  const set = useStore((s) => s.set);
  const t = useT();
  const header = (title: string) => (
    <View style={{ paddingTop: 16, paddingHorizontal: 24, gap: 16 }}>
      <H1>{title}</H1>
      <Segmented items={[['create', t.custom.create], ['saved', t.custom.yours]]} value={view} onChange={(v) => set({ customView: v })} />
    </View>
  );
  return view === 'create' ? <Builder header={header(t.custom.createTitle)} /> : <Saved header={header(t.custom.savedTitle)} />;
}

function Builder({ header }: { header: React.ReactNode }) {
  const d = useStore((s) => s.draft);
  const updDraft = useStore((s) => s.updDraft);
  const updSeg = useStore((s) => s.updSeg);
  const moveSeg = useStore((s) => s.moveSeg);
  const showToast = useStore((s) => s.showToast);
  const T = useT();
  const up = useUpper();
  const [tab, setTab] = useState<'segment' | 'global'>('segment');
  const [sheet, setSheet] = useState(false);

  const sel = Math.min(d.sel, d.segs.length - 1);
  const g = d.segs[sel];
  const cycle = cycleSeconds(d.segs);

  const addSeg = (t: SegType) => {
    if (d.segs.length >= MAX_SEGMENTS) { setSheet(false); return showToast(T.custom.maxSegments(MAX_SEGMENTS)); }
    updDraft({ segs: [...d.segs, { type: t, int: t === 'Pause' ? 0 : 6, dur: t === 'Pause' ? 2 : 4 }], sel: d.segs.length });
    setTab('segment');
    setSheet(false);
  };
  const dup = () => {
    if (d.segs.length >= MAX_SEGMENTS) return showToast(T.custom.maxSegments(MAX_SEGMENTS));
    const a = d.segs.slice();
    a.splice(sel + 1, 0, { ...a[sel] });
    updDraft({ segs: a, sel: sel + 1 });
  };
  const del = () => {
    if (d.segs.length <= 1) return;
    const a = d.segs.filter((_, i) => i !== sel);
    updDraft({ segs: a, sel: Math.max(0, Math.min(sel, a.length - 1)) });
  };

  return (
    <>
      <Page tabs>
        {header}
        <Card style={{ marginTop: 16, marginHorizontal: 24, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 13, fontWeight: '600', letterSpacing: em(0.08, 13), color: C.muted }}>{up(T.custom.timeline)}</Txt>
            <Txt style={{ fontSize: 13, color: C.muted }}>{T.custom.loopInfo(cycle, d.segs.length)}</Txt>
          </View>
          <Timeline segs={d.segs} sel={sel} onSelect={(i) => { updDraft({ sel: i }); setTab('segment'); }} onMove={moveSeg} onAdd={() => setSheet(true)} />
          <Txt style={{ fontSize: 12, color: C.faint }}>{T.custom.hint}</Txt>
        </Card>

        <Segmented style={{ marginTop: 12, marginHorizontal: 24 }} items={[['segment', T.custom.segmentTab], ['global', T.custom.globalTab]]} value={tab} onChange={setTab} />

        {tab === 'segment' ? (
          <Card style={{ marginTop: 12, marginHorizontal: 24, gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt style={{ fontSize: 17, fontWeight: '600' }}>{T.custom.segment(sel + 1)}</Txt>
              <Txt style={{ fontSize: 13, color: C.muted }}>{T.seg[g.type].label}</Txt>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SEG_TYPES.map((t) => (
                <Chip key={t} label={T.seg[t].label} active={g.type === t} accent={C.violet} onPress={() => updSeg({ type: t })}
                  style={{ paddingHorizontal: 14 }} textStyle={{ fontSize: 13 }} />
              ))}
            </View>
            <LabeledSlider label={T.common.intensity} value={T.common.of10(g.int)}>
              <Slider label={T.custom.segIntensity} value={g.int} min={0} max={10} onChange={(v) => updSeg({ int: v })} valueText={T.detail.valueOf10(g.int)} />
            </LabeledSlider>
            <LabeledSlider label={T.common.duration} value={T.common.sec(g.dur)}>
              <Slider label={T.custom.segDuration} value={g.dur} min={1} max={20} onChange={(v) => updSeg({ dur: v })} valueText={T.custom.seconds(g.dur)} />
            </LabeledSlider>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SmallAction label={T.custom.moveLeft} onPress={() => moveSeg(sel, sel - 1)} disabled={sel === 0} />
              <SmallAction label={T.custom.moveRight} onPress={() => moveSeg(sel, sel + 1)} disabled={sel === d.segs.length - 1} />
              <SmallAction label={T.custom.duplicate} onPress={dup} />
              <SmallAction label={T.custom.delete} onPress={del} danger disabled={d.segs.length <= 1} />
            </View>
          </Card>
        ) : (
          <Card style={{ marginTop: 12, marginHorizontal: 24, gap: 12 }}>
            <LabeledSlider label={T.custom.frequency} value={T.common.of10(d.freq)}>
              <Slider label={T.custom.frequency} value={d.freq} min={1} max={10} onChange={(v) => updDraft({ freq: v })} />
            </LabeledSlider>
            <LabeledSlider label={T.common.rhythm} value={rhythmLabel(d.rhythm, T.common.rhythmLabels)}>
              <Slider label={T.common.rhythm} value={d.rhythm} min={1} max={10} onChange={(v) => updDraft({ rhythm: v })} valueText={rhythmLabel(d.rhythm, T.common.rhythmLabels)} />
            </LabeledSlider>
            <LabeledSlider label={T.custom.pulseLen} value={T.common.ms(d.pulseLen)}>
              <Slider label={T.custom.pulseLen} value={d.pulseLen} min={100} max={800} step={50} onChange={(v) => updDraft({ pulseLen: v })} valueText={T.custom.millis(d.pulseLen)} />
            </LabeledSlider>
            <LabeledSlider label={T.custom.pauseLen} value={T.common.ms(d.pauseLen)}>
              <Slider label={T.custom.pauseLen} value={d.pauseLen} min={100} max={1500} step={50} onChange={(v) => updDraft({ pauseLen: v })} valueText={T.custom.millis(d.pauseLen)} />
            </LabeledSlider>
            <View style={{ gap: 10 }}>
              <Txt style={{ fontSize: 14, fontWeight: '600' }}>{T.custom.sessionDuration}</Txt>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DURATIONS.map((m) => (
                  <Chip key={m} label={T.common.minShort(m)} active={d.dur === m} onPress={() => updDraft({ dur: m })}
                    style={{ flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 0 }} textStyle={{ fontSize: 13 }} />
                ))}
              </View>
            </View>
          </Card>
        )}

        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 16, paddingHorizontal: 24 }}>
          <SecondaryButton label={T.custom.preview} onPress={() => go('/preview')} style={{ flex: 1 }} icon={<Icon name="play" size={16} color="#fff" />} />
          <PrimaryButton label={T.custom.save} onPress={saveCurrentDraft} style={{ flex: 1, paddingHorizontal: 8 }} />
        </View>
      </Page>
      <AddSegmentSheet visible={sheet} onClose={() => setSheet(false)} onAdd={addSeg} />
    </>
  );
}

function LabeledSlider({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 14, fontWeight: '600' }}>{label}</Txt>
        <Txt style={{ fontSize: 14, color: C.muted }}>{value}</Txt>
      </View>
      {children}
    </View>
  );
}

function SmallAction({ label, onPress, danger, disabled }: { label: string; onPress: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <Tap onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }}
      style={{
        flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, opacity: disabled ? 0.45 : 1,
        borderColor: danger ? 'rgba(248,113,113,0.25)' : C.border, backgroundColor: danger ? 'rgba(248,113,113,0.08)' : C.surface2,
      }}>
      <Txt style={{ fontSize: 12, fontWeight: '600', color: danger ? C.redSoft : '#fff' }}>{label}</Txt>
    </Tap>
  );
}

function AddSegmentSheet({ visible, onClose, onAdd }: { visible: boolean; onClose: () => void; onAdd: (t: SegType) => void }) {
  const insets = useSafeAreaInsets();
  const T = useT();
  const [y] = useState(() => new Animated.Value(400));
  useEffect(() => {
    if (visible) Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }).start();
    else y.setValue(400);
  }, [visible, y]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} accessibilityLabel={T.common.close} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,5,10,0.6)' }]} />
      <Animated.View accessibilityViewIsModal style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        borderTopWidth: 1, borderColor: C.border, paddingTop: 12, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 12) + 24, gap: 8,
        transform: [{ translateY: y }],
      }}>
        <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Txt accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700' }}>{T.custom.addSegment}</Txt>
          <Tap onPress={onClose} accessibilityRole="button" accessibilityLabel={T.common.close}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={16} color="#fff" />
          </Tap>
        </View>
        {SEG_TYPES.map((t) => (
          <Tap key={t} onPress={() => onAdd(t)} accessibilityRole="button" accessibilityLabel={T.custom.addA11y(T.seg[t].label, T.seg[t].desc)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 18, backgroundColor: C.surface2 }}>
            <View style={{ width: 52, height: 40, borderRadius: 10, overflow: 'hidden', padding: 6, justifyContent: 'flex-end' }}>
              <LinearGradient colors={SEG[t].bg.colors} start={SEG[t].bg.start} end={SEG[t].bg.end} style={StyleSheet.absoluteFill} />
              <Bars bars={segBars({ type: t, int: 7, dur: 4 }, 6)} height={28} gap={2} radius={1} align="flex-end" color="rgba(255,255,255,0.75)" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={{ fontSize: 16, fontWeight: '600' }}>{T.seg[t].label}</Txt>
              <Txt style={{ fontSize: 13, color: C.muted }}>{T.seg[t].desc}</Txt>
            </View>
            <Icon name="plus" size={18} color={C.lavender} />
          </Tap>
        ))}
      </Animated.View>
    </Modal>
  );
}

function Saved({ header }: { header: React.ReactNode }) {
  const saved = useStore((s) => s.saved);
  const set = useStore((s) => s.set);
  const T = useT();

  if (!saved.length) {
    return (
      <Page tabs contentStyle={{ flexGrow: 1 }}>
        {header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 24, paddingHorizontal: 40 }}>
          <View style={{ width: 200, height: 96, borderRadius: 24, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(196,181,253,0.28)', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20 }}>
            <View style={{ flex: 2, height: 40, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.18)' }} />
            <View style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' }} />
            <View style={{ flex: 3, height: 40, borderRadius: 10, backgroundColor: 'rgba(196,181,253,0.14)' }} />
          </View>
          <Txt accessibilityRole="header" style={{ marginTop: 8, fontSize: 22, fontWeight: '700', textAlign: 'center' }}>{T.custom.emptyTitle}</Txt>
          <Txt style={{ fontSize: 15, lineHeight: 22.5, color: C.muted, textAlign: 'center' }}>{T.custom.emptyBody}</Txt>
          <PrimaryButton label={T.custom.emptyCta} onPress={() => set({ customView: 'create' })} style={{ marginTop: 8, paddingHorizontal: 28 }} />
        </View>
      </Page>
    );
  }

  return (
    <Page tabs>
      {header}
      <View style={{ gap: 12, paddingTop: 16, paddingHorizontal: 24 }}>
        {saved.map((p) => <SavedRow key={p.id} p={p} />)}
        <Tap onPress={() => set({ customView: 'create' })} accessibilityRole="button"
          style={{ height: 56, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(196,181,253,0.35)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="plus" size={16} color={C.lavender} />
          <Txt style={{ fontSize: 16, fontWeight: '600', color: C.lavender }}>{T.custom.createPattern}</Txt>
        </Tap>
      </View>
    </Page>
  );
}

function SavedRow({ p }: { p: SavedPattern }) {
  const T = useT();
  const avg = Math.round(averageIntensity(p.segs));
  const thumb = timelineBars(p.segs, p.freq, 10, 8).map((b) => ({ h: b.h }));
  const meta = T.custom.savedMeta(p.segs.length, p.dur, avg);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 22, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.hairline }}>
      <View style={{ width: 64, height: 48, borderRadius: 12, backgroundColor: C.surface, paddingHorizontal: 8, justifyContent: 'center' }}>
        <Bars bars={thumb} height={48} gap={2} radius={1} color={C.lavender2} />
      </View>
      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
        <Txt numberOfLines={1} style={{ fontSize: 16, fontWeight: '600' }}>{p.name}</Txt>
        <Txt style={{ fontSize: 13, color: C.muted }}>{meta}</Txt>
      </View>
      <Tap onPress={() => { const st = useStore.getState(); st.deleteSaved(p.id); st.showToast(T.custom.deleted); }}
        accessibilityRole="button" accessibilityLabel={T.custom.deleteA11y(p.name)}
        style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="trash" size={18} color={C.faint} />
      </Tap>
      <Tap onPress={() => { useStore.getState().loadSaved(p.id); go('/preview'); }} accessibilityRole="button" accessibilityLabel={T.custom.previewA11y(p.name)}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="play" size={16} color="#fff" />
      </Tap>
    </View>
  );
}
