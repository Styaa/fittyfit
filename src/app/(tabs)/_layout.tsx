import { BlurView } from 'expo-blur';
import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, IconName } from '@/components/ui';
import { useStore } from '@/store/store';
import { C, F, glow } from '@/theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Status', icon: 'lightning-bolt-outline' },
  quests: { label: 'Quests', icon: 'sword-cross' },
  hall: { label: 'Hall', icon: 'medal-outline' },
  system: { label: 'System', icon: 'tune-vertical-variant' },
};

function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const content = (
    <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, i) => {
        const meta = TABS[route.name];
        if (!meta) return null;
        const active = state.index === i;
        const color = active ? C.lavender : C.textFaint;
        return (
          <Pressable key={route.key} onPress={() => navigateToTab(route.key)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            {active && <View style={[styles.indicator, glow(C.primary, 12, 0.8)]} />}
            <Icon name={meta.icon} size={26} color={color} style={active ? styles.iconGlow : undefined} />
            <Text style={[styles.label, { color }, active && styles.textGlow]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
  return (
    <View style={styles.bar}>
      {Platform.OS === 'ios' || Platform.OS === 'web' ? (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'android' ? 'rgba(10,8,18,0.97)' : 'rgba(10,8,18,0.8)' }]} />
      {content}
    </View>
  );
}

export default function TabsLayout() {
  const { state } = useStore();
  if (!state.profile) return <Redirect href="/onboarding" />;
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.void } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="quests" />
      <Tabs.Screen name="hall" />
      <Tabs.Screen name="system" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#221e2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', paddingTop: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  indicator: { position: 'absolute', top: -12, width: 44, height: 3, borderRadius: 2, backgroundColor: C.lavender },
  label: { fontFamily: F.title, fontSize: 12, letterSpacing: 1 },
  iconGlow: { textShadowColor: 'rgba(139,92,246,0.9)', textShadowRadius: 10 },
  textGlow: { textShadowColor: 'rgba(139,92,246,0.7)', textShadowRadius: 8 },
});
