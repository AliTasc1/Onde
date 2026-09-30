import * as ExpoHaptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';

import { SEG, type Segment } from '../data/patterns';
import { useT } from '../i18n';
import { segBars } from '../lib/shapes';
import { C } from '../theme';
import { Icon } from './Icon';
import { Txt } from './ui';
import { Bars } from './visuals';

type Props = {
  segs: Segment[];
  sel: number;
  onSelect: (i: number) => void;
  onMove: (from: number, to: number) => void;
  onAdd: () => void;
};

/**
 * Proportional segment timeline. Tap selects; long-press then drag reorders
 * (the ← Move / Move → buttons remain as the accessible alternative).
 */
export function Timeline({ segs, sel, onSelect, onMove, onAdd }: Props) {
  const [dragging, setDragging] = useState<number | null>(null);
  const t = useT();
  const drag = useRef<number | null>(null);
  const rowX = useRef(0);
  const rowRef = useRef<View>(null);
  const layouts = useRef<{ x: number; w: number }[]>([]);
  const captured = useRef(false);
  const endDrag = () => { drag.current = null; captured.current = false; setDragging(null); };

  const onDragMove = (e: GestureResponderEvent) => {
    const from = drag.current;
    if (from == null) return;
    const x = e.nativeEvent.pageX - rowX.current;
    let target = from;
    layouts.current.slice(0, segs.length).forEach((l, i) => { if (l && x >= l.x && x <= l.x + l.w) target = i; });
    if (target !== from) {
      onMove(from, target);
      drag.current = target;
      setDragging(target);
      if (Platform.OS !== 'web') ExpoHaptics.selectionAsync().catch(() => {});
    }
  };

  return (
    <View
      ref={rowRef}
      onMoveShouldSetResponderCapture={() => drag.current != null}
      onResponderTerminationRequest={() => false}
      onResponderGrant={() => {
        captured.current = true;
        rowRef.current?.measureInWindow((x) => { rowX.current = x; });
      }}
      onResponderMove={onDragMove}
      onResponderRelease={endDrag}
      onResponderTerminate={endDrag}
      style={{ flexDirection: 'row', gap: 4, height: 92 }}
    >
      {segs.map((g, i) => {
        const selected = i === sel;
        const meta = SEG[g.type];
        return (
          <Pressable
            key={i}
            onLayout={(e) => { layouts.current[i] = { x: e.nativeEvent.layout.x, w: e.nativeEvent.layout.width }; }}
            onPress={() => onSelect(i)}
            onLongPress={() => {
              drag.current = i;
              setDragging(i);
              onSelect(i);
              if (Platform.OS !== 'web') ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            // Long-press released without dragging: the row never took over, so reset here.
            onPressOut={() => setTimeout(() => { if (!captured.current && drag.current != null) endDrag(); }, 0)}
            delayLongPress={250}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t.custom.segA11y(i + 1, t.seg[g.type].label, g.dur, g.int)}
            style={{ flex: g.dur, minWidth: 34, transform: [{ scale: dragging === i ? 1.06 : 1 }], opacity: dragging != null && dragging !== i ? 0.7 : 1 }}
          >
            {selected ? <View pointerEvents="none" style={s.ring} /> : null}
            <View style={s.seg}>
              <LinearGradient colors={meta.bg.colors} start={meta.bg.start} end={meta.bg.end} style={StyleSheet.absoluteFill} />
              <Bars bars={segBars(g, Math.max(3, Math.min(10, Math.round(g.dur * 1.1))))} height={40} gap={2} radius={1.5} align="flex-end" color="rgba(255,255,255,0.72)" />
              <View style={{ gap: 1 }}>
                <Txt numberOfLines={1} style={{ fontSize: 11, fontWeight: '600' }}>{t.seg[g.type].short}</Txt>
                <Txt numberOfLines={1} style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{t.common.sec(g.dur)}</Txt>
              </View>
            </View>
          </Pressable>
        );
      })}
      <Pressable onPress={onAdd} accessibilityRole="button" accessibilityLabel={t.custom.addSegment}
        style={{ width: 44, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(196,181,253,0.4)', backgroundColor: 'rgba(139,92,246,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="plus" size={22} color={C.lavender} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  seg: { flex: 1, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 6, justifyContent: 'space-between', overflow: 'hidden' },
  ring: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 18, borderWidth: 2, borderColor: '#fff' },
});
