// Design tokens lifted from the Claude Design handoff (project/OndeApp.dc.html).

export const C = {
  bg: '#0B0B12',
  surface: '#15151F',
  surface2: '#1D1D29',
  track: '#2A2A3A',
  trackMuted: '#262634',
  offTrack: '#3A3A4D',
  text: '#FFFFFF',
  textSoft: '#E6E6F0',
  textDim: '#D6D6E2',
  muted: '#A1A1B5',
  faint: '#8A8AA0',
  chev: '#6E6E85',
  tabIdle: '#77778C',
  locked: '#4A4A5E',
  levelOff: '#33334A',
  violet: '#8B5CF6',
  violetLight: '#A78BFA',
  lavender: '#C4B5FD',
  lavender2: '#B197FC',
  lilac: '#DDD3FF',
  lilacSoft: '#EDE7FF',
  iconTint: '#E4DCFF',
  orchid: '#C45CC8',
  pink: '#EC4899',
  pinkSoft: '#F9A8D4',
  fuchsia: '#F0ABFC',
  green: '#4ADE80',
  red: '#F87171',
  redSoft: '#FCA5A5',
  redInk: '#1F0A0A',
  chipActive: '#F2EEFF',
  chipActiveInk: '#1A1030',
  chipIdleInk: '#C9C9D6',
  hairline: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  border2: 'rgba(255,255,255,0.1)',
};

/** linear-gradient(135deg, #8B5CF6, #9B5DF2 55%, #C45CC8) */
export const PRIMARY_GRADIENT = {
  colors: ['#8B5CF6', '#9B5DF2', '#C45CC8'] as const,
  locations: [0, 0.55, 1] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/** linear-gradient(90deg, #8B5CF6, #C084FC) — slider fill */
export const SLIDER_GRADIENT = ['#8B5CF6', '#C084FC'] as const;

export const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

/** CSS `em` letter-spacing → React Native points. */
export const em = (v: number, size: number) => v * size;
