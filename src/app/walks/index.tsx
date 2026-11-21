import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RouteView } from '@/components/route-view';
import { Body, Button, Card, Icon, IconButton, Label, Mono, Screen, TopBar } from '@/components/ui';
import { fmtWalkDate, walkPace } from '@/components/walk-detail';
import { fmtClock } from '@/store/dates';
import { WALK_AGI_PER_KM } from '@/store/logic';
import { useStore } from '@/store/store';
import { C, F } from '@/theme';
import { fmtPaceSec, unpackRoute } from '@/walk/route';

export default function WalkHistory() {
  const { state } = useStore();
  const walks = useMemo(() => [...(state.walks ?? [])].sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [state.walks]);
  const totalKm = walks.reduce((a, w) => a + w.distanceM, 0) / 1000;
  const totalSec = walks.reduce((a, w) => a + w.durationSec, 0);
  const longest = walks.reduce((m, w) => Math.max(m, w.distanceM), 0) / 1000;
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="chevron-left" onPress={leave} />} title="Riwayat Jalan" />}>
      <View style={styles.totals}>
        <Total label="Total jarak" value={`${totalKm.toFixed(1).replace('.', ',')} km`} />
        <Total label="Sesi" value={String(walks.length)} />
        <Total label="Terjauh" value={`${longest.toFixed(1).replace('.', ',')} km`} />
      </View>
      <Mono size={12} color={C.textDim} style={{ textAlign: 'center', marginTop: 8 }}>
        waktu bergerak {fmtClock(totalSec)} · AGI dari jalan +{(totalKm * WALK_AGI_PER_KM).toFixed(1).replace('.', ',')} poin
      </Mono>

      {walks.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 10, marginTop: 24 }}>
          <Icon name="walk" size={36} color={C.textFaint} />
          <Body center>Belum ada sesi jalan. Terima quest jalan di Quest Board, lalu tekan Mulai Jalan.</Body>
          <Button label="Buka Quest Board" icon="sword-cross" variant="secondary" onPress={() => router.replace('/quests')} />
        </Card>
      ) : (
        <View style={{ gap: 10, marginTop: 20 }}>
          {walks.map((w) => (
            <Pressable
              key={w.id}
              onPress={() => router.push({ pathname: '/walks/[id]', params: { id: w.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Jalan ${(w.distanceM / 1000).toFixed(2)} km, ${fmtWalkDate(w.startedAt)}`}
              style={({ pressed }) => [styles.row, pressed && { borderColor: C.borderStrong, backgroundColor: '#1d1730' }]}>
              <View style={{ width: 96 }}>
                <RouteView points={unpackRoute(w.route, new Date(w.startedAt).getTime())} height={76} mini />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.km}>{(w.distanceM / 1000).toFixed(2).replace('.', ',')} km</Text>
                <Text style={styles.date} numberOfLines={1}>
                  {fmtWalkDate(w.startedAt)}
                </Text>
                <Mono size={12} color={C.textMuted} style={{ marginTop: 4 }}>
                  {fmtClock(w.durationSec)} · {fmtPaceSec(walkPace(w))} /km
                </Mono>
              </View>
              <Icon name="chevron-right" size={20} color={C.textFaint} />
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.total}>
      <Label>{label}</Label>
      <Text style={styles.totalVal} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  totals: { flexDirection: 'row', gap: 10, marginTop: 6 },
  total: { flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 6 },
  totalVal: { fontFamily: F.monoBold, color: C.lavender, fontSize: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 14, padding: 10 },
  km: { fontFamily: F.headline, color: C.text, fontSize: 20 },
  date: { fontFamily: F.body, color: C.textDim, fontSize: 12, marginTop: 2 },
});
