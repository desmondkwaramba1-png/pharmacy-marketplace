import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface Props {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export const CropBadge: React.FC<Props> = ({ label, icon, selected, onPress, small }) => {
  const content = (
    <View
      style={[
        styles.badge,
        selected && styles.selectedBadge,
        small && styles.smallBadge,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.label, selected && styles.selectedLabel, small && styles.smallLabel]}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightMint,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedBadge: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.forestGreen,
  },
  smallBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.emerald,
  },
  selectedLabel: {
    color: Colors.textWhite,
  },
  smallLabel: {
    fontSize: Typography.fontSize.xs,
  },
});
