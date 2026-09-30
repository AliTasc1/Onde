import * as ExpoHaptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Platform, View, type AccessibilityActionEvent, type GestureResponderEvent } from 'react-native';

import { C, SLIDER_GRADIENT } from '../theme';

const PAD = 13;

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  valueText?: string;
};

/** Gradient slider from the design: 6pt track, 26pt white thumb, 40pt hit area. */
export function Slider({ value, min, max, step = 1, onChange, label, valueText }: Props) {
  const ref = useRef<View>(null);
  const geom = useRef({ x: 0, w: 1 });
  const sent = useRef(value);

  const measure = () => ref.current?.measureInWindow((x, _y, w) => { geom.current = { x, w }; });

  const setFromX = (pageX: number) => {
    const { x, w } = geom.current;
    let f = (pageX - x - PAD) / Math.max(1, w - PAD * 2);
    f = Math.max(0, Math.min(1, f));
    const v = +(Math.round((min + f * (max - min)) / step) * step).toFixed(2);
    if (v !== sent.current) {
      sent.current = v;
      onChange(v);
      if (Platform.OS !== 'web') ExpoHaptics.selectionAsync().catch(() => {});
    }
  };

  const onGrant = (e: GestureResponderEvent) => {
    const pageX = e.nativeEvent.pageX;
    sent.current = value;
    ref.current?.measureInWindow((x, _y, w) => { geom.current = { x, w }; setFromX(pageX); });
  };

  const pct = ((value - min) / (max - min)) * 100;
  const onAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === 'increment') onChange(Math.min(max, +(value + step).toFixed(2)));
    if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(min, +(value - step).toFixed(2)));
  };

  return (
    <View
      ref={ref}
      onLayout={measure}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={(e) => setFromX(e.nativeEvent.pageX)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: valueText }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAction}
      style={{ height: 40, paddingHorizontal: PAD, justifyContent: 'center' }}
    >
      <View style={{ height: 6, borderRadius: 3, backgroundColor: C.track }}>
        <LinearGradient colors={SLIDER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 3 }} />
        <View pointerEvents="none" style={{
          position: 'absolute', left: `${pct}%`, top: 3, width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: 17,
          backgroundColor: 'rgba(139,92,246,0.25)', alignItems: 'center', justifyContent: 'center',
        }}>
          <View style={{
            width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff',
            shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4,
          }} />
        </View>
      </View>
    </View>
  );
}
