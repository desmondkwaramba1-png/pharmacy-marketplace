import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { StatCard } from '../components/StatCard';
import { DiseaseAlertCard } from '../components/DiseaseAlertCard';
import { SectionHeader } from '../components/SectionHeader';
import {
  farmer,
  weatherData,
  outbreaks,
  recentScans,
  communityReports,
  riskLevels,
} from '../data/mockData';

const { width } = Dimensions.get('window');

const weatherIconMap: Record<string, string> = {
  'Partly Cloudy': 'weather-partly-cloudy',
  'Showers': 'weather-rainy',
  'Heavy Rain': 'weather-pouring',
  'Thunderstorm': 'weather-lightning-rainy',
  'Cloudy': 'weather-cloudy',
  'Sunny': 'weather-sunny',
};

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const risk = riskLevels.moderate;
  const weather = weatherData.current;
  const icon = weatherIconMap[weather.condition] || 'weather-partly-cloudy';

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const navigateToScan = () => {
    navigation.getParent()?.navigate('ScanTab');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Sticky header (appears on scroll) */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <LinearGradient colors={[Colors.forestGreen, Colors.emerald]} style={styles.stickyHeaderGradient}>
          <Text style={styles.stickyHeaderTitle}>AgriGuard AI</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Hero header */}
        <LinearGradient
          colors={[Colors.forestGreen, Colors.deepBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />

          {/* Top row */}
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.farmerName}>{farmer.name} 👋</Text>
              <View style={styles.farmLocation}>
                <MaterialCommunityIcons name="map-marker" size={13} color={Colors.mint} />
                <Text style={styles.farmLocationText}>{farmer.farm} • {farmer.district}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.textWhite} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Weather card */}
          <View style={styles.weatherCard}>
            <View style={styles.weatherLeft}>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
              <Text style={styles.weatherLocation}>{weather.location}</Text>
            </View>
            <View style={styles.weatherRight}>
              <MaterialCommunityIcons name={icon as any} size={56} color="rgba(255,255,255,0.9)" />
              <View style={styles.weatherStats}>
                <View style={styles.weatherStat}>
                  <MaterialCommunityIcons name="water-percent" size={13} color={Colors.mint} />
                  <Text style={styles.weatherStatText}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherStat}>
                  <MaterialCommunityIcons name="umbrella" size={13} color={Colors.mint} />
                  <Text style={styles.weatherStatText}>{weather.rainChance}%</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Risk level banner */}
        <View style={[styles.riskBanner, { backgroundColor: risk.bg, borderLeftColor: risk.color }]}>
          <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
          <View style={styles.riskContent}>
            <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
            <Text style={styles.riskDesc}>{risk.description}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={risk.color} />
        </View>

        {/* Quick actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={navigateToScan} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.emerald, Colors.forestGreen]} style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="leaf-circle" size={26} color={Colors.textWhite} />
              </LinearGradient>
              <Text style={styles.quickActionLabel}>Scan Crop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.getParent()?.navigate('WeatherTab')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.lightBlue }]}>
                <MaterialCommunityIcons name="weather-cloudy" size={26} color={Colors.skyBlue} />
              </View>
              <Text style={styles.quickActionLabel}>Forecast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.getParent()?.navigate('AlertsTab')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="alert-circle" size={26} color={Colors.harvestOrange} />
              </View>
              <Text style={styles.quickActionLabel}>Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} activeOpacity={0.8}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons name="history" size={26} color="#9C27B0" />
              </View>
              <Text style={styles.quickActionLabel}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Season stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="leaf-circle"
            iconColor={Colors.emerald}
            iconBg={Colors.lightMint}
            value={`${farmer.totalScans}`}
            label="Total Scans"
            trend="up"
            trendValue="+8 this week"
            style={{ marginLeft: 20 }}
          />
          <StatCard
            icon="alert"
            iconColor={Colors.harvestOrange}
            iconBg="#FFF3E0"
            value="5"
            label="Active Alerts"
            trend="up"
            trendValue="+2 today"
          />
          <StatCard
            icon="cash"
            iconColor={Colors.emerald}
            iconBg={Colors.lightMint}
            value="$1,240"
            label="Income Saved"
            trend="down"
            trendValue="this season"
            style={{ marginRight: 20 }}
          />
        </View>

        {/* Community reports */}
        <View style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <MaterialCommunityIcons name="account-group" size={20} color={Colors.emerald} />
            <Text style={styles.communityTitle}>Community Reports</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </View>
          {communityReports.slice(0, 2).map((report) => (
            <View key={report.id} style={styles.communityRow}>
              <View style={styles.communityAvatar}>
                <Text style={styles.communityAvatarText}>{report.farmerName[0]}</Text>
              </View>
              <Text style={styles.communityText} numberOfLines={1}>
                <Text style={styles.communityName}>{report.farmerName}</Text>
                {' '}in {report.district} reported{' '}
                <Text style={styles.communityDisease}>{report.disease}</Text>
              </Text>
              <Text style={styles.communityTime}>{report.timeAgo}</Text>
            </View>
          ))}
        </View>

        {/* Recent diagnoses */}
        <SectionHeader title="Recent Diagnoses" onSeeAll={() => {}} subtitle="Your scan history" />
        <FlatList
          data={recentScans}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scanCardsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.scanCard} activeOpacity={0.85}>
              <View style={[styles.scanCardIcon, { backgroundColor: item.severityColor + '20' }]}>
                <MaterialCommunityIcons
                  name={item.severity === 'Healthy' ? 'check-circle' : 'alert-circle'}
                  size={28}
                  color={item.severityColor}
                />
              </View>
              <View style={[styles.scanSeverityChip, { backgroundColor: item.severityColor + '20' }]}>
                <Text style={[styles.scanSeverityText, { color: item.severityColor }]}>
                  {item.severity}
                </Text>
              </View>
              <Text style={styles.scanDiseaseName} numberOfLines={2}>{item.diseaseName}</Text>
              <Text style={styles.scanCrop}>{item.crop}</Text>
              <View style={styles.scanConfidenceRow}>
                <Text style={styles.scanConfidence}>{item.confidence}%</Text>
                <Text style={styles.scanConfidenceLabel}> match</Text>
              </View>
              <Text style={styles.scanDate}>{item.date}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Active alerts */}
        <SectionHeader
          title="Active Disease Alerts"
          onSeeAll={() => navigation.getParent()?.navigate('AlertsTab')}
          subtitle={`${outbreaks.length} ongoing outbreaks`}
        />
        {outbreaks.slice(0, 3).map((outbreak) => (
          <DiseaseAlertCard
            key={outbreak.id}
            disease={outbreak.disease}
            location={`${outbreak.district}, ${outbreak.province}`}
            severity={outbreak.severity}
            severityColor={outbreak.severityColor}
            timeAgo={outbreak.reportedDate}
            farmersAffected={outbreak.farmersAffected}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgCanvas,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  stickyHeaderGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyHeaderTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  scrollContent: {
    gap: 0,
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -40,
  },
  bgCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  farmerName: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
    marginTop: 2,
  },
  farmLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  farmLocationText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.mint,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.harvestOrange,
    borderWidth: 1.5,
    borderColor: Colors.forestGreen,
  },
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  weatherLeft: {
    gap: 3,
  },
  weatherTemp: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
    lineHeight: 42,
  },
  weatherCondition: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  weatherLocation: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  weatherRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  weatherStats: {
    gap: 4,
    alignItems: 'flex-end',
  },
  weatherStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherStatText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.75)',
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    gap: 10,
    ...Shadows.sm,
  },
  riskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  riskContent: {
    flex: 1,
  },
  riskLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.8,
  },
  riskDesc: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  quickActionsTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  quickActionLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 4,
  },
  communityCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  communityTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  newBadge: {
    backgroundColor: Colors.lightMint,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.emerald,
    letterSpacing: 0.5,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  communityAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lightMint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityAvatarText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.emerald,
  },
  communityText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  communityName: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  communityDisease: {
    fontFamily: Typography.fontFamily.medium,
    color: Colors.harvestOrange,
  },
  communityTime: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  scanCardsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  scanCard: {
    width: 140,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    ...Shadows.md,
  },
  scanCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scanSeverityChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scanSeverityText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  scanDiseaseName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  scanCrop: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  scanConfidenceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scanConfidence: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  scanConfidenceLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  scanDate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
