import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, F, glow, hexA, R, S } from '@/theme';

import { Backdrop } from './backdrop';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = 22, color = C.textDim, style }: { name: IconName; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}

// ---------- Teks ----------
type TxtProps = TextProps & { color?: string; size?: number; center?: boolean };
const mk =
  (base: TextStyle, upper = false) =>
  ({ style, color, size, center, children, ...rest }: TxtProps) => (
    <Text
      {...rest}
      style={[base, color ? { color } : null, size ? { fontSize: size } : null, center ? { textAlign: 'center' } : null, style]}>
      {upper && typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );

export const Display = mk({ fontFamily: F.display, fontSize: 36, lineHeight: 40, letterSpacing: 0.5, color: C.text }, true);
export const H1 = mk({ fontFamily: F.headline, fontSize: 28, lineHeight: 32, letterSpacing: 0.5, color: C.text }, true);
export const H2 = mk({ fontFamily: F.headline, fontSize: 22, lineHeight: 26, letterSpacing: 0.3, color: C.text }, true);
export const H3 = mk({ fontFamily: F.title, fontSize: 18, lineHeight: 22, color: C.text });
export const Body = mk({ fontFamily: F.body, fontSize: 15, lineHeight: 22, color: C.textMuted });
export const BodyStrong = mk({ fontFamily: F.bodyBold, fontSize: 15, lineHeight: 22, color: C.text });
export const Mono = mk({ fontFamily: F.mono, fontSize: 14, color: C.textMuted });
export const Stat = mk({ fontFamily: F.monoBold, fontSize: 24, letterSpacing: -0.5, color: C.lavender });
export const Label = mk({ fontFamily: F.label, fontSize: 11, letterSpacing: 1.6, color: C.textDim }, true);

// ---------- Layout ----------
export function Screen({
  children,
  scroll = true,
  padBottom = 120,
  header,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padBottom?: number;
  header?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <Backdrop />
      <View style={{ paddingTop: insets.top }}>{header}</View>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ paddingHorizontal: S.margin, paddingTop: S.md, paddingBottom: padBottom + insets.bottom }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.maxW}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingHorizontal: S.margin, paddingBottom: insets.bottom + S.md }, contentStyle]}>
          <View style={[styles.maxW, { flex: 1 }]}>{children}</View>
        </View>
      )}
    </View>
  );
}

export function TopBar({ left, title, right }: { left?: React.ReactNode; title?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.topBar}>
      <View style={[styles.maxW, styles.topBarInner]}>
        <View style={{ minWidth: 40 }}>{left}</View>
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: S.sm }}>
          {typeof title === 'string' ? (
            <Text numberOfLines={1} style={styles.topTitle}>
              {title.toUpperCase()}
            </Text>
          ) : (
            title
          )}
        </View>
        <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </View>
  );
}

export function IconButton({ name, onPress, color = C.lavender, size = 24 }: { name: IconName; onPress?: () => void; color?: string; size?: number }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.6 : 1 }]}>
      <Icon name={name} color={color} size={size} />
    </Pressable>
  );
}

export function Card({
  children,
  style,
  onPress,
  tone = 'default',
  light = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: 'default' | 'success' | 'danger' | 'active';
  light?: boolean;
}) {
  const borderColor =
    tone === 'success' ? hexA(C.success, 0.45) : tone === 'danger' ? hexA(C.danger, 0.4) : tone === 'active' ? C.borderStrong : C.border;
  const bg = tone === 'success' ? '#0f1f1c' : C.surface;
  const inner = (
    <>
      {light && (
        <LinearGradient
          colors={[tone === 'success' ? hexA(C.success, 0.08) : hexA(C.primary, 0.1), 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </>
  );
  const base: StyleProp<ViewStyle> = [
    styles.card,
    { borderColor, backgroundColor: bg },
    tone === 'success' ? glow(C.success, 14, 0.18) : tone === 'active' ? glow(C.primary, 12, 0.25) : null,
    style,
  ];
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.85 }]}>
        {inner}
      </Pressable>
    );
  return <View style={base}>{inner}</View>;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: C.borderMuted }, style]} />;
}

export function SectionTitle({ icon, title, right }: { icon?: IconName; title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      {icon && <Icon name={icon} color={C.lavender} size={22} />}
      <H2 style={{ flex: 1 }}>{title}</H2>
      {right}
    </View>
  );
}

// ---------- Tombol ----------
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  pill,
  size = 'md',
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'light';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  pill?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const v = disabled ? 'disabled' : variant;
  const colors: Record<string, { bg: string; fg: string; border: string }> = {
    primary: { bg: C.primary, fg: C.white, border: C.primary },
    light: { bg: C.lavender, fg: '#2a1366', border: C.lavender },
    secondary: { bg: 'transparent', fg: C.lavender, border: C.primary },
    ghost: { bg: 'transparent', fg: C.textMuted, border: C.borderMuted },
    danger: { bg: 'transparent', fg: C.danger, border: hexA(C.danger, 0.5) },
    success: { bg: C.success, fg: '#003825', border: C.success },
    disabled: { bg: '#2a2733', fg: C.textFaint, border: '#2a2733' },
  };
  const c = colors[v];
  const h = size === 'lg' ? 60 : size === 'sm' ? 38 : 50;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { height: h, backgroundColor: pressed && v === 'secondary' ? C.primaryDim : c.bg, borderColor: c.border, borderRadius: pill ? R.full : R.md },
        (v === 'primary' || v === 'light') && glow(C.primary, 18, 0.35),
        pressed && v !== 'secondary' && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        style,
      ]}>
      {(v === 'primary' || v === 'light') && <View style={[styles.btnEdge, pill && { display: 'none' }]} />}
      {icon && <Icon name={icon} color={c.fg} size={size === 'sm' ? 16 : 20} />}
      <Text style={[styles.btnText, { color: c.fg, fontSize: size === 'lg' ? 16 : size === 'sm' ? 12 : 14 }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

// ---------- Tag / chip ----------
export function Tag({ label, color = C.lavender, filled, style }: { label: string; color?: string; filled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        styles.tag,
        { borderColor: hexA(color, 0.45), backgroundColor: filled ? color : hexA(color, 0.1) },
        style,
      ]}>
      <Text style={[styles.tagText, { color: filled ? '#1a1033' : color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? { backgroundColor: C.lavender, borderColor: C.lavender } : { borderColor: C.textFaint }, active && glow(C.primary, 12, 0.35)]}>
      <Text style={[styles.chipText, { color: active ? '#2a1366' : C.text }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

// ---------- Progress ----------
export function ProgressBar({ value, height = 8, color, style }: { value: number; height?: number; color?: 'mana' | 'success'; style?: StyleProp<ViewStyle> }) {
  const pct = Math.max(0, Math.min(1, value));
  const grad: [string, string] = color === 'success' ? ['#0e9f6e', C.success] : [C.primary, C.lavender];
  return (
    <View style={[{ height, borderRadius: R.full, backgroundColor: '#221d30', overflow: 'visible' }, style]}>
      {pct > 0 && (
        <View style={{ width: `${pct * 100}%`, height: '100%' }}>
          <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: R.full }} />
          <View
            style={{
              position: 'absolute',
              right: -1,
              top: -2,
              width: 4,
              height: height + 4,
              borderRadius: 2,
              backgroundColor: '#fff',
              ...glow(color === 'success' ? C.success : C.lavender, 8, 0.9),
            }}
          />
        </View>
      )}
    </View>
  );
}

// ---------- Input ----------
export function Field({
  label,
  error,
  style,
  mono = true,
  ...rest
}: TextInputProps & { label: string; error?: string; mono?: boolean }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <View style={[{ marginTop: 10 }, style]}>
      <View
        style={[
          styles.field,
          focus && { borderColor: C.lavender, ...glow(C.lavender, 10, 0.25) },
          error ? { borderColor: C.danger, backgroundColor: '#1d0d12' } : null,
        ]}>
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocus(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={C.textFaint}
          style={[styles.fieldInput, { fontFamily: mono ? F.mono : F.body }]}
        />
      </View>
      <View style={styles.fieldLabelWrap} pointerEvents="none">
        <Text style={[styles.fieldLabel, error ? { color: C.danger } : focus ? { color: C.lavender } : null]}>{label.toUpperCase()}</Text>
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Icon name="alert-outline" size={14} color={C.danger} />
          <Text style={{ color: C.danger, fontFamily: F.body, fontSize: 12 }}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---------- Stepper angka ----------
export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
  decimals?: number;
}) {
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => setText(String(Number(value.toFixed(decimals)))), [value, decimals]);
  return (
    <View style={styles.stepper}>
      <Label>{label}</Label>
      <TextInput
          value={text}
          onChangeText={setText}
          onEndEditing={() => {
            const n = parseFloat(text.replace(',', '.'));
            if (!isNaN(n)) onChange(Math.max(min, n));
            else setText(String(value));
          }}
          onBlur={() => {
            const n = parseFloat(text.replace(',', '.'));
            if (!isNaN(n)) onChange(Math.max(min, n));
          }}
          keyboardType="decimal-pad"
          selectTextOnFocus
          style={styles.stepInput}
        />
      <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch' }}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, Number((value - step).toFixed(2))))}>
          <Icon name="minus" color={C.lavender} size={20} />
        </Pressable>
        <Pressable style={styles.stepBtn} onPress={() => onChange(Number((value + step).toFixed(2)))}>
          <Icon name="plus" color={C.lavender} size={20} />
        </Pressable>
      </View>
      {suffix ? <Label style={{ marginTop: 6, textAlign: 'center' }}>{suffix}</Label> : null}
    </View>
  );
}

// ---------- Avatar ----------
export function Avatar({ uri, name, size = 48, badge }: { uri?: string; name?: string; size?: number; badge?: string }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: C.lavender,
            backgroundColor: '#221a3a',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          },
          glow(C.primary, 14, 0.45),
        ]}>
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text style={{ fontFamily: F.display, color: C.lavender, fontSize: size * 0.38 }}>{(name || '?').slice(0, 1).toUpperCase()}</Text>
        )}
      </View>
      {badge ? (
        <View style={styles.avatarBadge}>
          <Text style={{ fontFamily: F.monoBold, fontSize: 9, color: '#1a1033' }}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---------- Bottom sheet ----------
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + S.lg }]}>
        <View style={styles.maxW}>
          <View style={styles.sheetHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: S.md }}>
            <H2 style={{ flex: 1 }}>{title}</H2>
            <IconButton name="close" onPress={onClose} color={C.textDim} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export const styles = StyleSheet.create({
  maxW: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  topBar: { borderBottomWidth: 1, borderBottomColor: '#221e2e', backgroundColor: 'rgba(10,8,18,0.85)' },
  topBarInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.margin - 4, height: 60 },
  topTitle: { fontFamily: F.headline, color: C.lavenderSoft, fontSize: 17, letterSpacing: 0.8 },
  card: { borderWidth: 1, borderRadius: R.lg, padding: S.md + 4, overflow: 'hidden' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: S.xl, marginBottom: S.md },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, paddingHorizontal: S.md, overflow: 'hidden' },
  btnEdge: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: 'rgba(255,255,255,0.55)' },
  btnText: { fontFamily: F.title, letterSpacing: 1.6 },
  tag: { borderWidth: 1, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  tagText: { fontFamily: F.monoBold, fontSize: 11, letterSpacing: 1 },
  chip: { borderWidth: 1, borderRadius: R.full, paddingHorizontal: 18, height: 38, justifyContent: 'center' },
  chipText: { fontFamily: F.title, fontSize: 12, letterSpacing: 1.4 },
  field: { borderWidth: 1, borderColor: '#3a3448', borderRadius: R.md, backgroundColor: C.surfaceInput, marginTop: 8 },
  fieldInput: { color: C.text, fontSize: 16, paddingHorizontal: 14, height: 50, outlineWidth: 0 } as TextStyle,
  fieldLabelWrap: { position: 'absolute', left: 12, top: 0 },
  fieldLabel: { fontFamily: F.label, fontSize: 11, letterSpacing: 1.6, color: C.textDim, backgroundColor: C.surface, paddingHorizontal: 6 },
  stepper: { flex: 1, backgroundColor: C.surfaceInput, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, padding: 12, alignItems: 'center' },
  stepBtn: { flex: 1, height: 40, borderRadius: R.md, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  stepInput: { alignSelf: 'stretch', minWidth: 0, height: 46, marginVertical: 6, textAlign: 'center', color: C.text, fontFamily: F.monoBold, fontSize: 26, outlineWidth: 0 } as TextStyle,
  avatarBadge: { position: 'absolute', right: -2, bottom: -2, backgroundColor: C.lavender, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(5,3,10,0.7)' },
  sheet: {
    backgroundColor: '#140f20',
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: S.margin,
    paddingTop: S.sm,
    maxHeight: '90%',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.textFaint, alignSelf: 'center', marginBottom: S.md },
});
