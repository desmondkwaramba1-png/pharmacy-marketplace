import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNetwork } from '../hooks/useNetwork';
import { theme } from '../theme';

export default function OfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Feather name="wifi-off" size={16} color={theme.colors.warningText} />
      <Text style={styles.text}>You're offline — showing cached results</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.warningBg,
    paddingVertical: 8,
    paddingHorizontal: theme.layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: theme.colors.warningText,
    fontSize: 13,
    fontWeight: '500',
  },
});
