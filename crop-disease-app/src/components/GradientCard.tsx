import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows } from '../theme/shadows';

interface Props {
  colors: readonly [string, string, ...string[]];
  style?: ViewStyle;
  children: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const GradientCard: React.FC<Props> = ({
  colors,
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}) => (
  <LinearGradient
    colors={colors}
    start={start}
    end={end}
    style={[styles.card, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    ...Shadows.card,
  },
});
