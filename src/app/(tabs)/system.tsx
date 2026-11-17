import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Avatar, Body, Button, Card, Field, Icon, IconName, Label, Mono, Screen, Sheet, TopBar } from '@/components/ui';
import { fmtBig, levelInfo, sessionVolume, totalXp } from '@/store/logic';
import { useStore } from '@/store/store';
import { notificationsSupported, sendTestNotification } from '@/notify/notify';
import type { AppState, NotifSettings } from '@/store/types';
import { C, F } from '@/theme';

function ask(title: string, msg: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${msg}`)) onOk();
    return;
  }
  Alert.alert(title, msg, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Ya', style: 'destructive', onPress: onOk },
  ]);
}

const NOTIF_ROWS: { key: Exclude<keyof NotifSettings, 'enabled'>; icon: IconName; label: string; time: string }[] = [
  { key: 'briefing', icon: 'weather-sunset-up', label: 'Briefing harian', time: '07.30' },
  { key: 'workout', icon: 'sword-cross', label: 'Pengingat dungeon', time: '18.45 · 20.30' },
  { key: 'streak', icon: 'fire-alert', label: 'Streak terancam / reward', time: '21.30' },
  { key: 'penalty', icon: 'alert-octagon-outline', label: 'Penalty quest', time: '12.00 · 20.00' },
  { key: 'weekly', icon: 'calendar-week', label: 'Quest mingguan', time: 'Sab 19.00' },
  { key: 'weighIn', icon: 'scale-bathroom', label: 'Timbang & foto', time: 'Min 08.00' },
  { key: 'restTimer', icon: 'timer-outline', label: 'Rest timer selesai', time: 'real-time' },
];

function Row({ icon, label, value, onPress, right }: { icon: IconName; label: string; value?: string; onPress?: () => void; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(139,92,246,0.08)' }]}>
      <Icon name={icon} size={22} color={C.lavender} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Mono color={C.textDim}>{value}</Mono> : null}
      {right ?? (onPress ? <Icon name="chevron-right" size={20} color={C.textFaint} /> : null)}
    </Pressable>
  );
}

export default function SystemScreen() {
  const { state, actions } = useStore();
  const p = state.profile!;
  const [editOpen, setEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importErr, setImportErr] = useState('');
  const [form, setForm] = useState({ name: p.name, height: String(p.heightCm), age: String(p.age) });
  const lv = levelInfo(totalXp(state));
  const nf = state.settings.notif;
  const [testMsg, setTestMsg] = useState('');
  const totalVol = state.sessions.reduce((a, s) => a + sessionVolume(s), 0);

  const pickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: Platform.OS === 'web' });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    let uri = a.uri;
    if (Platform.OS === 'web' && a.base64) uri = `data:image/jpeg;base64,${a.base64}`;
    else if (Platform.OS !== 'web') {
      try {
        const dest = new File(Paths.document, `avatar-${Date.now()}.jpg`);
        new File(a.uri).copy(dest);
        uri = dest.uri;
      } catch {}
    }
    actions.patchProfile({ avatarUri: uri });
  };

  const exportData = async () => {
    const json = JSON.stringify(state);
    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shadowfit-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    await Share.share({ message: json, title: 'Shadow Fit backup' });
  };

  const doImport = () => {
    try {
      const data = JSON.parse(importText) as AppState;
      if (!data || typeof data !== 'object' || !Array.isArray(data.workouts) || !Array.isArray(data.sessions)) throw new Error('format');
      ask('Import data?', 'Semua data saat ini akan diganti dengan data backup.', () => {
        actions.importState(data);
        setImportOpen(false);
        setImportText('');
      });
    } catch {
      setImportErr('Format backup tidak valid');
    }
  };

  return (
    <Screen header={<TopBar title={<Text style={styles.brand}>SYSTEM</Text>} />}>
      {/* Profil */}
      <Card style={{ alignItems: 'center' }}>
        <Pressable onPress={pickAvatar}>
          <Avatar uri={p.avatarUri} name={p.name} size={96} />
          <View style={styles.camBadge}>
            <Icon name="camera-outline" size={16} color="#1a1033" />
          </View>
        </Pressable>
        <Text style={styles.name}>{p.name}</Text>
        <Mono color={C.lavender}>
          LV. {lv.level} · {state.sessions.length} DUNGEONS · {fmtBig(totalVol)} KG
        </Mono>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 14 }}>
          <Mono>{p.heightCm} cm</Mono>
          <Mono>{p.weightKg} kg</Mono>
          <Mono>{p.age} th</Mono>
        </View>
        <Button label="Edit Identity" variant="secondary" size="sm" icon="pencil-outline" onPress={() => setEditOpen(true)} style={{ marginTop: 16, alignSelf: 'stretch' }} />
      </Card>

      <Label style={{ marginTop: 28, marginBottom: 10 }}>Training</Label>
      <Card style={{ padding: 0 }} light={false}>
        <Row icon="playlist-edit" label="Program & Dungeons" value={`${state.workouts.length}`} onPress={() => router.push('/program')} />
        <Row icon="chart-line" label="Growth & Bodyweight" onPress={() => router.push('/growth')} />
      </Card>

      <Label style={{ marginTop: 28, marginBottom: 10 }}>Preferences</Label>
      <Card style={{ padding: 0 }} light={false}>
        <Row
          icon="weight-kilogram"
          label="Unit"
          right={
            <View style={styles.unitSeg}>
              {(['kg', 'lbs'] as const).map((u) => (
                <Pressable key={u} onPress={() => actions.patchSettings({ unit: u })} style={[styles.unitItem, state.settings.unit === u && { backgroundColor: C.primary }]}>
                  <Text style={[styles.unitText, state.settings.unit === u && { color: '#fff' }]}>{u.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
          }
        />
        <Row
          icon="vibrate"
          label="Haptics"
          right={<Switch value={state.settings.haptics} onValueChange={(v) => actions.patchSettings({ haptics: v })} trackColor={{ true: C.primary, false: '#3a3448' }} thumbColor="#fff" />}
        />
        <Row
          icon="metronome"
          label="Tempo cue (getar tiap fase)"
          right={<Switch value={state.settings.tempoCue} onValueChange={(v) => actions.patchSettings({ tempoCue: v })} trackColor={{ true: C.primary, false: '#3a3448' }} thumbColor="#fff" />}
        />
      </Card>

      <Label style={{ marginTop: 28, marginBottom: 10 }}>Notifikasi System</Label>
      <Card style={{ padding: 0 }} light={false}>
        <Row
          icon="bell-ring-outline"
          label="Aktifkan notifikasi"
          right={<Switch value={nf.enabled} onValueChange={(v) => actions.patchNotif({ enabled: v })} trackColor={{ true: C.primary, false: '#3a3448' }} thumbColor="#fff" />}
        />
        {NOTIF_ROWS.map((r) => (
          <Row
            key={r.key}
            icon={r.icon}
            label={r.label}
            value={r.time}
            right={
              <Switch
                disabled={!nf.enabled}
                value={nf.enabled && nf[r.key]}
                onValueChange={(v) => actions.patchNotif({ [r.key]: v })}
                trackColor={{ true: C.primary, false: '#3a3448' }}
                thumbColor="#fff"
              />
            }
          />
        ))}
        <Row
          icon="bell-check-outline"
          label="Kirim tes notifikasi"
          value={testMsg}
          onPress={async () => {
            if (!notificationsSupported) return setTestMsg('khusus HP');
            const ok = await sendTestNotification();
            setTestMsg(ok ? 'terkirim (3 dtk)' : 'izin ditolak');
          }}
        />
      </Card>
      <Body size={12} style={{ marginTop: 8, color: C.textFaint }}>
        Jam mengikuti zona waktu HP. Pengingat otomatis batal setelah kamu latihan. Notifikasi hanya berjalan di aplikasi HP (Android/iOS), bukan di browser.
      </Body>

      <Label style={{ marginTop: 28, marginBottom: 10 }}>Data (tersimpan lokal)</Label>
      <Card style={{ padding: 0 }} light={false}>
        <Row icon="export-variant" label="Export backup" onPress={exportData} />
        <Row icon="import" label="Import backup" onPress={() => setImportOpen(true)} />
        <Row
          icon="delete-forever-outline"
          label="Reset all data"
          onPress={() => ask('Reset semua data?', 'Profil, riwayat latihan, foto, dan progres akan dihapus permanen.', () => actions.resetAll())}
        />
      </Card>
      <Body size={12} center style={{ marginTop: 24, color: C.textFaint }}>
        Shadow Fit v1.0 · Data hanya disimpan di perangkat ini. Rutin export backup agar aman.
      </Body>

      <Sheet visible={editOpen} onClose={() => setEditOpen(false)} title="Edit Identity">
        <Field label="Designation" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} autoCapitalize="characters" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Field style={{ flex: 1 }} label="Height (cm)" keyboardType="decimal-pad" value={form.height} onChangeText={(v) => setForm({ ...form, height: v })} />
          <Field style={{ flex: 1 }} label="Age" keyboardType="number-pad" value={form.age} onChangeText={(v) => setForm({ ...form, age: v })} />
        </View>
        <Body size={12} style={{ marginTop: 10, color: C.textDim }}>
          Berat badan dicatat lewat halaman Growth.
        </Body>
        <Button
          label="Save"
          icon="check"
          size="lg"
          style={{ marginTop: 20 }}
          onPress={() => {
            const h = parseFloat(form.height.replace(',', '.'));
            const a = parseInt(form.age, 10);
            actions.patchProfile({
              name: form.name.trim() || p.name,
              heightCm: h > 0 ? h : p.heightCm,
              age: a > 0 ? a : p.age,
            });
            setEditOpen(false);
          }}
        />
      </Sheet>

      <Sheet visible={importOpen} onClose={() => setImportOpen(false)} title="Import Backup">
        <Body size={13}>Tempel isi file backup JSON di bawah.</Body>
        <TextInput
          multiline
          value={importText}
          onChangeText={(t) => {
            setImportText(t);
            setImportErr('');
          }}
          placeholder='{"version":1,...}'
          placeholderTextColor={C.textFaint}
          style={styles.importBox}
        />
        {importErr ? <Body color={C.danger}>{importErr}</Body> : null}
        <Button label="Import" icon="import" size="lg" style={{ marginTop: 16 }} onPress={doImport} disabled={!importText.trim()} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontFamily: F.headline, color: C.lavenderSoft, fontSize: 22, letterSpacing: 1 },
  name: { fontFamily: F.headline, color: C.text, fontSize: 26, marginTop: 14, marginBottom: 4 },
  camBadge: { position: 'absolute', right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: C.lavender, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, minHeight: 58, borderBottomWidth: 1, borderBottomColor: '#211c2d' },
  rowLabel: { flex: 1, fontFamily: F.bodySemi, color: C.text, fontSize: 15 },
  unitSeg: { flexDirection: 'row', borderWidth: 1, borderColor: C.border, borderRadius: 8, overflow: 'hidden' },
  unitItem: { paddingHorizontal: 14, paddingVertical: 6 },
  unitText: { fontFamily: F.monoBold, color: C.textDim, fontSize: 12 },
  importBox: { minHeight: 140, maxHeight: 240, marginTop: 12, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, color: C.text, fontFamily: F.mono, fontSize: 12, textAlignVertical: 'top', backgroundColor: C.surfaceInput },
});
