import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';

interface Props {
  icon: string;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<Props> = ({
  icon,
  iconColor,
  iconBg,
  value,
  label,
  trend,
  trendValue,
  style,
}) => (
  <View style={[styles.card, style]}>
    <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
    {trend && trendValue && (
      <View style={styles.trendRow}>
        <MaterialCommunityIcons
          name={
            trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus'
          }
          size={12}
          color={trend === 'up' ? Colors.danger : trend === 'down' ? Colors.success : Colors.textMuted}
        />
        <Text
          style={[
            styles.trendText,
            {
              color:
                trend === 'up' ? Colors.danger : trend === 'down' ? Colors.success : Colors.textMuted,
            },
          ]}
        >
          {trendValue}
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    ...Shadows.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  trendText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
});
