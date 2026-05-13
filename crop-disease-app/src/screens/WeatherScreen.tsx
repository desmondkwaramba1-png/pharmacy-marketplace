import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { RiskGauge } from '../components/RiskGauge';
import { weatherData } from '../data/mockData';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

const weatherIconMap: Record<string, string> = {
  'Partly Cloudy': 'weather-partly-cloudy',
  'Showers': 'weather-rainy',
  'Heavy Rain': 'weather-pouring',
  'Thunderstorm': 'weather-lightning-rainy',
  'Cloudy': 'weather-cloudy',
  'Sunny': 'weather-sunny',
  'Clear': 'weather-night',
};

interface Props {
  navigation: any;
}

export const WeatherScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeChart, setActiveChart] = useState<'temp' | 'rain' | 'humidity'>('temp');
  const current = weatherData.current;
  const forecast = weatherData.forecast;
  const risk = weatherData.diseaseRiskIndex;
  const mainIcon = weatherIconMap[current.condition] || 'weather-partly-cloudy';

  const chartConfig = {
    backgroundGradientFrom: Colors.cardBg,
    backgroundGradientTo: Colors.cardBg,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    strokeWidth: 2.5,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontFamily: Typography.fontFamily.medium,
      fontSize: 10,
    },
  };

  const rainChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
  };

  const humidityChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(21, 101, 192, ${opacity})`,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={[Colors.deepBlue, Colors.skyBlue]} style={styles.header}>
        <View style={styles.bgCircle} />
        <Text style={styles.headerTitle}>Weather Intelligence</Text>
        <Text style={styles.headerSub}>{current.updatedAt} • {current.location}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
      >
        {/* Current conditions card */}
        <LinearGradient
          colors={[Colors.deepBlue, Colors.oceanBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.currentCard}
        >
          <View style={styles.currentTop}>
            <View>
              <Text style={styles.currentTemp}>{current.temp}°C</Text>
              <Text style={styles.currentFeels}>Feels like {current.feelsLike}°C</Text>
              <Text style={styles.currentCondition}>{current.condition}</Text>
            </View>
            <View style={styles.currentIconArea}>
              <MaterialCommunityIcons name={mainIcon as any} size={72} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <View style={styles.currentStats}>
            {[
              { icon: 'water-percent', label: 'Humidity', value: `${current.humidity}%` },
              { icon: 'weather-windy', label: 'Wind', value: `${current.wind} km/h` },
              { icon: 'umbrella', label: 'Rain', value: `${current.rainChance}%` },
              { icon: 'white-balance-sunny', label: 'UV Index', value: `${current.uvIndex}` },
            ].map((stat) => (
              <View key={stat.label} style={styles.currentStat}>
                <MaterialCommunityIcons name={stat.icon as any} size={18} color="rgba(255,255,255,0.7)" />
                <Text style={styles.currentStatValue}>{stat.value}</Text>
                <Text style={styles.currentStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* 7-day forecast */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
            {forecast.map((day, index) => {
              const fIcon = weatherIconMap[day.condition] || 'weather-partly-cloudy';
              const isToday = index === 0;
              return (
                <View key={day.day} style={[styles.forecastDay, isToday && styles.forecastDayActive]}>
                  <Text style={[styles.forecastDayLabel, isToday && styles.forecastDayLabelActive]}>
                    {day.day}
                  </Text>
                  <MaterialCommunityIcons
                    name={fIcon as any}
                    size={26}
                    color={isToday ? Colors.textWhite : Colors.skyBlue}
                  />
                  <Text style={[styles.forecastHigh, isToday && styles.forecastHighActive]}>
                    {day.high}°
                  </Text>
                  <Text style={[styles.forecastLow, isToday && styles.forecastLowActive]}>
                    {day.low}°
                  </Text>
                  <View style={styles.forecastRainRow}>
                    <MaterialCommunityIcons name="umbrella" size={10} color={isToday ? Colors.mint : Colors.skyBlue} />
                    <Text style={[styles.forecastRain, isToday && styles.forecastRainActive]}>
                      {day.rain}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Disease Risk Index */}
        <LinearGradient
          colors={[risk.color + '15', risk.color + '08']}
          style={[styles.riskCard, { borderColor: risk.color + '40' }]}
        >
          <View style={styles.riskCardTop}>
            <View style={styles.riskCardLeft}>
              <Text style={styles.riskCardTitle}>Disease Risk Index</Text>
              <Text style={styles.riskMessage}>{risk.message}</Text>
              <View style={styles.peakDaysRow}>
                <MaterialCommunityIcons name="calendar-alert" size={14} color={risk.color} />
                <Text style={[styles.peakDaysText, { color: risk.color }]}>
                  Peak risk: {risk.peakRiskDays.join(', ')}
                </Text>
              </View>
            </View>
            <RiskGauge score={risk.score} level={risk.level} color={risk.color} size={120} />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CostAnalysis')}
            style={[styles.riskCardCta, { borderColor: risk.color }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.riskCardCtaText, { color: risk.color }]}>View Cost Analysis</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={risk.color} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Chart tabs */}
        <View style={styles.sectionCard}>
          <View style={styles.chartTabs}>
            {(['temp', 'rain', 'humidity'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.chartTab, activeChart === tab && styles.chartTabActive]}
                onPress={() => setActiveChart(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chartTabText, activeChart === tab && styles.chartTabTextActive]}>
                  {tab === 'temp' ? '🌡 Temp' : tab === 'rain' ? '🌧 Rain' : '💧 Humidity'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeChart === 'temp' && (
            <>
              <Text style={styles.chartLabel}>Temperature (°C) — 7 Day Forecast</Text>
              <LineChart
                data={{
                  labels: weatherData.weeklyTemp.labels,
                  datasets: [
                    { data: weatherData.weeklyTemp.high, color: () => Colors.harvestOrange, strokeWidth: 2.5 },
                    { data: weatherData.weeklyTemp.low, color: () => Colors.skyBlue, strokeWidth: 2 },
                  ],
                  legend: ['High', 'Low'],
                }}
                width={CHART_WIDTH}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
              />
            </>
          )}

          {activeChart === 'rain' && (
            <>
              <Text style={styles.chartLabel}>Rainfall (mm) — 7 Day Forecast</Text>
              <BarChart
                data={{
                  labels: weatherData.weeklyRain.labels,
                  datasets: [{ data: weatherData.weeklyRain.data }],
                }}
                width={CHART_WIDTH}
                height={180}
                chartConfig={rainChartConfig}
                style={styles.chart}
                withInnerLines={false}
                fromZero
                yAxisLabel=""
                yAxisSuffix="mm"
              />
            </>
          )}

          {activeChart === 'humidity' && (
            <>
              <Text style={styles.chartLabel}>Relative Humidity (%) — 7 Day Forecast</Text>
              <LineChart
                data={{
                  labels: weatherData.weeklyHumidity.labels,
                  datasets: [{ data: weatherData.weeklyHumidity.data }],
                }}
                width={CHART_WIDTH}
                height={180}
                chartConfig={humidityChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withShadow
              />
            </>
          )}
        </View>

        {/* Advisory */}
        <View style={[styles.advisoryCard, { borderLeftColor: risk.color }]}>
          <View style={styles.advisoryHeader}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={risk.color} />
            <Text style={styles.advisoryTitle}>AgriGuard Advisory</Text>
          </View>
          <Text style={styles.advisoryText}>
            Sustained humidity above 80% is forecast Thursday–Saturday. Conditions are highly favorable for Gray Leaf Spot and Northern Corn Leaf Blight development. Scout your maize fields immediately and apply preventive fungicide before Thursday morning.
          </Text>
          <View style={styles.advisoryActions}>
            <TouchableOpacity style={styles.advisoryBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="bell-ring" size={16} color={Colors.emerald} />
              <Text style={styles.advisoryBtnText}>Set Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.advisoryBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="share-variant" size={16} color={Colors.emerald} />
              <Text style={styles.advisoryBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgCanvas,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80,
    right: -40,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  headerSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  currentCard: {
    borderRadius: 24,
    padding: 20,
    gap: 20,
    ...Shadows.card,
  },
  currentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentTemp: {
    fontSize: 52,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
    lineHeight: 56,
  },
  currentFeels: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  currentCondition: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  currentIconArea: {
    alignItems: 'center',
  },
  currentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  currentStat: {
    alignItems: 'center',
    gap: 3,
  },
  currentStatValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  currentStatLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.6)',
  },
  sectionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    ...Shadows.md,
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  forecastScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  forecastDay: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    minWidth: 66,
  },
  forecastDayActive: {
    backgroundColor: Colors.deepBlue,
  },
  forecastDayLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  forecastDayLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  forecastHigh: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  forecastHighActive: {
    color: Colors.textWhite,
  },
  forecastLow: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  forecastLowActive: {
    color: 'rgba(255,255,255,0.6)',
  },
  forecastRainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  forecastRain: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  forecastRainActive: {
    color: Colors.mint,
  },
  riskCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    gap: 14,
    ...Shadows.md,
  },
  riskCardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  riskCardLeft: {
    flex: 1,
    gap: 8,
  },
  riskCardTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  riskMessage: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  peakDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  peakDaysText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  riskCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
  },
  riskCardCtaText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCanvas,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  chartTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  chartTabActive: {
    backgroundColor: Colors.cardBg,
    ...Shadows.sm,
  },
  chartTabText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  chartTabTextActive: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  chartLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  advisoryCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    gap: 10,
    ...Shadows.sm,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advisoryTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  advisoryText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  advisoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  advisoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.lightMint,
  },
  advisoryBtnText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.emerald,
  },
});
