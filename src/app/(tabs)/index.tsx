import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radar } from '@/components/charts';
import { Avatar, Body, Button, Card, Icon, IconButton, IconName, Label, Mono, ProgressBar, Screen, Stat, TopBar } from '@/components/ui';
import { dayKey } from '@/store/dates';
import { ATTR_LABEL, attributes, currentStreak, levelInfo, nextWorkout, rankFor, titleById, totalXp, weekGrid } from '@/store/logic';
import { useStore } from '@/store/store';
import type { Attr } from '@/store/types';
import { C, F, glow, RANK_COLOR } from '@/theme';

const ATTR_ICON: Record<Attr, IconName> = {
  STR: 'dumbbell',
  AGI: 'run-fast',
  END: 'shield-outline',
  VIT: 'heart-outline',
  DIS: 'lightning-bolt-outline',
};

export default function StatusScreen() {
  const { state, actions } = useStore();
  const p = state.profile!;
  const xp = totalXp(state);
  const lv = levelInfo(xp);
  const rank = rankFor(lv.level);
  const attrs = attributes(state);
  const streak = currentStreak(state);
  const week = weekGrid(state);
  const next = nextWorkout(state);
  const title = titleById(state.equippedTitle);
  const today = dayKey();
  const trainedToday = state.sessions.some((s) => dayKey(s.startedAt) === today);
  const restToday = state.restDays.includes(today);

  const enter = () => {
    if (state.active) return router.push('/session');
    if (!next) return router.push('/program');
    actions.startSession(next);
    router.push('/session');
  };

  return (
    <Screen
      header={
        <TopBar
          left={<Avatar uri={p.avatarUri} name={p.name} size={38} />}
          title={<Text style={styles.brand}>SHADOW FIT</Text>}
          right={<IconButton name="chart-line" onPress={() => router.push('/growth')} />}
        />
      }>
      {/* Kartu profil */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar uri={p.avatarUri} name={p.name} size={84} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Text numberOfLines={1} style={styles.name}>
              {p.name}
            </Text>
            <View style={[styles.rank, { borderColor: RANK_COLOR[rank] }]}>
              <Text style={[styles.rankText, { color: RANK_COLOR[rank] }]}>RANK {rank}</Text>
            </View>
          </View>
          {title ? <Text style={styles.title}>« {title.name.toUpperCase()} »</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Mono color={C.lavender}>LV. {lv.level}</Mono>
            <Mono>
              XP {lv.current}/{lv.needed}
            </Mono>
          </View>
          <ProgressBar value={lv.current / lv.needed} style={{ marginTop: 8 }} />
        </View>
      </Card>

      {/* Radar atribut */}
      <Card style={{ marginTop: 24, alignItems: 'center' }}>
        <Label style={{ alignSelf: 'flex-start' }} color={C.textMuted}>
          Attributes
        </Label>
        <Radar data={attrs.map((a) => ({ label: a.attr, value: a.value }))} size={260} />
      </Card>

      <View style={{ gap: 10, marginTop: 12 }}>
        {attrs.map((a) => (
          <View key={a.attr} style={styles.attrRow}>
            <Icon name={ATTR_ICON[a.attr]} color={C.lavender} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={styles.attrName}>{a.attr}</Text>
              <Text style={styles.attrSub}>{ATTR_LABEL[a.attr]}</Text>
            </View>
            <Stat size={26}>{String(a.value).padStart(2, '0')}</Stat>
            <Text style={[styles.delta, { color: a.delta > 0 ? C.success : C.textFaint }]}>{a.delta > 0 ? `+${a.delta}` : '–'}</Text>
          </View>
        ))}
      </View>

      {/* Streak */}
      <Card style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="fire" color={C.gold} size={26} />
          <Text style={styles.streak}>{streak} DAY STREAK</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
          {week.map((d) => (
            <View key={d.key} style={{ alignItems: 'center', gap: 8 }}>
              <View
                style={[
                  styles.dayBox,
                  d.done && { backgroundColor: '#3a3150', borderColor: C.borderStrong },
                  d.today && { borderColor: C.lavender, ...glow(C.primary, 10, 0.5) },
                ]}>
                {d.trained ? <Icon name="check" size={18} color={C.lavender} /> : d.rest ? <Icon name="sleep" size={16} color={C.textDim} /> : null}
              </View>
              <Text style={[styles.dayLabel, d.today && { color: C.lavender }]}>{d.label}</Text>
            </View>
          ))}
        </View>
        {!trainedToday && (
          <Pressable onPress={() => actions.toggleRestDay()} style={{ marginTop: 14, alignSelf: 'flex-start' }}>
            <Body size={13} color={restToday ? C.lavender : C.textDim}>
              {restToday ? '✓ Hari ini ditandai sebagai rest day (ketuk untuk batal)' : '+ Tandai hari ini sebagai rest day (streak tetap jalan)'}
            </Body>
          </Pressable>
        )}
      </Card>

      {/* Dungeon */}
      <View style={{ marginTop: 28 }}>
        {next && !state.active ? (
          <Label center style={{ marginBottom: 10 }}>
            Next dungeon: {next.name} · {next.exercises.length} exercises
          </Label>
        ) : null}
        <Button
          pill
          size="lg"
          icon={state.active ? 'play' : 'sword-cross'}
          label={state.active ? 'Resume Dungeon' : 'Enter Dungeon (Train)'}
          onPress={enter}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontFamily: F.headline, color: C.lavenderSoft, fontSize: 22, letterSpacing: 0.5, textShadowColor: 'rgba(196,181,253,0.4)', textShadowRadius: 10 },
  name: { flex: 1, fontFamily: F.headline, color: C.text, fontSize: 24 },
  title: { fontFamily: F.label, color: C.lavender, fontSize: 11, letterSpacing: 1.5, marginTop: 2 },
  rank: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(139,92,246,0.08)' },
  rankText: { fontFamily: F.monoBold, fontSize: 13 },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.surface,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 60,
  },
  attrName: { fontFamily: F.title, color: C.text, fontSize: 15, letterSpacing: 1.5 },
  attrSub: { fontFamily: F.body, color: C.textFaint, fontSize: 11 },
  delta: { fontFamily: F.mono, fontSize: 13, width: 28 },
  streak: { fontFamily: F.title, color: C.text, fontSize: 22 },
  dayBox: { width: 38, height: 38, borderRadius: 6, borderWidth: 1, borderColor: '#2f2a3d', backgroundColor: '#211d2c', alignItems: 'center', justifyContent: 'center' },
  dayLabel: { fontFamily: F.mono, color: C.textDim, fontSize: 12 },
});
