import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { zimbabweDistricts, outbreaks, alertTrendData } from '../data/mockData';

const { width, height } = Dimensions.get('window');

const riskColors: Record<string, string> = {
  Low: Colors.springGreen,
  Moderate: Colors.goldenWheat,
  High: Colors.harvestOrange,
  Critical: Colors.blightRed,
};

interface Props {
  navigation: any;
}

export const EarlyWarningScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'High' | 'Moderate' | 'Low'>('All');

  const filteredOutbreaks = activeFilter === 'All'
    ? outbreaks
    : outbreaks.filter((o) => o.severity === activeFilter);

  const totalAffected = outbreaks.reduce((acc, o) => acc + o.farmersAffected, 0);
  const criticalCount = outbreaks.filter((o) => o.severity === 'Critical').length;

  const chartConfig = {
    backgroundGradientFrom: Colors.cardBg,
    backgroundGradientTo: Colors.cardBg,
    color: (opacity = 1) => `rgba(176, 28, 28, ${opacity})`,
    strokeWidth: 2.5,
    decimalPlaces: 0,
    propsForLabels: {
      fontFamily: Typography.fontFamily.medium,
      fontSize: 10,
    },
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Early Warning</Text>
          <Text style={styles.headerSub}>Zimbabwe Disease Surveillance</Text>
        </View>
        <View style={styles.criticalBadge}>
          <View style={styles.criticalDot} />
          <Text style={styles.criticalText}>{criticalCount} Critical</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
      >
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: -19.0154,
              longitude: 29.1549,
              latitudeDelta: 6.5,
              longitudeDelta: 6.5,
            }}
            mapType="terrain"
          >
            {zimbabweDistricts.map((district) => (
              <Marker
                key={district.id}
                coordinate={{ latitude: district.lat, longitude: district.lng }}
                title={district.name}
                description={`${district.activeAlerts} alerts • ${district.riskLevel} Risk`}
              >
                <View style={[styles.markerContainer, { borderColor: riskColors[district.riskLevel] }]}>
                  <View style={[styles.markerDot, { backgroundColor: riskColors[district.riskLevel] }]} />
                  {district.riskLevel === 'Critical' && (
                    <View style={[styles.markerRing, { borderColor: riskColors[district.riskLevel] }]} />
                  )}
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{district.name}</Text>
                    <Text style={styles.calloutSub}>{district.province}</Text>
                    <Text style={styles.calloutRisk}>{district.riskLevel} Risk • {district.activeAlerts} alerts</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Map legend */}
          <View style={styles.mapLegend}>
            {Object.entries(riskColors).map(([level, color]) => (
              <View key={level} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{zimbabweDistricts.filter(d => d.activeAlerts > 0).length}</Text>
            <Text style={styles.summaryLabel}>Districts Affected</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardMid]}>
            <Text style={[styles.summaryValue, { color: Colors.blightRed }]}>{outbreaks.length}</Text>
            <Text style={styles.summaryLabel}>Active Outbreaks</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.harvestOrange }]}>{totalAffected}</Text>
            <Text style={styles.summaryLabel}>Farmers at Risk</Text>
          </View>
        </View>

        {/* Trend chart */}
        <View style={styles.trendCard}>
          <Text style={styles.trendTitle}>Alert Trend — Last 30 Days</Text>
          <Text style={styles.trendSub}>Active disease outbreaks across Zimbabwe</Text>
          <LineChart
            data={{
              labels: alertTrendData.labels,
              datasets: [{ data: alertTrendData.data }],
            }}
            width={width - 72}
            height={140}
            chartConfig={chartConfig}
            bezier
            style={styles.trendChart}
            withInnerLines={false}
            withOuterLines={false}
            withShadow
          />
          <View style={styles.trendInsight}>
            <MaterialCommunityIcons name="trending-up" size={16} color={Colors.blightRed} />
            <Text style={styles.trendInsightText}>
              +{alertTrendData.data[alertTrendData.data.length - 1] - alertTrendData.data[0]} alerts over 30 days — disease pressure is increasing
            </Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['All', 'Critical', 'High', 'Moderate', 'Low'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                activeFilter === f && styles.filterTabActive,
                activeFilter === f && f !== 'All' && { backgroundColor: riskColors[f] + '20', borderColor: riskColors[f] },
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === f && styles.filterTabTextActive,
                  activeFilter === f && f !== 'All' && { color: riskColors[f] },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Outbreak list */}
        <View style={styles.outbreakList}>
          {filteredOutbreaks.map((outbreak) => (
            <TouchableOpacity key={outbreak.id} style={styles.outbreakCard} activeOpacity={0.85}>
              <View style={[styles.outbreakSeverityBar, { backgroundColor: outbreak.severityColor }]} />
              <View style={styles.outbreakContent}>
                <View style={styles.outbreakTopRow}>
                  <Text style={styles.outbreakDisease}>{outbreak.disease}</Text>
                  <View style={[styles.outbreakBadge, { backgroundColor: outbreak.severityColor + '20' }]}>
                    <Text style={[styles.outbreakBadgeText, { color: outbreak.severityColor }]}>
                      {outbreak.severity}
                    </Text>
                  </View>
                </View>
                <View style={styles.outbreakLocationRow}>
                  <MaterialCommunityIcons name="map-marker" size={13} color={Colors.textMuted} />
                  <Text style={styles.outbreakLocation}>{outbreak.district}, {outbreak.province}</Text>
                </View>
                <View style={styles.outbreakStatsRow}>
                  <View style={styles.outbreakStat}>
                    <MaterialCommunityIcons name="account-group" size={13} color={Colors.textMuted} />
                    <Text style={styles.outbreakStatText}>{outbreak.farmersAffected} farmers</Text>
                  </View>
                  <View style={styles.outbreakStat}>
                    <MaterialCommunityIcons name="resize" size={13} color={Colors.textMuted} />
                    <Text style={styles.outbreakStatText}>{outbreak.areaAffected}</Text>
                  </View>
                  <View style={styles.outbreakStat}>
                    <MaterialCommunityIcons
                      name={
                        outbreak.trend === 'Increasing' ? 'trending-up' :
                        outbreak.trend === 'Decreasing' ? 'trending-down' : 'minus'
                      }
                      size={13}
                      color={
                        outbreak.trend === 'Increasing' ? Colors.danger :
                        outbreak.trend === 'Decreasing' ? Colors.success : Colors.textMuted
                      }
                    />
                    <Text style={[
                      styles.outbreakStatText,
                      { color: outbreak.trend === 'Increasing' ? Colors.danger : outbreak.trend === 'Decreasing' ? Colors.success : Colors.textMuted }
                    ]}>
                      {outbreak.trend}
                    </Text>
                  </View>
                  <Text style={styles.outbreakDate}>{outbreak.reportedDate}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  criticalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.blightRed,
  },
  criticalText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.blightRed,
  },
  scrollContent: {
    gap: 16,
  },
  mapContainer: {
    height: 280,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  markerRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    opacity: 0.5,
  },
  callout: {
    padding: 8,
    minWidth: 140,
  },
  calloutTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  calloutSub: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  calloutRisk: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    ...Shadows.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    ...Shadows.sm,
  },
  summaryCardMid: {
    borderWidth: 1.5,
    borderColor: Colors.blightRed + '40',
  },
  summaryValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  trendCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    gap: 8,
    ...Shadows.md,
  },
  trendTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  trendSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  trendChart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  trendInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 10,
  },
  trendInsightText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.blightRed,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  filterTabActive: {
    backgroundColor: Colors.lightMint,
    borderColor: Colors.emerald,
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  filterTabTextActive: {
    color: Colors.emerald,
    fontFamily: Typography.fontFamily.semiBold,
  },
  outbreakList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  outbreakCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  outbreakSeverityBar: {
    width: 5,
    alignSelf: 'stretch',
  },
  outbreakContent: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  outbreakTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outbreakDisease: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  outbreakBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  outbreakBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  outbreakLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  outbreakLocation: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  outbreakStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  outbreakStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  outbreakStatText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  outbreakDate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
});
