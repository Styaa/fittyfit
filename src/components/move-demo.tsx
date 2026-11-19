import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { cycleLength, getMove, prepare, render, timeline, VB } from '@/anim/moves';
import { C, F } from '@/theme';

import { Icon } from './ui';

export const hasDemo = (name: string) => !!getMove(name);

/**
 * Animasi vektor contoh gerakan, mengikuti tempo latihan.
 * - `playing` (opsional): dikendalikan dari luar (mis. timer set) → tombol pause animasi disembunyikan.
 * - `resetKey`: setiap nilainya berubah, animasi diulang dari awal.
 * - `controls`: tampilkan tombol pause & 2× (hanya untuk lembar panduan).
 */
export function MoveDemo({
  name,
  tempo,
  height = 190,
  speed = 1,
  playing: playingProp,
  resetKey,
  controls = true,
}: {
  name: string;
  tempo?: string;
  height?: number;
  speed?: number;
  playing?: boolean;
  resetKey?: string | number;
  controls?: boolean;
}) {
  const move = getMove(name);
  const prep = useMemo(() => (move ? prepare(move) : null), [move]);
  const segs = useMemo(() => (move ? timeline(move, tempo) : []), [move, tempo]);
  const [time, setTime] = useState(0);
  const [playingLocal, setPlaying] = useState(true);
  const [fast, setFast] = useState(false);
  const last = useRef<number | null>(null);
  const external = playingProp !== undefined;
  const playing = external ? playingProp : playingLocal;
  const interactive = controls && !external;

  // ulang dari awal saat resetKey berubah (mis. set dimulai)
  useEffect(() => {
    setTime(0);
    last.current = null;
  }, [resetKey]);

  useEffect(() => {
    if (!prep || !playing) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (ts: number) => {
      if (last.current != null) {
        const dt = Math.min(0.1, (ts - last.current) / 1000);
        setTime((t) => t + dt * speed * (fast ? 2 : 1));
      }
      last.current = ts;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prep, playing, speed, fast]);

  if (!prep) return null;
  const { shapes, phase } = render(prep, segs, time);
  const total = cycleLength(segs);
  const progress = (time % total) / total;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={interactive ? () => setPlaying((p) => !p) : undefined} disabled={!interactive}>
        <Svg width="100%" height={height} viewBox={`0 0 ${VB.w} ${VB.h}`}>
          {shapes.map((s, i) => {
            if (s.k === 'line')
              return <Line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.c} strokeWidth={s.w} strokeLinecap="round" opacity={s.o ?? 1} />;
            if (s.k === 'circle')
              return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth={s.w ?? 0} opacity={s.o ?? 1} />;
            return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={2} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw ?? 0} opacity={s.o ?? 1} />;
          })}
        </Svg>
      </Pressable>
      <View style={styles.bar}>
        {interactive ? (
          <Pressable onPress={() => setPlaying((p) => !p)} hitSlop={10}>
            <Icon name={playing ? 'pause' : 'play'} size={18} color={C.lavender} />
          </Pressable>
        ) : !playing ? (
          <Icon name="pause" size={16} color={C.textDim} />
        ) : null}
        <Text style={[styles.phase, !playing && { color: C.textDim }]}>{!playing && external ? 'PAUSED' : phase || ' '}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        {interactive && (
          <Pressable onPress={() => setFast((f) => !f)} hitSlop={10}>
            <Text style={[styles.speed, fast && { color: C.lavender }]}>{fast ? '2×' : '1×'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: '#0A0812', overflow: 'hidden' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1d1829' },
  phase: { fontFamily: F.title, color: C.success, fontSize: 12, letterSpacing: 1.6, minWidth: 92 },
  track: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#2a2535', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.primary },
  speed: { fontFamily: F.monoBold, color: C.textDim, fontSize: 12 },
});
