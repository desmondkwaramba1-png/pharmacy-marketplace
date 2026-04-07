import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

export function SkeletonLine({ width, height = 14, style }: any) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: '#E5E7EB', borderRadius: theme.radii.sm, opacity: pulseAnim },
        style,
      ]}
    />
  );
}

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLine width="60%" style={{ marginBottom: 8 }} />
      <SkeletonLine width="40%" style={{ marginBottom: 12 }} />
      <SkeletonLine width="50%" style={{ marginBottom: 8 }} />
      <SkeletonLine width="70%" style={{ marginBottom: 8 }} />
      <SkeletonLine width="30%" />
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.xl,
    padding: theme.layout.screenPadding,
  },
  list: {
    gap: 12,
  },
});
