import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface Props {
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
  rainChance: number;
  location: string;
}

const weatherIconMap: Record<string, string> = {
  'Partly Cloudy': 'weather-partly-cloudy',
  'Showers': 'weather-rainy',
  'Heavy Rain': 'weather-pouring',
  'Thunderstorm': 'weather-lightning-rainy',
  'Cloudy': 'weather-cloudy',
  'Sunny': 'weather-sunny',
  'Clear': 'weather-night',
};

export const WeatherMiniCard: React.FC<Props> = ({
  temp, humidity, wind, condition, rainChance, location,
}) => {
  const icon = weatherIconMap[condition] || 'weather-partly-cloudy';

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <View>
          <Text style={styles.temp}>{temp}°C</Text>
          <Text style={styles.condition}>{condition}</Text>
          <Text style={styles.location}>{location}</Text>
        </View>
        <MaterialCommunityIcons name={icon as any} size={52} color={Colors.skyBlue} />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="water-percent" size={14} color={Colors.skyBlue} />
          <Text style={styles.statText}>{humidity}%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <MaterialCommunityIcons name="weather-windy" size={14} color={Colors.skyBlue} />
          <Text style={styles.statText}>{wind} km/h</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <MaterialCommunityIcons name="umbrella" size={14} color={Colors.skyBlue} />
          <Text style={styles.statText}>{rainChance}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  temp: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: 40,
  },
  condition: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  location: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgCanvas,
    borderRadius: 12,
    paddingVertical: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },
});
