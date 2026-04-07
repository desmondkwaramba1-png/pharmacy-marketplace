import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StockStatus } from '../types';
import { theme } from '../theme';

interface BadgeProps {
  status: StockStatus;
}

const config = {
  in_stock: { label: 'In Stock', icon: 'check-circle', color: theme.colors.successText, bg: theme.colors.successBg },
  low_stock: { label: 'Low Stock', icon: 'exclamation-triangle', color: theme.colors.warningText, bg: theme.colors.warningBg },
  out_of_stock: { label: 'Out of Stock', icon: 'times-circle', color: theme.colors.errorText, bg: theme.colors.errorBg },
};

export default function Badge({ status }: BadgeProps) {
  const { label, icon, color, bg } = config[status] || config.out_of_stock;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <FontAwesome5 name={icon as any} size={10} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radii.full,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
