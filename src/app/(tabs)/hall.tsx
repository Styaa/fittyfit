import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { Avatar, Body, Button, Card, Icon, IconButton, Label, Mono, ProgressBar, Screen, SectionTitle, Sheet, Tag, TopBar } from '@/components/ui';
import { fmtShortDate, dayKey } from '@/store/dates';
import { attributes, CRYSTALS, fmtBig, fmtLoad, levelInfo, personalRecords, TITLES, titleUnlocked, totalXp } from '@/store/logic';
import { useStore } from '@/store/store';
import { C, F, hexA, RARITY } from '@/theme';

export default function HallScreen() {
  const { state, actions } = useStore();
  const unit = state.settings.unit;
  const lv = levelInfo(totalXp(state));
  const attrs = attributes(state);
  const prs = personalRecords(state.sessions);
  const [showAllPr, setShowAllPr] = useState(false);
  const [crystal, setCrystal] = useState<string | null>(null);
  const [showAllTitles, setShowAllTitles] = useState(false);

  const titles = [...TITLES].sort((a, b) => {
    const ea = a.id === state.equippedTitle ? -1 : 0;
    const eb = b.id === state.equippedTitle ? -1 : 0;
    const ua = titleUnlocked(state, a) ? 0 : 1;
    const ub = titleUnlocked(state, b) ? 0 : 1;
    return ea - eb || ua - ub;
  });
  const unlockedCount = titles.filter((t) => titleUnlocked(state, t)).length;
  const visibleTitles = showAllTitles ? titles : titles.slice(0, Math.max(2, unlockedCount + 1));
  const prColors = [C.lavender, C.success, '#fca5a5', '#60A5FA', C.gold];
  const cr = CRYSTALS.find((c) => c.id === crystal);

  return (
    <Screen
      header={
        <TopBar
          left={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar uri={state.profile?.avatarUri} name={state.profile?.name} size={38} />
              <Mono color={C.textMuted}>LVL {lv.level}</Mono>
            </View>
          }
          title={<Text style={styles.brand}>SHADOW FIT</Text>}
          right={<IconButton name="chart-line" onPress={() => router.push('/growth')} />}
        />
      }>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Text style={styles.h1}>ACHIEVEMENT HALL</Text>
        <Icon name="medal-outline" color={C.textDim} size={26} />
      </View>
      <View style={{ height: 1, backgroundColor: C.borderMuted, marginTop: 12, marginBottom: 14 }} />
      <Body size={17}>Warisanmu terukir di kehampaan. Pakai gelar, lihat kristal, dan pantau batas kekuatanmu.</Body>

      {/* Gelar */}
      <View style={{ gap: 16, marginTop: 28 }}>
        {visibleTitles.map((t) => {
          const unlocked = titleUnlocked(state, t);
          const equipped = state.equippedTitle === t.id;
          const color = RARITY[t.rarity];
          const legendary = t.rarity === 'LEGENDARY';
          const prog = Math.min(t.target, t.progress(state));
          return (
            <Card key={t.id} tone={equipped ? 'active' : 'default'} style={!unlocked && { opacity: 0.6 }}>
              {legendary && <Icon name="moon-waning-crescent" size={150} color="rgba(255,255,255,0.04)" style={styles.moon} />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Tag label={`${legendary ? '• ' : ''}[${t.rarity}]`} color={color} />
                {equipped ? <Tag label="Equipped" color={C.lavender} filled /> : !unlocked ? <Icon name="lock-outline" size={18} color={C.textFaint} /> : null}
              </View>
              <Text
                style={[
                  styles.titleName,
                  legendary ? { fontSize: 34, lineHeight: 38, color: C.lavender, textShadowColor: 'rgba(196,181,253,0.5)', textShadowRadius: 12 } : null,
                ]}>
                {t.name.toUpperCase()}
              </Text>
              <Body>{t.desc}</Body>
              <Mono color={C.success} style={{ marginTop: 6 }}>
                {t.bonus}
              </Mono>
              {!unlocked ? (
                <View style={{ marginTop: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Label>Progress</Label>
                    <Mono size={12}>
                      {fmtBig(prog)}/{fmtBig(t.target)}
                    </Mono>
                  </View>
                  <ProgressBar value={prog / t.target} height={6} />
                </View>
              ) : !equipped ? (
                <Button label="Equip" variant="secondary" size="sm" onPress={() => actions.equipTitle(t.id)} style={{ marginTop: 16 }} />
              ) : (
                <Button label="Unequip" variant="ghost" size="sm" onPress={() => actions.equipTitle(null)} style={{ marginTop: 16 }} />
              )}
            </Card>
          );
        })}
      </View>

      {visibleTitles.length < titles.length || showAllTitles ? (
        <Button
          label={showAllTitles ? 'Sembunyikan gelar terkunci' : `Lihat semua gelar (${titles.length})`}
          variant="ghost"
          size="sm"
          style={{ marginTop: 14 }}
          onPress={() => setShowAllTitles((v) => !v)}
        />
      ) : null}

      {/* Kristal */}
      <SectionTitle icon="diamond-stone" title="Resonance Crystals" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {CRYSTALS.map((c) => {
          const val = attrs.find((a) => a.attr === c.attr)!.value;
          const got = val >= c.threshold;
          return (
            <Card
              key={c.id}
              light={false}
              onPress={() => setCrystal(c.id)}
              style={[styles.crystal, got ? { backgroundColor: hexA(c.color, 0.08), borderColor: hexA(c.color, 0.3) } : { borderStyle: 'dashed', borderColor: '#2f2a3d', backgroundColor: 'transparent' }]}>
              {got ? (
                <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={64} height={64} style={StyleSheet.absoluteFill}>
                    <Polygon points="32,2 62,32 32,62 2,32" fill={c.color} />
                  </Svg>
                  <Text style={{ fontFamily: F.monoBold, color: '#fff', fontSize: 12 }}>{c.attr}</Text>
                </View>
              ) : (
                <Icon name={val >= c.threshold * 0.6 ? 'plus' : 'lock-outline'} size={22} color={C.textFaint} />
              )}
            </Card>
          );
        })}
      </View>

      {/* PR */}
      <SectionTitle icon="chart-bar" title="Current Limits (PRs)" right={<Label>All time</Label>} />
      {prs.length === 0 ? (
        <Card>
          <Body>Belum ada rekor. Selesaikan set dengan beban untuk mencatat batas kekuatanmu.</Body>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {(showAllPr ? prs : prs.slice(0, 5)).map((p, i) => {
            const col = prColors[i % prColors.length];
            return (
              <View key={p.name} style={[styles.pr, { borderLeftColor: col }]}>
                <View style={{ flex: 1 }}>
                  <Label color={C.textMuted}>{p.name}</Label>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <Text style={styles.prVal}>{fmtLoad(p.loadKg, unit)}</Text>
                    <Mono size={13}>
                      {unit} × {p.reps}
                    </Mono>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Tag label={`e1RM ${fmtLoad(p.e1rm, unit)}`} color={col} />
                  <Mono size={11} color={C.textFaint}>
                    {fmtShortDate(dayKey(p.date))}
                  </Mono>
                </View>
              </View>
            );
          })}
          {prs.length > 5 && <Button label={showAllPr ? 'Show less' : `Show all (${prs.length})`} variant="ghost" size="sm" onPress={() => setShowAllPr((v) => !v)} />}
        </View>
      )}

      <Sheet visible={!!cr} onClose={() => setCrystal(null)} title={cr?.label ?? ''}>
        {cr && (
          <>
            <Body>
              Kristal ini beresonansi saat atribut {cr.attr} mencapai {cr.threshold}.
            </Body>
            <Mono style={{ marginTop: 12 }} color={C.lavender}>
              {cr.attr}: {attrs.find((a) => a.attr === cr.attr)!.value} / {cr.threshold}
            </Mono>
            <ProgressBar value={attrs.find((a) => a.attr === cr.attr)!.value / cr.threshold} style={{ marginTop: 10 }} />
          </>
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontFamily: F.headline, color: C.lavenderSoft, fontSize: 18, letterSpacing: 0.5 },
  h1: { flex: 1, fontFamily: F.headline, color: C.text, fontSize: 28, letterSpacing: 1.2, textShadowColor: 'rgba(196,181,253,0.35)', textShadowRadius: 10 },
  moon: { position: 'absolute', right: -20, bottom: -30 },
  titleName: { fontFamily: F.headline, color: C.text, fontSize: 22, marginTop: 14, marginBottom: 8 },
  crystal: { flexBasis: '30%', flexGrow: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 0 },
  pr: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 14 },
  prVal: { fontFamily: F.monoBold, color: C.text, fontSize: 26 },
});
