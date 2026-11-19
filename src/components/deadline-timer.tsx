import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fmtClock } from '@/store/dates';
import { fmtLockTime, nextDeadline } from '@/store/lock';
import { useStore } from '@/store/store';
import { C, F, glow, hexA } from '@/theme';

import { Icon } from './ui';

/** Hitung mundur "Time Remaining" sebelum Lockdown / Penalty Quest */
export function DeadlineTimer() {
  const { state } = useStore();
  const [now, setNow] = useState(new Date());
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      setBlink((b) => !b);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const d = nextDeadline(state, now);
  if (!d) return null;
  const left = Math.max(0, (d.target.getTime() - now.getTime()) / 1000);
  const urgent = left < 3600;
  const warn = left < 3 * 3600;
  const color = urgent ? C.danger : warn ? C.gold : C.lavender;
  const isLock = d.kind === 'lock';

  return (
    <View
      accessibilityRole="timer"
      accessibilityLabel={`Sisa waktu ${fmtClock(left)} sebelum ${isLock ? 'lockdown' : 'penalty quest'}`}
      style={[styles.box, { borderColor: hexA(color, 0.5), backgroundColor: hexA(color, 0.07) }, urgent && glow(C.danger, 14, 0.3)]}>
      <Icon name={isLock ? 'lock-clock' : 'alert-octagon-outline'} size={22} color={color} style={urgent && !blink ? { opacity: 0.4 } : undefined} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color }]}>TIME REMAINING</Text>
        <Text style={styles.sub}>{isLock ? `sebelum Lockdown ${fmtLockTime(state)}` : 'sebelum Penalty Quest (23.59)'}</Text>
      </View>
      <Text style={[styles.clock, { color }]}>{fmtClock(left).padStart(8, '00:')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, alignSelf: 'stretch' },
  label: { fontFamily: F.title, fontSize: 12, letterSpacing: 1.6 },
  sub: { fontFamily: F.body, color: C.textDim, fontSize: 12, marginTop: 2 },
  clock: { fontFamily: F.monoBold, fontSize: 24, letterSpacing: 1 },
});
