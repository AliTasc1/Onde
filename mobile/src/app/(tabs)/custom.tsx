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
import { saveCurrentDraft } from '../../lib/actions';
import { go } from '../../lib/nav';
import { averageIntensity, cycleSeconds, segBars, timelineBars } from '../../lib/shapes';
import { useStore, type SavedPattern } from '../../store';
import { C, em } from '../../theme';

/** 12 · Custom Pattern Builder / 14 · Saved Patterns / 23 · Empty State */
export default function Custom() {
  const view = useStore((s) => s.customView);
  const set = useStore((s) => s.set);
  const header = (title: string) => (
    <View style={{ paddingTop: 16, paddingHorizontal: 24, gap: 16 }}>
      <H1>{title}</H1>
      <Segmented items={[['create', 'Create'], ['saved', 'Your Patterns']]} value={view} onChange={(v) => set({ customView: v })} />
    </View>
  );
  return view === 'create' ? <Builder header={header('Create Your Pattern')} /> : <Saved header={header('Your Patterns')} />;
}

function Builder({ header }: { header: React.ReactNode }) {
  const d = useStore((s) => s.draft);
  const updDraft = useStore((s) => s.updDraft);
  const updSeg = useStore((s) => s.updSeg);
  const moveSeg = useStore((s) => s.moveSeg);
  const showToast = useStore((s) => s.showToast);
  const [tab, setTab] = useState<'segment' | 'global'>('segment');
  const [sheet, setSheet] = useState(false);

  const sel = Math.min(d.sel, d.segs.length - 1);
  const g = d.segs[sel];
  const cycle = cycleSeconds(d.segs);

  const addSeg = (t: SegType) => {
    if (d.segs.length >= MAX_SEGMENTS) { setSheet(false); return showToast(`Up to ${MAX_SEGMENTS} segments`); }
    updDraft({ segs: [...d.segs, { type: t, int: t === 'Pause' ? 0 : 6, dur: t === 'Pause' ? 2 : 4 }], sel: d.segs.length });
    setTab('segment');
    setSheet(false);
  };
  const dup = () => {
    if (d.segs.length >= MAX_SEGMENTS) return showToast(`Up to ${MAX_SEGMENTS} segments`);
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
            <Txt style={{ fontSize: 13, fontWeight: '600', letterSpacing: em(0.08, 13), textTransform: 'uppercase', color: C.muted }}>Timeline</Txt>
            <Txt style={{ fontSize: 13, color: C.muted }}>{cycle} s loop · {d.segs.length} segments</Txt>
          </View>
          <Timeline segs={d.segs} sel={sel} onSelect={(i) => { updDraft({ sel: i }); setTab('segment'); }} onMove={moveSeg} onAdd={() => setSheet(true)} />
          <Txt style={{ fontSize: 12, color: C.faint }}>Hold and drag to reorder · Tap a segment to edit</Txt>
        </Card>

        <Segmented style={{ marginTop: 12, marginHorizontal: 24 }} items={[['segment', 'Segment'], ['global', 'Global']]} value={tab} onChange={setTab} />

        {tab === 'segment' ? (
          <Card style={{ marginTop: 12, marginHorizontal: 24, gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt style={{ fontSize: 17, fontWeight: '600' }}>Segment {sel + 1}</Txt>
              <Txt style={{ fontSize: 13, color: C.muted }}>{g.type}</Txt>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SEG_TYPES.map((t) => (
                <Chip key={t} label={t} active={g.type === t} accent={C.violet} onPress={() => updSeg({ type: t })}
                  style={{ paddingHorizontal: 14 }} textStyle={{ fontSize: 13 }} />
              ))}
            </View>
            <LabeledSlider label="Intensity" value={`${g.int} / 10`}>
              <Slider label="Segment intensity" value={g.int} min={0} max={10} onChange={(v) => updSeg({ int: v })} valueText={`${g.int} of 10`} />
            </LabeledSlider>
            <LabeledSlider label="Duration" value={`${g.dur} s`}>
              <Slider label="Segment duration" value={g.dur} min={1} max={20} onChange={(v) => updSeg({ dur: v })} valueText={`${g.dur} seconds`} />
            </LabeledSlider>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SmallAction label="← Move" onPress={() => moveSeg(sel, sel - 1)} disabled={sel === 0} />
              <SmallAction label="Move →" onPress={() => moveSeg(sel, sel + 1)} disabled={sel === d.segs.length - 1} />
              <SmallAction label="Duplicate" onPress={dup} />
              <SmallAction label="Delete" onPress={del} danger disabled={d.segs.length <= 1} />
            </View>
          </Card>
        ) : (
          <Card style={{ marginTop: 12, marginHorizontal: 24, gap: 12 }}>
            <LabeledSlider label="Frequency" value={`${d.freq} / 10`}>
              <Slider label="Frequency" value={d.freq} min={1} max={10} onChange={(v) => updDraft({ freq: v })} />
            </LabeledSlider>
            <LabeledSlider label="Rhythm" value={rhythmLabel(d.rhythm)}>
              <Slider label="Rhythm" value={d.rhythm} min={1} max={10} onChange={(v) => updDraft({ rhythm: v })} valueText={rhythmLabel(d.rhythm)} />
            </LabeledSlider>
            <LabeledSlider label="Pulse length" value={`${d.pulseLen} ms`}>
              <Slider label="Pulse length" value={d.pulseLen} min={100} max={800} step={50} onChange={(v) => updDraft({ pulseLen: v })} valueText={`${d.pulseLen} milliseconds`} />
            </LabeledSlider>
            <LabeledSlider label="Pause length" value={`${d.pauseLen} ms`}>
              <Slider label="Pause length" value={d.pauseLen} min={100} max={1500} step={50} onChange={(v) => updDraft({ pauseLen: v })} valueText={`${d.pauseLen} milliseconds`} />
            </LabeledSlider>
            <View style={{ gap: 10 }}>
              <Txt style={{ fontSize: 14, fontWeight: '600' }}>Session duration</Txt>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DURATIONS.map((m) => (
                  <Chip key={m} label={`${m}m`} active={d.dur === m} onPress={() => updDraft({ dur: m })}
                    style={{ flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 0 }} textStyle={{ fontSize: 13 }} />
                ))}
              </View>
            </View>
          </Card>
        )}

        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 16, paddingHorizontal: 24 }}>
          <SecondaryButton label="Preview" onPress={() => go('/preview')} style={{ flex: 1 }} icon={<Icon name="play" size={16} color="#fff" />} />
          <PrimaryButton label="Save Pattern" onPress={saveCurrentDraft} style={{ flex: 1, paddingHorizontal: 8 }} />
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
  const [y] = useState(() => new Animated.Value(400));
  useEffect(() => {
    if (visible) Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }).start();
    else y.setValue(400);
  }, [visible, y]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} accessibilityLabel="Close" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,5,10,0.6)' }]} />
      <Animated.View accessibilityViewIsModal style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        borderTopWidth: 1, borderColor: C.border, paddingTop: 12, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 12) + 24, gap: 8,
        transform: [{ translateY: y }],
      }}>
        <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Txt accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700' }}>Add segment</Txt>
          <Tap onPress={onClose} accessibilityRole="button" accessibilityLabel="Close"
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={16} color="#fff" />
          </Tap>
        </View>
        {SEG_TYPES.map((t) => (
          <Tap key={t} onPress={() => onAdd(t)} accessibilityRole="button" accessibilityLabel={`Add ${t}: ${SEG[t].desc}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 18, backgroundColor: C.surface2 }}>
            <View style={{ width: 52, height: 40, borderRadius: 10, overflow: 'hidden', padding: 6, justifyContent: 'flex-end' }}>
              <LinearGradient colors={SEG[t].bg.colors} start={SEG[t].bg.start} end={SEG[t].bg.end} style={StyleSheet.absoluteFill} />
              <Bars bars={segBars({ type: t, int: 7, dur: 4 }, 6)} height={28} gap={2} radius={1} align="flex-end" color="rgba(255,255,255,0.75)" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={{ fontSize: 16, fontWeight: '600' }}>{t}</Txt>
              <Txt style={{ fontSize: 13, color: C.muted }}>{SEG[t].desc}</Txt>
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
          <Txt accessibilityRole="header" style={{ marginTop: 8, fontSize: 22, fontWeight: '700', textAlign: 'center' }}>No saved patterns yet.</Txt>
          <Txt style={{ fontSize: 15, lineHeight: 22.5, color: C.muted, textAlign: 'center' }}>Patterns you create and save will appear here.</Txt>
          <PrimaryButton label="Create Your First Pattern" onPress={() => set({ customView: 'create' })} style={{ marginTop: 8, paddingHorizontal: 28 }} />
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
          <Txt style={{ fontSize: 16, fontWeight: '600', color: C.lavender }}>Create Pattern</Txt>
        </Tap>
      </View>
    </Page>
  );
}

function SavedRow({ p }: { p: SavedPattern }) {
  const avg = Math.round(averageIntensity(p.segs));
  const thumb = timelineBars(p.segs, p.freq, 10, 8).map((b) => ({ h: b.h }));
  const meta = `${p.segs.length} segments · ${p.dur} min · Intensity ${avg}`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 22, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.hairline }}>
      <View style={{ width: 64, height: 48, borderRadius: 12, backgroundColor: C.surface, paddingHorizontal: 8, justifyContent: 'center' }}>
        <Bars bars={thumb} height={48} gap={2} radius={1} color={C.lavender2} />
      </View>
      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
        <Txt numberOfLines={1} style={{ fontSize: 16, fontWeight: '600' }}>{p.name}</Txt>
        <Txt style={{ fontSize: 13, color: C.muted }}>{meta}</Txt>
      </View>
      <Tap onPress={() => { const st = useStore.getState(); st.deleteSaved(p.id); st.showToast('Pattern deleted'); }}
        accessibilityRole="button" accessibilityLabel={`Delete ${p.name}`}
        style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="trash" size={18} color={C.faint} />
      </Tap>
      <Tap onPress={() => { useStore.getState().loadSaved(p.id); go('/preview'); }} accessibilityRole="button" accessibilityLabel={`Preview ${p.name}`}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="play" size={16} color="#fff" />
      </Tap>
    </View>
  );
}
