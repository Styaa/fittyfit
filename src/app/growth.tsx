import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LineChart } from '@/components/charts';
import { Body, Button, Card, Icon, IconButton, IconName, Label, Mono, Screen, Sheet, Stepper, TopBar } from '@/components/ui';
import { addDays, dayKey, fmtShortDate } from '@/store/dates';
import { fmtBig, fromUnit, longestStreak, prsBrokenSince, sessionTut, sessionVolume, toUnit } from '@/store/logic';
import { useStore } from '@/store/store';
import { C, F, hexA } from '@/theme';

async function persistPhoto(uri: string, base64?: string | null): Promise<string> {
  if (Platform.OS === 'web') return base64 ? `data:image/jpeg;base64,${base64}` : uri;
  try {
    const src = new File(uri);
    const dest = new File(Paths.document, `photo-${Date.now()}.jpg`);
    src.copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}

export default function GrowthScreen() {
  const { state, actions } = useStore();
  const unit = state.settings.unit;
  const [weighOpen, setWeighOpen] = useState(false);
  const [weight, setWeight] = useState(toUnit(state.profile?.weightKg ?? 70, unit));
  const [viewer, setViewer] = useState<string | null>(null);

  const recent = state.weights.slice(-8);
  const points = recent.map((w) => toUnit(w.kg, unit));
  const labels = recent.map((w) => fmtShortDate(w.date));
  const totalVolume = state.sessions.reduce((a, s) => a + sessionVolume(s), 0);
  const tut = state.sessions.reduce((a, s) => a + sessionTut(s), 0);
  const prCycle = prsBrokenSince(state.sessions, addDays(new Date(), -28).toISOString());
  const photos = [...state.photos].sort((a, b) => a.date.localeCompare(b.date));
  const viewing = photos.find((p) => p.id === viewer);

  const addPhoto = async (camera: boolean) => {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [3, 4], base64: Platform.OS === 'web' };
    if (camera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
    }
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    actions.addPhoto(await persistPhoto(a.uri, a.base64));
  };

  const tiles: { icon: IconName; value: string; title: string; sub: string; accent?: boolean }[] = [
    { icon: 'fire', value: `${longestStreak(state)}d`, title: 'Streak', sub: 'Longest' },
    { icon: 'dumbbell', value: fmtBig(toUnit(totalVolume, unit)), title: 'Volume', sub: `Total ${unit}` },
    { icon: 'clock-outline', value: `${Math.floor(tut / 3600)}h ${Math.floor((tut % 3600) / 60)}m`, title: 'Focus', sub: 'Time under tension' },
    { icon: 'trophy-outline', value: String(prCycle), title: 'PRs', sub: 'Broken this cycle', accent: true },
  ];

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="chevron-left" onPress={() => router.back()} />} title="Shadow Fit" />}>
      <Text style={styles.h1}>YOUR GROWTH</Text>
      <Body size={17}>Pelacakan status dan progres fisikmu.</Body>

      <Card style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Label color={C.lavender}>Bodyweight trend ({unit})</Label>
          <Pressable onPress={() => setWeighOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="plus-circle-outline" size={18} color={C.success} />
            <Label color={C.success}>Log</Label>
          </Pressable>
        </View>
        <View style={styles.chartBox}>
          <LineChart points={points} labels={labels} height={190} />
        </View>
      </Card>

      <View style={styles.tiles}>
        {tiles.map((t) => (
          <Card key={t.title} tone={t.accent ? 'success' : 'default'} style={styles.tile}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Icon name={t.icon} size={26} color={t.accent ? C.success : C.lavender} />
              <Mono color={t.accent ? C.success : C.text} size={16}>
                {t.value}
              </Mono>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={[styles.tileTitle, t.accent && { color: C.success }]}>{t.title}</Text>
            <Label color={t.accent ? C.success : C.textDim}>{t.sub}</Label>
          </Card>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 14 }}>
        <Label color={C.lavender}>Progress log</Label>
        <View style={{ flex: 1, height: 1, backgroundColor: C.borderMuted }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {photos.map((p, i) => {
          const latest = i === photos.length - 1;
          return (
            <Pressable key={p.id} onPress={() => setViewer(p.id)} style={[styles.photo, latest && { borderColor: C.lavender }]}>
              <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={styles.photoShade} />
              <View style={{ position: 'absolute', left: 10, bottom: 8 }}>
                <Text style={styles.photoLabel}>{fmtShortDate(p.date)}</Text>
                {latest && <Label color={C.text}>Latest</Label>}
              </View>
            </Pressable>
          );
        })}
        <Pressable onPress={() => addPhoto(false)} style={[styles.photo, styles.addPhoto]}>
          <Icon name="image-plus" size={28} color={C.textDim} />
          <Label style={{ marginTop: 8 }}>Galeri</Label>
        </Pressable>
        {Platform.OS !== 'web' && (
          <Pressable onPress={() => addPhoto(true)} style={[styles.photo, styles.addPhoto]}>
            <Icon name="camera-outline" size={28} color={C.textDim} />
            <Label style={{ marginTop: 8 }}>Kamera</Label>
          </Pressable>
        )}
      </ScrollView>

      {state.weights.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 14 }}>
            <Label color={C.lavender}>Weight log</Label>
            <View style={{ flex: 1, height: 1, backgroundColor: C.borderMuted }} />
          </View>
          <View style={{ gap: 8 }}>
            {[...state.weights].reverse().slice(0, 10).map((w) => (
              <View key={w.date} style={styles.wRow}>
                <Mono style={{ flex: 1 }}>{fmtShortDate(w.date)}</Mono>
                <Mono color={C.text}>
                  {toUnit(w.kg, unit).toFixed(1)} {unit}
                </Mono>
                <IconButton name="trash-can-outline" size={18} color={C.textFaint} onPress={() => actions.deleteWeight(w.date)} />
              </View>
            ))}
          </View>
        </>
      )}

      <Sheet visible={weighOpen} onClose={() => setWeighOpen(false)} title="Log Bodyweight">
        <Stepper label={`Berat (${unit})`} value={weight} onChange={setWeight} step={0.1} decimals={1} />
        <Button
          label="Save"
          icon="check"
          size="lg"
          style={{ marginTop: 20 }}
          onPress={() => {
            actions.logWeight(Math.round(fromUnit(weight, unit) * 10) / 10, dayKey());
            setWeighOpen(false);
          }}
        />
      </Sheet>

      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <View style={styles.viewer}>
          {viewing && <Image source={{ uri: viewing.uri }} style={{ flex: 1 }} contentFit="contain" />}
          <View style={styles.viewerBar}>
            <Button
              label="Hapus"
              icon="trash-can-outline"
              variant="danger"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => {
                if (viewing) actions.deletePhoto(viewing.id);
                setViewer(null);
              }}
            />
            <Button label="Tutup" variant="ghost" size="sm" style={{ flex: 1 }} onPress={() => setViewer(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: F.headline, color: C.text, fontSize: 32, letterSpacing: 1, marginTop: 8, marginBottom: 6 },
  chartBox: { borderRadius: 10, backgroundColor: '#1d1829', padding: 8, paddingTop: 20 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  tile: { width: '48%', flexGrow: 1, minHeight: 150 },
  tileTitle: { fontFamily: F.monoBold, color: C.text, fontSize: 24, marginBottom: 2 },
  photo: { width: 130, height: 170, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  photoShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,8,18,0.25)' },
  photoLabel: { fontFamily: F.monoBold, color: C.text, fontSize: 16 },
  addPhoto: { alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderColor: '#3a3448', backgroundColor: 'transparent' },
  wRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, borderRadius: 8, paddingLeft: 16, paddingRight: 6, height: 48 },
  viewer: { flex: 1, backgroundColor: hexA('#000000', 0.95), paddingTop: 50 },
  viewerBar: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 40 },
});
