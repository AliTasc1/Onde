import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated, Pressable, ScrollView, StyleSheet, Text, View,
  type PressableProps, type ScrollViewProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { localeOf, useT } from '../i18n';
import { useStore } from '../store';
import { C, em, F, PRIMARY_GRADIENT } from '../theme';
import { Icon, type IconName } from './Icon';

const FAMILY: Record<string, string> = {
  '400': F.regular, normal: F.regular, '500': F.medium, '600': F.semibold, '700': F.bold, bold: F.bold,
};

/** Text in Plus Jakarta Sans; `fontWeight` picks the matching font file. */
export function Txt({ style, ...rest }: TextProps) {
  const { fontWeight, ...flat } = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  return (
    <Text
      maxFontSizeMultiplier={1.35}
      {...rest}
      style={[{ color: C.text, fontSize: 16 }, flat, { fontFamily: FAMILY[String(fontWeight ?? '400')] ?? F.regular }]}
    />
  );
}

export const TAB_BAR_BASE = 58;

export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE + Math.max(insets.bottom, 12);
}

/** Pressable with a gentle press state. */
export function Tap({ style, children, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  return (
    <Pressable {...rest} style={({ pressed }) => [style, pressed && !rest.disabled ? { opacity: 0.78 } : null]}>
      {children}
    </Pressable>
  );
}

type BtnProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function PrimaryButton({ label, onPress, icon, style, textStyle, disabled, shadow = false, accessibilityLabel }: BtnProps & { shadow?: boolean }) {
  return (
    <Tap onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
      style={[s.btn, shadow && s.btnShadow, disabled && { opacity: 0.4 }, style]}>
      <LinearGradient {...PRIMARY_GRADIENT} style={[StyleSheet.absoluteFill, { borderRadius: 18 }]} />
      {icon ? <View>{icon}</View> : null}
      <Txt style={[s.btnText, textStyle]}>{label}</Txt>
    </Tap>
  );
}

export function SecondaryButton({ label, onPress, icon, style, textStyle, disabled, accessibilityLabel }: BtnProps) {
  return (
    <Tap onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
      style={[s.btn, { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border2 }, style]}>
      {icon}
      <Txt style={[s.btnText, textStyle]}>{label}</Txt>
    </Tap>
  );
}

export function DangerButton({ label, onPress, style, disabled }: BtnProps) {
  return (
    <Tap onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }}
      style={[s.btn, { backgroundColor: C.red, opacity: disabled ? 0.4 : 1 }, style]}>
      <Txt style={[s.btnText, { color: C.redInk, fontWeight: '700' }]}>{label}</Txt>
    </Tap>
  );
}

/** 44pt circular icon button (back, close, favourite…). */
export function RoundButton({ icon, onPress, label, color = C.text, bg = C.surface2, size = 20, style }: {
  icon: IconName; onPress?: () => void; label: string; color?: string; bg?: string; size?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}
      style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Icon name={icon} size={size} color={color} />
    </Tap>
  );
}

export function Chip({ label, active, onPress, accent, style, textStyle }: {
  label: string; active: boolean; onPress: () => void; accent?: string; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}
      style={[{
        height: 36, paddingHorizontal: 16, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
        backgroundColor: active ? accent ?? C.chipActive : C.surface2,
        borderColor: active ? 'transparent' : C.border,
      }, style]}>
      <Txt style={[{ fontSize: 14, fontWeight: '600', color: active ? (accent ? '#fff' : C.chipActiveInk) : C.chipIdleInk }, textStyle]}>{label}</Txt>
    </Tap>
  );
}

export function Toggle({ on }: { on: boolean }) {
  const [x] = useState(() => new Animated.Value(on ? 1 : 0));
  useEffect(() => {
    Animated.timing(x, { toValue: on ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [on, x]);
  return (
    <Animated.View style={{
      width: 51, height: 31, borderRadius: 16, padding: 2,
      backgroundColor: x.interpolate({ inputRange: [0, 1], outputRange: [C.offTrack, C.violet] }),
    }}>
      <Animated.View style={{
        width: 27, height: 27, borderRadius: 14, backgroundColor: '#fff',
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }],
      }} />
    </Animated.View>
  );
}

export function Segmented<K extends string>({ items, value, onChange, style }: {
  items: [K, string][]; value: K; onChange: (k: K) => void; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.segWrap, style]} accessibilityRole="tablist">
      {items.map(([k, label]) => {
        const active = k === value;
        return (
          <Pressable key={k} onPress={() => onChange(k)} accessibilityRole="tab" accessibilityState={{ selected: active }}
            style={{ flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? C.track : 'transparent' }}>
            <Txt style={{ fontSize: 14, fontWeight: '600', color: active ? '#fff' : C.muted }}>{label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Scrollable page that clears the status bar and, optionally, the tab bar. */
export function Page({ children, tabs, bottom = 48, style, contentStyle, ...rest }: ScrollViewProps & {
  tabs?: boolean; bottom?: number; contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const tabH = useTabBarHeight();
  return (
    <ScrollView
      {...rest}
      style={[{ flex: 1, backgroundColor: C.bg }, style]}
      contentContainerStyle={[{ paddingTop: insets.top, paddingBottom: tabs ? tabH + 32 : bottom + insets.bottom }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

/** Non-scrolling full-screen layout (session, complete, payment…). */
export function Fill({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) + 16, paddingHorizontal: 24 }, style]}>
      {children}
    </View>
  );
}

export function BackHeader({ onBack, title, right, icon = 'back', inset = true }: {
  onBack: () => void; title?: string; right?: ReactNode; icon?: IconName; inset?: boolean;
}) {
  const t = useT();
  return (
    <View style={{ height: 60, paddingHorizontal: inset ? 16 : 0, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <RoundButton icon={icon} label={icon === 'close' ? t.common.close : t.common.back} onPress={onBack} size={icon === 'close' ? 18 : 20} />
      {title ? <Txt style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', marginRight: right ? 0 : 44 }}>{title}</Txt> : null}
      {right}
    </View>
  );
}

export function H1({ children, style, size = 28 }: { children: ReactNode; style?: StyleProp<TextStyle>; size?: number }) {
  return <Txt accessibilityRole="header" style={[{ fontSize: size, fontWeight: '700', letterSpacing: em(-0.02, size), lineHeight: size * 1.2 }, style]}>{children}</Txt>;
}

export function Overline({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  // Upper-case in JS with the app locale: textTransform ignores Turkish i → İ.
  const lang = useStore((s) => s.lang);
  const text = typeof children === 'string' ? children.toLocaleUpperCase(localeOf(lang)) : children;
  return <Txt style={[{ fontSize: 12, fontWeight: '600', color: C.muted, letterSpacing: 1.2 }, style]}>{text}</Txt>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, borderRadius: 24, padding: 16 }, style]}>{children}</View>;
}

export function Group({ title, children }: { title?: string | null; children: ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
      {title ? <Overline style={{ marginLeft: 4, marginBottom: 10 }}>{title}</Overline> : null}
      <View style={{ gap: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

type RowBase = { label: string; sub?: string | null; icon?: IconName; compact?: boolean };

export function NavRow({ label, sub, icon, value, onPress, danger, compact }: RowBase & { value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={value ? `${label}, ${value}` : label}
      style={[s.row, compact ? s.rowCompact : null]}>
      {icon ? <Icon name={icon} size={20} color={danger ? C.red : C.lavender} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={{ fontSize: 16, color: danger ? C.red : '#fff' }}>{label}</Txt>
        {sub ? <Txt style={s.rowSub}>{sub}</Txt> : null}
      </View>
      {value ? <Txt style={{ fontSize: 14, color: C.muted }}>{value}</Txt> : null}
      <Icon name="chev" size={16} color={C.chev} />
    </Tap>
  );
}

export function ToggleRow({ label, sub, icon, on, onPress }: RowBase & { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: on }} style={s.row}>
      {icon ? <Icon name={icon} size={20} color={C.lavender} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={{ fontSize: 16 }}>{label}</Txt>
        {sub ? <Txt style={s.rowSub}>{sub}</Txt> : null}
      </View>
      <Toggle on={on} />
    </Pressable>
  );
}

/** Small stat tile used on Complete / Preview. */
export function Stat({ label, value, style, valueSize = 17 }: { label: string; value: string; style?: StyleProp<ViewStyle>; valueSize?: number }) {
  return (
    <View style={[{ flex: 1, backgroundColor: C.surface, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 8, gap: 4 }, style]}>
      <Txt style={{ fontSize: 12, color: C.muted }}>{label}</Txt>
      <Txt numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: valueSize, fontWeight: '600' }}>{value}</Txt>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden', paddingHorizontal: 20 },
  btnShadow: { shadowColor: C.violet, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6, overflow: 'visible' },
  btnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  segWrap: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: C.surface },
  rowCompact: { minHeight: 56, paddingVertical: 0 },
  rowSub: { fontSize: 13, lineHeight: 18, color: C.muted },
});
