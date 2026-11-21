import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Pattern, Polygon, Polyline, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { C, F } from '@/theme';
import { fmtPaceSec, kmMarkers, makeProjector, type RoutePoint, type Split } from '@/walk/route';

import { Icon, Label, Mono } from './ui';

let uidCounter = 0;

/**
 * Gambar rute bergaya Shadow Fit (tanpa peta): garis ungu bercahaya di atas latar heksagon,
 * titik mulai hijau, bendera selesai, penanda tiap km dan panah arah.
 */
export function RouteView({ points, height = 260, mini = false, live = false }: { points: RoutePoint[]; height?: number; mini?: boolean; live?: boolean }) {
  const [width, setWidth] = useState(0);
  const [id] = useState(() => `rv${++uidCounter}`);
  const pad = mini ? 8 : 34;

  const drawn = useMemo(() => {
    if (width === 0 || points.length < 2) return null;
    const proj = makeProjector(points, width, height, pad);
    // satu polyline per segmen (jeda memutus garis)
    const segs: [number, number][][] = [];
    let cur: [number, number][] = [];
    points.forEach((p, i) => {
      if (i > 0 && p.seg !== points[i - 1].seg) {
        if (cur.length) segs.push(cur);
        cur = [];
      }
      cur.push(proj(p));
    });
    if (cur.length) segs.push(cur);
    const start = proj(points[0]);
    const end = proj(points[points.length - 1]);
    const markers = mini ? [] : kmMarkers(points).map((m) => ({ km: m.km, xy: proj(m) }));
    // panah arah ±6 di sepanjang rute
    const arrows: { x: number; y: number; deg: number }[] = [];
    if (!mini && points.length > 10) {
      const n = Math.min(6, Math.floor(points.length / 8));
      for (let k = 1; k <= n; k++) {
        const i = Math.floor((points.length * k) / (n + 1));
        const a = points[Math.max(0, i - 2)];
        const b = points[Math.min(points.length - 1, i + 2)];
        if (a.seg !== b.seg) continue;
        const [x1, y1] = proj(a);
        const [x2, y2] = proj(b);
        if (Math.hypot(x2 - x1, y2 - y1) < 2) continue;
        arrows.push({ x: (x1 + x2) / 2, y: (y1 + y2) / 2, deg: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI });
      }
    }
    return { segs, start, end, markers, arrows };
  }, [points, width, height, pad, mini]);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[styles.box, { height }, mini && styles.mini]}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <Pattern id={`${id}h`} width={22} height={38} patternUnits="userSpaceOnUse">
              <Path d="M11 0 L22 6.3 L22 19 L11 25.3 L0 19 L0 6.3 Z M11 25.3 L11 38" stroke={C.primary} strokeOpacity={0.08} strokeWidth={1} fill="none" />
            </Pattern>
            <RadialGradient id={`${id}g`} cx="50%" cy="45%" r="70%">
              <Stop offset="0" stopColor="#2a1d4d" stopOpacity={0.7} />
              <Stop offset="1" stopColor="#0A0812" stopOpacity={0} />
            </RadialGradient>
            {drawn && (
              <LinearGradient id={`${id}l`} gradientUnits="userSpaceOnUse" x1={drawn.start[0]} y1={drawn.start[1]} x2={drawn.end[0]} y2={drawn.end[1]}>
                <Stop offset="0" stopColor={C.lavender} />
                <Stop offset="1" stopColor={C.primary} />
              </LinearGradient>
            )}
          </Defs>
          <Rect width={width} height={height} fill="#0A0812" />
          <Rect width={width} height={height} fill={`url(#${id}g)`} />
          {!mini && <Rect width={width} height={height} fill={`url(#${id}h)`} />}
          {drawn &&
            drawn.segs.map((s, i) => {
              const pts = s.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
              return (
                <G key={i}>
                  <Polyline points={pts} fill="none" stroke={C.primary} strokeOpacity={0.28} strokeWidth={mini ? 6 : 12} strokeLinejoin="round" strokeLinecap="round" />
                  <Polyline points={pts} fill="none" stroke={`url(#${id}l)`} strokeWidth={mini ? 2.4 : 4} strokeLinejoin="round" strokeLinecap="round" />
                </G>
              );
            })}
          {drawn?.arrows.map((a, i) => (
            <G key={`a${i}`} transform={`translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${a.deg.toFixed(0)})`}>
              <Polygon points="-4,-4 5,0 -4,4" fill="#ffffff" opacity={0.9} />
            </G>
          ))}
          {drawn?.markers.map((m) => (
            <G key={`k${m.km}`}>
              <Circle cx={m.xy[0]} cy={m.xy[1]} r={10} fill="#120e1f" stroke={C.lavender} strokeWidth={1.5} />
              <SvgText x={m.xy[0]} y={m.xy[1] + 3.5} fill={C.lavender} fontSize={10} fontFamily={F.monoBold} textAnchor="middle">
                {m.km}
              </SvgText>
            </G>
          ))}
          {drawn && (
            <>
              <Circle cx={drawn.start[0]} cy={drawn.start[1]} r={mini ? 3.5 : 7} fill={C.success} stroke="#ffffff" strokeWidth={mini ? 1 : 2} />
              {mini ? (
                <Circle cx={drawn.end[0]} cy={drawn.end[1]} r={3.5} fill={C.lavender} stroke="#ffffff" strokeWidth={1} />
              ) : (
                <G transform={`translate(${drawn.end[0].toFixed(1)} ${drawn.end[1].toFixed(1)})`}>
                  <Circle r={7} fill={C.primary} stroke="#ffffff" strokeWidth={2} />
                  <Path d="M0 -6 L0 -24" stroke="#ffffff" strokeWidth={2} />
                  <Path d="M0 -24 L12 -19.5 L0 -15 Z" fill={C.lavender} />
                </G>
              )}
            </>
          )}
        </Svg>
      )}
      {width > 0 && !drawn && (
        <View style={[StyleSheet.absoluteFill, styles.empty]}>
          {!mini && <Icon name="map-marker-path" size={28} color={C.textFaint} />}
          {!mini && <Text style={styles.emptyText}>Rute tidak tersedia untuk sesi ini</Text>}
        </View>
      )}
      {!mini && drawn && (
        <View style={styles.legend} pointerEvents="none">
          <View style={[styles.legendDot, { backgroundColor: C.success }]} />
          <Text style={styles.legendText}>Mulai</Text>
          <View style={[styles.legendDot, { backgroundColor: C.primary, marginLeft: 10 }]} />
          <Text style={styles.legendText}>{live ? 'Sekarang' : 'Selesai'}</Text>
        </View>
      )}
    </View>
  );
}

/** Daftar split per km — batang makin panjang = makin cepat, split tercepat disorot */
export function SplitsList({ splits }: { splits: Split[] }) {
  if (splits.length === 0) return null;
  const full = splits.filter((s) => !s.partial);
  const fastest = full.length ? Math.min(...full.map((s) => s.pace)) : Math.min(...splits.map((s) => s.pace));
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.splitHead}>
        <Label style={{ width: 54 }}>KM</Label>
        <Label style={{ flex: 1 }}>Pace</Label>
        <Label>Waktu</Label>
      </View>
      {splits.map((s) => {
        const best = !s.partial && s.pace === fastest && full.length > 1;
        const ratio = Math.max(0.15, Math.min(1, fastest / s.pace));
        return (
          <View key={s.km} style={styles.splitRow}>
            <Text style={[styles.splitKm, best && { color: C.success }]}>{s.partial ? `${(s.distanceM / 1000).toFixed(2).replace('.', ',')}` : s.km}</Text>
            <View style={styles.splitTrack}>
              <View style={[styles.splitBar, { width: `${ratio * 100}%`, backgroundColor: best ? C.success : C.primary }]} />
              <Text style={styles.splitPace}>{fmtPaceSec(s.pace)} /km</Text>
            </View>
            <Mono size={12} color={best ? C.success : C.textMuted} style={{ width: 58, textAlign: 'right' }}>
              {fmtPaceSec(s.seconds)}
            </Mono>
          </View>
        );
      })}
      {full.length > 1 && (
        <Text style={styles.splitNote}>
          <Text style={{ color: C.success }}>■</Text> split tercepat · waktu jeda tidak dihitung
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)', overflow: 'hidden', backgroundColor: '#0A0812' },
  mini: { borderRadius: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyText: { fontFamily: F.body, color: C.textFaint, fontSize: 12 },
  legend: { position: 'absolute', left: 10, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: F.mono, color: C.textDim, fontSize: 10 },
  splitHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  splitKm: { width: 46, fontFamily: F.monoBold, color: C.text, fontSize: 14, textAlign: 'center' },
  splitTrack: { flex: 1, height: 26, borderRadius: 6, backgroundColor: '#1a1626', overflow: 'hidden', justifyContent: 'center' },
  splitBar: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.55, borderRadius: 6 },
  splitPace: { fontFamily: F.monoBold, color: '#ffffff', fontSize: 12, marginLeft: 10 },
  splitNote: { fontFamily: F.body, color: C.textFaint, fontSize: 11, marginTop: 2 },
});
