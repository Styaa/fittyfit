import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { weekPhase } from '@/store/program8';
import { applyWeek, programWeek } from '@/store/logic';
import { useStore } from '@/store/store';
import type { ExerciseTemplate } from '@/store/types';
import { C, F, hexA } from '@/theme';

import { MoveDemo } from './move-demo';
import { Body, Card, Icon, Label, Mono, Sheet, Tag } from './ui';

export const TECH_LABEL = { onePointFive: '1.5 REPS', myo: 'MYO-REPS', drop: 'DROP SET' } as const;

/** "4 set · 15–20 reps/sisi · 4-1-1-1 · 75s · RIR 1" */
export function rxLine(e: ExerciseTemplate) {
  const reps = e.mode === 'hold' ? `tahan ${e.repMin}–${e.repMax} dtk` : `${e.mode === 'amrap' ? 'AMRAP ' : ''}${e.repMin}–${e.repMax} reps`;
  const tempo = e.tempo ? ` · ${e.tempo.split('').join('-')}` : '';
  const rir = e.rirLabel && e.rirLabel !== '—' ? ` · RIR ${e.rirLabel}` : '';
  return `${e.sets} set · ${reps}${e.perSide ? '/sisi' : ''}${tempo} · ${e.restSec}s${rir}`;
}

export function WeekBanner({ compact }: { compact?: boolean }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const wk = programWeek(state);
  if (!wk) return null;
  const phase = weekPhase(wk.week);
  const deload = wk.week === 8;
  const total = state.program?.weeks ?? 8;
  return (
    <Card tone={deload ? 'success' : 'active'} onPress={() => setOpen((v) => !v)} style={{ paddingVertical: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.weekBadge, deload && { borderColor: hexA(C.success, 0.5), backgroundColor: C.successDim }]}>
          <Text style={[styles.weekNum, deload && { color: C.success }]}>{wk.week}</Text>
          <Text style={styles.weekOf}>/{total}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Label color={deload ? C.success : C.lavender}>
            Minggu ke-{wk.week}
            {wk.block > 1 ? ` · Blok ${wk.block}` : ''}
          </Label>
          <Text style={styles.phaseName}>{phase.name.toUpperCase()}</Text>
          <Mono size={12} color={C.textDim}>
            {phase.rirText}
          </Mono>
        </View>
        {!compact && <Icon name={open ? 'chevron-up' : 'chevron-down'} color={C.textDim} size={20} />}
      </View>
      {open && !compact && (
        <View style={{ marginTop: 12, gap: 4 }}>
          {phase.points.map((p) => (
            <Body key={p} size={13}>
              • {p}
            </Body>
          ))}
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
            {Array.from({ length: total }, (_, i) => (
              <View key={i} style={[styles.seg, i < wk.week && { backgroundColor: i === 7 ? C.success : C.primary }, i === wk.week - 1 && { backgroundColor: C.lavender }]} />
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

export function ExerciseGuideSheet({ exercise, onClose }: { exercise: ExerciseTemplate | null; onClose: () => void }) {
  const { state } = useStore();
  const wk = programWeek(state);
  const e = exercise ? applyWeek(exercise, wk?.week ?? null) : null;
  return (
    <Sheet visible={!!e} onClose={onClose} title={e?.name ?? ''}>
      {e && (
        <ScrollView style={{ maxHeight: 560 }}>
          <View style={{ marginBottom: 12 }}>
            <MoveDemo name={e.name} tempo={e.tempo} height={180} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {e.muscles.map((m) => (
              <Tag key={m} label={m} color={C.lavender} />
            ))}
          </View>
          <Mono size={13} color={C.text} style={{ marginTop: 12 }}>
            {rxLine(e)}
          </Mono>
          {e.tempo ? (
            <Body size={12} style={{ color: C.textDim, marginTop: 2 }}>
              Tempo {e.tempo.split('').join('-')} = turun {e.tempo[0]}s · jeda bawah {e.tempo[1]}s · naik {e.tempo[2]}s · jeda atas {e.tempo[3]}s
            </Body>
          ) : null}
          {e.technique && (
            <View style={[styles.tech, !e.rx.techniqueActive && { opacity: 0.55 }]}>
              <Label color={e.rx.techniqueActive ? C.danger : C.textDim}>
                {TECH_LABEL[e.technique.kind]} {e.rx.techniqueActive ? '· aktif minggu ini' : '· belum aktif minggu ini'}
              </Label>
              <Body size={13} style={{ marginTop: 4 }}>
                {e.technique.note}
              </Body>
            </View>
          )}
          {e.guide ? (
            <View style={{ gap: 14, marginTop: 16, paddingBottom: 12 }}>
              <GuideBlock icon="play-circle-outline" title="Cara melakukan" text={e.guide.how} />
              <GuideBlock icon="alert-outline" title="Kesalahan umum" text={e.guide.mistakes} color={C.danger} />
              <GuideBlock icon="arrow-down-circle-outline" title="Alternatif lebih mudah" text={e.guide.easier} color={C.success} />
              <GuideBlock icon="arrow-up-circle-outline" title="Progresi lebih sulit" text={e.guide.harder} color={C.gold} />
            </View>
          ) : (
            <Body style={{ marginTop: 16 }}>Belum ada panduan untuk latihan ini.</Body>
          )}
        </ScrollView>
      )}
    </Sheet>
  );
}

function GuideBlock({ icon, title, text, color = C.lavender }: { icon: React.ComponentProps<typeof Icon>['name']; title: string; text: string; color?: string }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Icon name={icon} size={16} color={color} />
        <Label color={color}>{title}</Label>
      </View>
      <Body size={14} color={C.text}>
        {text}
      </Body>
    </View>
  );
}

/** Daftar pemanasan / finisher / pendinginan yang bisa dibuka-tutup */
export function InfoCard({ icon, title, lines, muted, tag }: { icon: React.ComponentProps<typeof Icon>['name']; title: string; lines: string[]; muted?: boolean; tag?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((v) => !v)} style={[styles.info, muted && { opacity: 0.5 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={20} color={C.lavender} />
        <Text style={styles.infoTitle}>{title.toUpperCase()}</Text>
        {tag ? <Tag label={tag} color={muted ? C.textDim : C.success} /> : null}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.textDim} />
      </View>
      {open && (
        <View style={{ marginTop: 10, gap: 6 }}>
          {lines.map((l) => (
            <Body key={l} size={13}>
              • {l}
            </Body>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  weekBadge: { width: 58, height: 58, borderRadius: 12, borderWidth: 1, borderColor: C.borderStrong, backgroundColor: C.primaryDim, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  weekNum: { fontFamily: F.display, color: C.lavender, fontSize: 28 },
  weekOf: { fontFamily: F.mono, color: C.textDim, fontSize: 12, marginTop: 10 },
  phaseName: { fontFamily: F.headline, color: C.text, fontSize: 16, marginTop: 2 },
  seg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#2a2535' },
  tech: { marginTop: 14, borderWidth: 1, borderColor: hexA(C.danger, 0.35), backgroundColor: 'rgba(248,113,113,0.06)', borderRadius: 8, padding: 12 },
  info: { borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 10, padding: 14 },
  infoTitle: { flex: 1, fontFamily: F.title, color: C.text, fontSize: 13, letterSpacing: 1.4 },
});
