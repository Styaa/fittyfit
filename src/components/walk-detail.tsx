import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fmtClock } from '@/store/dates';
import { WALK_AGI_PER_KM } from '@/store/logic';
import type { WalkLog } from '@/store/types';
import { C, F } from '@/theme';
import { fmtPaceSec, splitsFromRoute, unpackRoute } from '@/walk/route';

import { RouteView, SplitsList } from './route-view';
import { Label } from './ui';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function fmtWalkDate(iso: string, withDay = true) {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
  return `${withDay ? DAYS[d.getDay()] + ', ' : ''}${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${time}`;
}

export const walkPace = (w: Pick<WalkLog, 'distanceM' | 'durationSec'>) => (w.distanceM > 0 ? w.durationSec / (w.distanceM / 1000) : Infinity);

/** Rute + statistik + split per km untuk satu sesi jalan */
export function WalkDetail({ walk }: { walk: WalkLog }) {
  const startedAt = new Date(walk.startedAt).getTime();
  const points = useMemo(() => unpackRoute(walk.route, startedAt), [walk.route, startedAt]);
  const splits = useMemo(() => splitsFromRoute(points), [points]);
  const km = walk.distanceM / 1000;
  return (
    <View>
      <RouteView points={points} height={300} />
      <View style={styles.grid}>
        <Stat label="Jarak" value={`${km.toFixed(2).replace('.', ',')} km`} big />
        <Stat label="Pace rata-rata" value={`${fmtPaceSec(walkPace(walk))} /km`} big />
        <Stat label="Waktu bergerak" value={fmtClock(walk.durationSec)} />
        <Stat label="AGI didapat" value={`+${(km * WALK_AGI_PER_KM).toFixed(1).replace('.', ',')} poin`} accent />
      </View>
      {splits.length > 0 ? (
        <>
          <Label color={C.lavender} style={{ marginTop: 22, marginBottom: 10 }}>
            Split per km
          </Label>
          <SplitsList splits={splits} />
        </>
      ) : walk.route ? null : (
        <Text style={styles.note}>Sesi ini direkam sebelum fitur rute ada, jadi rute & split tidak tersedia.</Text>
      )}
    </View>
  );
}

function Stat({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Label>{label}</Label>
      <Text style={[styles.statVal, big && { fontSize: 22 }, accent && { color: C.success }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  stat: { flexBasis: '47%', flexGrow: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, gap: 6 },
  statVal: { fontFamily: F.monoBold, color: C.text, fontSize: 18 },
  note: { fontFamily: F.body, color: C.textFaint, fontSize: 12, marginTop: 14 },
});
