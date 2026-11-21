import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Platform, Text, View } from 'react-native';

import { Body, Button, Card, IconButton, Screen, TopBar } from '@/components/ui';
import { fmtWalkDate, WalkDetail } from '@/components/walk-detail';
import { useStore } from '@/store/store';
import { C, F } from '@/theme';

export default function WalkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const walk = (state.walks ?? []).find((w) => w.id === id);
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/walks'));

  const remove = () => {
    const go = () => {
      actions.deleteWalk(id);
      leave();
    };
    const msg = 'Sesi ini dihapus permanen. Poin AGI dan progres quest jalan dari sesi ini ikut berkurang.';
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Hapus sesi jalan?\n\n${msg}`)) go();
    } else Alert.alert('Hapus sesi jalan?', msg, [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: go }]);
  };

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="chevron-left" onPress={leave} />} title="Detail Jalan" />}>
      {!walk ? (
        <Card style={{ alignItems: 'center', gap: 10 }}>
          <Body center>Sesi jalan tidak ditemukan.</Body>
          <Button label="Kembali" onPress={leave} />
        </Card>
      ) : (
        <View>
          <Text style={{ fontFamily: F.headline, color: C.text, fontSize: 22 }}>SHADOW WALK</Text>
          <Text style={{ fontFamily: F.body, color: C.textDim, fontSize: 13, marginTop: 2, marginBottom: 14 }}>{fmtWalkDate(walk.startedAt)}</Text>
          <WalkDetail walk={walk} />
          <Button label="Hapus sesi ini" icon="trash-can-outline" variant="danger" size="sm" onPress={remove} style={{ marginTop: 28 }} />
        </View>
      )}
    </Screen>
  );
}
