import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconDef = { d?: string[]; c?: [number, number, number][]; r?: [number, number, number, number, number][]; fill?: boolean; sw?: number };

const I = {
  home: { d: ['M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z'] },
  wave: { d: ['M2 12h2.5l2-5 3 10 3-14 3 16 2.5-9 1.5 2H22'] },
  sliders: { d: ['M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1'], c: [[15, 6, 2], [9, 12, 2], [17, 18, 2]] },
  activity: { d: ['M3 12h4l3-8 4 16 3-8h4'] },
  user: { d: ['M4.5 20.5c.6-3.6 3.8-5.5 7.5-5.5s6.9 1.9 7.5 5.5'], c: [[12, 8, 4]] },
  back: { d: ['M15 5l-7 7 7 7'] },
  chev: { d: ['M9 5l7 7-7 7'] },
  close: { d: ['M6 6l12 12M18 6 6 18'] },
  play: { d: ['M8 5.5v13a.6.6 0 0 0 .9.5l10.4-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5z'], fill: true },
  pause: { d: ['M8.5 5v14M15.5 5v14'], sw: 2.6 },
  plus: { d: ['M12 5v14M5 12h14'] },
  heart: { d: ['M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z'] },
  heartF: { d: ['M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z'], fill: true },
  lock: { d: ['M8.5 11V8a3.5 3.5 0 0 1 7 0v3'], r: [[5.5, 11, 13, 9.5, 2.5]] },
  shield: { d: ['M12 3l7.5 3v5.5c0 4.8-3.2 8-7.5 9.5-4.3-1.5-7.5-4.7-7.5-9.5V6z'] },
  bell: { d: ['M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0'] },
  check: { d: ['M5 12.5l4.5 4.5L19 7'] },
  info: { d: ['M12 11v5.5M12 7.8v.1'], c: [[12, 12, 9]] },
  alert: { d: ['M12 4 2.8 19.5h18.4zM12 10v4.5M12 17.2v.1'] },
  search: { d: ['M20 20l-4.3-4.3'], c: [[11, 11, 6.5]] },
  help: { d: ['M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.7.3-1.2.9-1.2 1.7v.4M12 16.8v.1'], c: [[12, 12, 9]] },
  doc: { d: ['M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5'] },
  trash: { d: ['M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13'] },
  download: { d: ['M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14'] },
  crown: { d: ['M4 8l4.5 4L12 5l3.5 7L20 8l-2 11H6z'] },
  moon: { d: ['M19.5 14.5A7.8 7.8 0 1 1 9.5 4.5a6.2 6.2 0 0 0 10 10z'] },
  globe: { d: ['M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18'], c: [[12, 12, 9]] },
  cloud: { d: ['M7 18.5h10a4 4 0 0 0 .6-8 6 6 0 0 0-11.4 1.7A3.4 3.4 0 0 0 7 18.5z'] },
  device: { d: ['M11 18h2'], r: [[7, 3, 10, 18, 2.5]] },
  chart: { d: ['M5 20V11M12 20V5M19 20v-6'] },
  clock: { d: ['M12 7.5V12l3 2'], c: [[12, 12, 9]] },
  mail: { d: ['M3.5 7l8.5 6 8.5-6'], r: [[3, 5.5, 18, 13, 2.5]] },
  card: { d: ['M3 10h18'], r: [[3, 5.5, 18, 13, 2.5]] },
  waves: { d: ['M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0', 'M3 12.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0', 'M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0'] },
  leaf: { d: ['M5 19C5 11 11 5 19 5c0 8-6 14-14 14zM5 19l7-7'] },
  target: { c: [[12, 12, 8.5], [12, 12, 4.5], [12, 12, 0.8]] },
  breath: { c: [[12, 12, 3], [12, 12, 8]] },
  battery: { d: ['M20 10.5v3'], r: [[3, 7.5, 16, 9, 2.5]] },
  sound: { d: ['M4 9.5h3.5L12 6v12l-4.5-3.5H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11'] },
  eye: { d: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'], c: [[12, 12, 3]] },
  timer: { d: ['M12 13.5V10M10 3h4'], c: [[12, 13.5, 7.5]] },
  car: { d: ['M5 16v-4l2-5h10l2 5v4zM5 16v2.5M19 16v2.5M4 12h16'] },
  thermo: { d: ['M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0z'] },
  hand: { d: ['M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.6-2.5L3.8 14a1.5 1.5 0 0 1 2.4-1.8L8 14'] },
  pauseC: { d: ['M10 9v6M14 9v6'], c: [[12, 12, 9]] },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof I;

export function Icon({ name, size = 20, color = '#fff' }: { name: IconName; size?: number; color?: string }) {
  const s: IconDef = I[name];
  const fill = s.fill ? color : 'none';
  const stroke = s.fill ? 'none' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={s.sw ?? 1.7} strokeLinecap="round" strokeLinejoin="round">
      {(s.d ?? []).map((d, i) => <Path key={'p' + i} d={d} />)}
      {(s.c ?? []).map((c, i) => <Circle key={'c' + i} cx={c[0]} cy={c[1]} r={c[2]} />)}
      {(s.r ?? []).map((r, i) => <Rect key={'r' + i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx={r[4]} />)}
    </Svg>
  );
}
