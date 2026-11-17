// Shadow Fit design tokens — sumber: DESIGN.md
export const C = {
  void: '#0A0812',
  bg: '#12131b',
  surface: '#15111F',
  surfaceHigh: '#1e1a2b',
  surfaceInput: '#0d0b14',
  border: 'rgba(139, 92, 246, 0.2)',
  borderStrong: 'rgba(139, 92, 246, 0.45)',
  borderMuted: '#2a2535',
  primary: '#8B5CF6',
  primaryDim: 'rgba(139, 92, 246, 0.12)',
  lavender: '#C4B5FD',
  lavenderSoft: '#d0bcff',
  success: '#34D399',
  successDim: 'rgba(52, 211, 153, 0.12)',
  danger: '#F87171',
  dangerDim: 'rgba(248, 113, 113, 0.12)',
  gold: '#FBBF24',
  text: '#e3e1ed',
  textMuted: '#cbc3d7',
  textDim: '#958ea0',
  textFaint: '#5d5770',
  white: '#ffffff',
};

export const F = {
  display: 'Chivo_900Black',
  headline: 'Chivo_800ExtraBold',
  title: 'Chivo_700Bold',
  label: 'Chivo_600SemiBold',
  body: 'Manrope_400Regular',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
};

export const S = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, margin: 20, gutter: 12 };
export const R = { sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, full: 9999 };

export const glow = (color = C.primary, radius = 12, alpha = 0.3) => ({
  boxShadow: `0px 0px ${radius}px ${hexA(color, alpha)}`,
});

export function hexA(hex: string, alpha: number) {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const RARITY: Record<string, string> = {
  COMMON: C.textDim,
  RARE: '#60A5FA',
  EPIC: C.danger,
  LEGENDARY: C.lavender,
};

export const RANK_COLOR: Record<string, string> = {
  E: C.textMuted,
  D: C.lavender,
  C: C.lavender,
  B: '#60A5FA',
  A: C.success,
  S: C.danger,
};
