import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Line, Path, Polygon, Stop, Text as SvgText } from 'react-native-svg';

import { C, F } from '@/theme';

// ---------- Radar atribut ----------
export function Radar({ data, size = 240, max }: { data: { label: string; value: number }[]; size?: number; max?: number }) {
  const n = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const top = max ?? Math.max(20, ...data.map((d) => d.value)) * 1.1;
  const pt = (i: number, f: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * r * f, cy + Math.sin(a) * r * f];
  };
  const ring = (f: number) => data.map((_, i) => pt(i, f).join(',')).join(' ');
  const shape = data.map((d, i) => pt(i, Math.max(0.08, d.value / top)).join(',')).join(' ');
  return (
    <Svg width={size} height={size}>
      {[1, 0.66, 0.33].map((f) => (
        <Polygon key={f} points={ring(f)} fill="none" stroke="#3a3350" strokeWidth={1} />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#2a2440" strokeWidth={1} />;
      })}
      <Polygon points={shape} fill="rgba(139,92,246,0.35)" stroke={C.primary} strokeWidth={2.5} strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = pt(i, Math.max(0.08, d.value / top));
        return <Circle key={'p' + i} cx={x} cy={y} r={4.5} fill={C.lavender} />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.28);
        return (
          <SvgText key={'l' + i} x={x} y={y + 4} fill={C.textDim} fontSize={11} fontFamily={F.mono} textAnchor="middle">
            {d.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ---------- Ring timer ----------
export function Ring({
  size = 260,
  progress,
  stroke = 8,
  children,
  color = C.lavender,
}: {
  size?: number;
  progress: number;
  stroke?: number;
  children?: React.ReactNode;
  color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const c = size / 2;
  const p = Math.max(0, Math.min(0.9999, progress));
  // busur dari jam 12 searah jarum jam (tanpa transform/rotation agar aman di web)
  const ang = p * 2 * Math.PI;
  const ex = c + r * Math.sin(ang);
  const ey = c - r * Math.cos(ang);
  const arc = `M ${c} ${c - r} A ${r} ${r} 0 ${p > 0.5 ? 1 : 0} 1 ${ex} ${ey}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} />
            <Stop offset="1" stopColor={C.primary} />
          </LinearGradient>
        </Defs>
        <Circle cx={c} cy={c} r={r} stroke="#211c2e" strokeWidth={stroke} fill="rgba(20,16,32,0.6)" />
        {p > 0.001 && <Path d={arc} stroke="url(#rg)" strokeWidth={stroke} strokeLinecap="round" fill="none" />}
      </Svg>
      {children}
    </View>
  );
}

// ---------- Line chart (berat badan) ----------
export function LineChart({ points, height = 200, labels }: { points: number[]; height?: number; labels: string[] }) {
  const [w, setW] = React.useState(0);
  if (points.length === 0)
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.textDim, fontFamily: F.body }}>Belum ada data berat badan.</Text>
      </View>
    );
  const pad = 16;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xs = (i: number) => (points.length === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (points.length - 1));
  const ys = (v: number) => height - 28 - ((v - min) / span) * (height - 64);
  // kurva halus (catmull-rom → bezier)
  let d = '';
  points.forEach((v, i) => {
    const x = xs(i);
    const y = ys(v);
    if (i === 0) d = `M${x},${y}`;
    else {
      const x0 = xs(i - 1);
      const y0 = ys(points[i - 1]);
      const cx = (x0 + x) / 2;
      d += ` C${cx},${y0} ${cx},${y} ${x},${y}`;
    }
  });
  const area = `${d} L${xs(points.length - 1)},${height} L${xs(0)},${height} Z`;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: height + 24 }}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Defs>
            <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.primary} stopOpacity={0.35} />
              <Stop offset="1" stopColor={C.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#area)" />
          <Path d={d} stroke={C.lavender} strokeWidth={4} fill="none" strokeLinecap="round" />
          {points.map((v, i) => (
            <G key={i}>
              <Circle cx={xs(i)} cy={ys(v)} r={6} fill={C.surface} stroke={C.lavender} strokeWidth={2} />
              <SvgText x={xs(i)} y={ys(v) - 12} fill={C.textDim} fontSize={10} fontFamily={F.mono} textAnchor="middle">
                {v.toFixed(1)}
              </SvgText>
            </G>
          ))}
        </Svg>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 6 }}>
        {labels
          .filter((_, i) => labels.length <= 4 || i === 0 || i === labels.length - 1 || i === Math.floor((labels.length - 1) / 2))
          .map((l, i) => (
            <Text key={i} style={{ color: C.textDim, fontFamily: F.mono, fontSize: 10 }}>
              {l}
            </Text>
          ))}
      </View>
    </View>
  );
}
