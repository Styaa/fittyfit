import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { ATTR_ICON, ATTR_INFO, crystalsForAttr, exercisesForAttr } from '@/store/attr-info';
import { attributes, ATTR_POINTS_PER_LEVEL } from '@/store/logic';
import { useStore } from '@/store/store';
import type { Attr } from '@/store/types';
import { C, F, glow, hexA } from '@/theme';

import { Body, Icon, Label, Mono, ProgressBar, Sheet, Tag } from './ui';

const fmtPts = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

/** Lembar detail sebuah atribut: arti, progres, cara menaikkan, dan gerakan terkait */
export function AttrSheet({ attr, onClose }: { attr: Attr | null; onClose: () => void }) {
  const { state } = useStore();
  const info = attr ? ATTR_INFO[attr] : null;
  const a = attr ? attributes(state).find((x) => x.attr === attr) : null;
  const groups = attr ? exercisesForAttr(state, attr) : [];
  const crystals = attr ? crystalsForAttr(attr) : [];

  return (
    <Sheet visible={!!attr && !!info} onClose={onClose} title={attr && info ? `${attr} · ${info.name}` : ''}>
      {attr && info && a && (
        <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={false}>
          {/* nilai & progres */}
          <View style={styles.hero}>
            <View style={[styles.iconBox, glow(C.primary, 16, 0.4)]}>
              <Icon name={ATTR_ICON[attr]} size={30} color={C.lavender} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={styles.value}>{String(a.value).padStart(2, '0')}</Text>
                {a.delta > 0 ? <Tag label={`+${a.delta} minggu ini`} color={C.success} /> : <Mono size={12} color={C.textFaint}>belum naik minggu ini</Mono>}
              </View>
              <ProgressBar value={a.progress} style={{ marginTop: 10 }} height={6} />
              <Mono size={12} color={C.textDim} style={{ marginTop: 6 }}>
                {fmtPts(a.toNext)} poin lagi menuju {attr} {a.value + 1} · total {fmtPts(a.points)} poin
              </Mono>
            </View>
          </View>

          <Body color={C.text} style={{ marginTop: 16, fontStyle: 'italic' }}>
            “{info.lore}”
          </Body>
          <Body size={14} style={{ marginTop: 6 }}>
            {info.real}
          </Body>

          {/* cara menaikkan */}
          <Label color={C.lavender} style={styles.section}>
            Cara menaikkan
          </Label>
          <View style={{ gap: 8 }}>
            {info.sources.map((src) => (
              <View key={src.text} style={styles.sourceRow}>
                <Icon name="arrow-up-bold-circle-outline" size={18} color={C.success} />
                <Body size={14} color={C.text} style={{ flex: 1 }}>
                  {src.text}
                </Body>
                <Text style={styles.points}>{src.points}</Text>
              </View>
            ))}
          </View>
          <Body size={12} style={{ marginTop: 8, color: C.textDim }}>
            Setiap {ATTR_POINTS_PER_LEVEL} poin = {attr} +1. Atribut tidak pernah turun.
          </Body>

          {/* gerakan terkait */}
          {groups.length > 0 && (
            <>
              <Label color={C.lavender} style={styles.section}>
                Gerakan di programmu
              </Label>
              <View style={{ gap: 10 }}>
                {groups.map((g) => (
                  <View key={g.workout}>
                    <Mono size={12} color={C.textDim}>
                      {g.workout.toUpperCase()}
                    </Mono>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {g.exercises.map((name) => (
                        <View key={name} style={styles.exChip}>
                          <Text style={styles.exChipText}>{name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* kristal */}
          {crystals.length > 0 && (
            <>
              <Label color={C.lavender} style={styles.section}>
                Resonance crystal
              </Label>
              <View style={{ gap: 8 }}>
                {crystals.map((c) => {
                  const got = a.value >= c.threshold;
                  return (
                    <View key={c.id} style={[styles.crystalRow, got && { borderColor: hexA(c.color, 0.5) }]}>
                      <Svg width={22} height={22}>
                        <Polygon points="11,1 21,11 11,21 1,11" fill={got ? c.color : 'none'} stroke={c.color} strokeWidth={1.5} />
                      </Svg>
                      <Body size={14} color={C.text} style={{ flex: 1 }}>
                        {c.label}
                      </Body>
                      <Mono size={12} color={got ? C.success : C.textDim}>
                        {got ? 'TERBUKA ✓' : `${a.value}/${c.threshold}`}
                      </Mono>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* tips */}
          <Label color={C.lavender} style={styles.section}>
            Tips
          </Label>
          <View style={{ gap: 6, paddingBottom: 12 }}>
            {info.tips.map((t) => (
              <Body key={t} size={14}>
                • {t}
              </Body>
            ))}
          </View>
        </ScrollView>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, borderColor: C.borderStrong, backgroundColor: C.primaryDim, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: F.monoBold, color: C.lavender, fontSize: 40 },
  section: { marginTop: 22, marginBottom: 10 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  points: { fontFamily: F.monoBold, color: C.success, fontSize: 13 },
  exChip: { borderWidth: 1, borderColor: '#4a3d7c', backgroundColor: '#2a2245', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  exChipText: { fontFamily: F.bodySemi, color: C.text, fontSize: 12 },
  crystalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.borderMuted, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
});
