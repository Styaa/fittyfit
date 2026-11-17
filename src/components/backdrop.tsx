import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { C } from '@/theme';

/** Latar "The Void": grid heksagon 5% + vignette radial */
export const Backdrop = React.memo(function Backdrop() {
  // heksagon pointy-top, lebar 28
  const w = 28;
  const h = 48.5;
  const hex = `M${w / 2} 0 L${w} 8 L${w} 24.2 L${w / 2} 32.3 L0 24.2 L0 8 Z M${w / 2} 32.3 L${w / 2} ${h}`;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="hex" width={w} height={h} patternUnits="userSpaceOnUse">
            <Path d={hex} stroke="#8B5CF6" strokeOpacity={0.07} strokeWidth={1} fill="none" />
          </Pattern>
          <RadialGradient id="glow" cx="50%" cy="22%" rx="75%" ry="55%">
            <Stop offset="0" stopColor="#2a1d4d" stopOpacity={0.55} />
            <Stop offset="1" stopColor={C.void} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="vig" cx="50%" cy="50%" rx="80%" ry="70%">
            <Stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <Stop offset="1" stopColor="#000" stopOpacity={0.6} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={C.void} />
        <Rect width="100%" height="100%" fill="url(#glow)" />
        <Rect width="100%" height="100%" fill="url(#hex)" />
        <Rect width="100%" height="100%" fill="url(#vig)" />
      </Svg>
    </View>
  );
});
