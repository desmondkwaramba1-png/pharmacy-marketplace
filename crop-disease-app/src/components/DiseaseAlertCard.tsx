import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';

interface Props {
  disease: string;
  location: string;
  severity: string;
  severityColor: string;
  timeAgo: string;
  farmersAffected?: number;
  onPress?: () => void;
}

export const DiseaseAlertCard: React.FC<Props> = ({
  disease,
  location,
  severity,
  severityColor,
  timeAgo,
  farmersAffected,
  onPress,
}) => {
  const bgColor = severityColor + '15';

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: severityColor }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name="alert-circle" size={24} color={severityColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.disease} numberOfLines={1}>{disease}</Text>
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Text style={[styles.badgeText, { color: severityColor }]}>{severity}</Text>
          </View>
        </View>
        <Text style={styles.location}>
          <MaterialCommunityIcons name="map-marker" size={11} color={Colors.textMuted} />
          {' '}{location}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.time}>{timeAgo}</Text>
          {farmersAffected !== undefined && (
            <Text style={styles.farmers}>
              <MaterialCommunityIcons name="account-group" size={11} color={Colors.textMuted} />
              {' '}{farmersAffected} farmers
            </Text>
          )}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  disease: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  location: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  farmers: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
});
