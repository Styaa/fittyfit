import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { Body, Button, Card, Display, Divider, Field, H1, Icon, Screen, Tag } from '@/components/ui';
import { useStore } from '@/store/store';
import { C, F, glow } from '@/theme';

export default function Onboarding() {
  const { state, actions } = useStore();
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [tried, setTried] = useState(false);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCursor((c) => !c), 550);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (state.profile) router.replace('/');
  }, [state.profile]);

  const h = parseFloat(height.replace(',', '.'));
  const w = parseFloat(weight.replace(',', '.'));
  const a = parseInt(age, 10);
  const errors = {
    name: !name.trim() ? 'Call sign wajib diisi' : '',
    height: !(h >= 100 && h <= 250) ? '100–250 cm' : '',
    weight: !(w >= 30 && w <= 300) ? '30–300 kg' : '',
    age: !(a >= 10 && a <= 100) ? 'Usia 10–100' : '',
  };
  const valid = !Object.values(errors).some(Boolean);

  const submit = () => {
    setTried(true);
    if (!valid) return;
    actions.setProfile({ name: name.trim(), heightCm: h, weightKg: w, age: a, createdAt: new Date().toISOString() });
    router.replace('/');
  };

  return (
    <>
      <Screen padBottom={40}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.lavender }} />
          <Text style={styles.sys}>SYSTEM INITIALIZING {cursor ? '_' : ' '}</Text>
        </View>

        <View style={styles.hexWrap}>
          <Svg width={150} height={170} style={StyleSheet.absoluteFill}>
            <Polygon points="75,4 146,45 146,125 75,166 4,125 4,45" fill="#161127" stroke="rgba(139,92,246,0.45)" strokeWidth={1.5} />
          </Svg>
          <Icon name="karate" size={56} color={C.primary} style={{ textShadowColor: C.primary, textShadowRadius: 18 }} />
        </View>

        <Display center size={48} style={[{ lineHeight: 54, color: '#ece6ff' }, styles.titleGlow]}>
          Shadow Fit
        </Display>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>LV. 1 INITIATE</Text>
          </View>
        </View>

        <Card style={{ marginTop: 36 }}>
          <H1 color={C.lavenderSoft} style={{ lineHeight: 34 }}>
            Identity Configuration
          </H1>
          <Divider style={{ marginVertical: 16, backgroundColor: 'rgba(139,92,246,0.25)' }} />
          <Field label="Designation" placeholder="Enter Call Sign..." value={name} onChangeText={setName} autoCapitalize="characters" maxLength={20} error={tried ? errors.name : ''} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Field style={{ flex: 1 }} label="Height (cm)" placeholder="---" keyboardType="decimal-pad" value={height} onChangeText={setHeight} error={tried ? errors.height : ''} />
            <Field style={{ flex: 1 }} label="Weight (kg)" placeholder="---" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} error={tried ? errors.weight : ''} />
          </View>
          <Field label="Cycles (age)" placeholder="Solar Cycles" keyboardType="number-pad" value={age} onChangeText={setAge} error={tried ? errors.age : ''} />
          <Body size={13} style={{ marginTop: 14, color: C.textDim }}>
            Semua data disimpan hanya di perangkat ini.
          </Body>
        </Card>

        <Button label="Begin Your Journey" icon="arrow-right" size="lg" onPress={submit} style={{ marginTop: 32 }} />
        {tried && !valid ? (
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Tag label="Data identitas belum valid" color={C.danger} />
          </View>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  sys: { fontFamily: F.mono, color: C.lavender, fontSize: 15, letterSpacing: 1 },
  hexWrap: { width: 150, height: 170, alignSelf: 'center', marginTop: 40, marginBottom: 28, alignItems: 'center', justifyContent: 'center' },
  titleGlow: { textShadowColor: 'rgba(196,181,253,0.55)', textShadowRadius: 18 },
  levelPill: { borderWidth: 1, borderColor: C.borderStrong, borderRadius: 999, paddingHorizontal: 28, paddingVertical: 7, backgroundColor: 'rgba(139,92,246,0.08)' },
  levelText: { fontFamily: F.title, color: C.primary, letterSpacing: 2, fontSize: 13 },
});
