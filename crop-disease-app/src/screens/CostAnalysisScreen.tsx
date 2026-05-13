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
import { BarChart } from 'react-native-chart-kit';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { costAnalysis, farmer } from '../data/mockData';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export const CostAnalysisScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeScenario, setActiveScenario] = useState<'low' | 'medium' | 'high'>('medium');
  const scenario = costAnalysis.scenarios[activeScenario];

  const scenarioColors: Record<string, string> = {
    low: Colors.springGreen,
    medium: Colors.goldenWheat,
    high: Colors.blightRed,
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.cardBg,
    backgroundGradientTo: Colors.cardBg,
    color: (opacity = 1, index?: number) =>
      index === 0 ? `rgba(46,125,50,${opacity})` : `rgba(176,28,28,${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    propsForLabels: { fontFamily: Typography.fontFamily.medium, fontSize: 10 },
  };

  const activeColor = scenarioColors[activeScenario];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#1a2a1a', Colors.forestGreen]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cost Analysis</Text>
        <Text style={styles.headerSub}>{farmer.farm} • {farmer.hectares} ha</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
      >
        {/* Summary cards */}
        <View style={styles.summaryCards}>
          <LinearGradient colors={[Colors.blightRed, '#8B0000']} style={styles.summaryCard}>
            <MaterialCommunityIcons name="trending-down" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.summaryCardValue}>${scenario.potentialLoss}</Text>
            <Text style={styles.summaryCardLabel}>Potential Loss</Text>
          </LinearGradient>
          <LinearGradient colors={[Colors.harvestOrange, '#B35900']} style={styles.summaryCard}>
            <MaterialCommunityIcons name="flask" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.summaryCardValue}>${scenario.treatmentCost}</Text>
            <Text style={styles.summaryCardLabel}>Treatment Cost</Text>
          </LinearGradient>
          <LinearGradient colors={[Colors.emerald, Colors.forestGreen]} style={styles.summaryCard}>
            <MaterialCommunityIcons name="trending-up" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.summaryCardValue}>${scenario.netSavings}</Text>
            <Text style={styles.summaryCardLabel}>Net Savings</Text>
          </LinearGradient>
        </View>

        {/* Scenario selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Risk Scenario</Text>
          <View style={styles.scenarioSelector}>
            {(['low', 'medium', 'high'] as const).map((s) => {
              const sc = costAnalysis.scenarios[s];
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.scenarioTab,
                    activeScenario === s && { backgroundColor: scenarioColors[s] + '20', borderColor: scenarioColors[s] },
                  ]}
                  onPress={() => setActiveScenario(s)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.scenarioDot, { backgroundColor: scenarioColors[s] }]} />
                  <Text style={[
                    styles.scenarioTabText,
                    activeScenario === s && { color: scenarioColors[s], fontFamily: Typography.fontFamily.semiBold },
                  ]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.scenarioLabel}>{scenario.label}</Text>
          <View style={styles.scenarioStats}>
            <View style={styles.scenarioStat}>
              <Text style={styles.scenarioStatLabel}>Yield Loss</Text>
              <Text style={[styles.scenarioStatValue, { color: activeColor }]}>
                {scenario.yieldLossTons} t/ha
              </Text>
            </View>
            <View style={styles.scenarioStatDivider} />
            <View style={styles.scenarioStat}>
              <Text style={styles.scenarioStatLabel}>Treatment ROI</Text>
              <Text style={[styles.scenarioStatValue, { color: Colors.springGreen }]}>
                {Math.round(scenario.netSavings / scenario.treatmentCost)}x
              </Text>
            </View>
            <View style={styles.scenarioStatDivider} />
            <View style={styles.scenarioStat}>
              <Text style={styles.scenarioStatLabel}>Break Even</Text>
              <Text style={styles.scenarioStatValue}>
                ${Math.round(scenario.treatmentCost / farmer.hectares)}/ha
              </Text>
            </View>
          </View>
        </View>

        {/* Cost breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          {scenario.breakdown.map((item, i) => (
            <View key={i} style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownBullet, { backgroundColor: activeColor + '20' }]}>
                  <MaterialCommunityIcons
                    name={i === 0 ? 'flask' : i === 1 ? 'account-hard-hat' : 'tools'}
                    size={14}
                    color={activeColor}
                  />
                </View>
                <Text style={styles.breakdownItem}>{item.item}</Text>
              </View>
              <Text style={[styles.breakdownCost, { color: activeColor }]}>${item.cost}</Text>
            </View>
          ))}
          <View style={styles.breakdownTotal}>
            <Text style={styles.breakdownTotalLabel}>Total Treatment Cost</Text>
            <Text style={[styles.breakdownTotalValue, { color: activeColor }]}>
              ${scenario.treatmentCost}
            </Text>
          </View>
        </View>

        {/* Bar chart */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cost vs Yield Loss — All Scenarios</Text>
          <Text style={styles.chartSub}>Treatment investment vs potential loss (USD)</Text>
          <BarChart
            data={{
              labels: costAnalysis.chartData.labels,
              datasets: [
                { data: costAnalysis.chartData.treatmentCosts },
                { data: costAnalysis.chartData.potentialLosses },
              ],
            }}
            width={width - 72}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            yAxisLabel="$"
            yAxisSuffix=""
            withInnerLines={false}
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.springGreen }]} />
              <Text style={styles.legendText}>Treatment Cost</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.blightRed }]} />
              <Text style={styles.legendText}>Potential Loss</Text>
            </View>
          </View>
        </View>

        {/* ROI insight */}
        <LinearGradient
          colors={[Colors.lightMint, Colors.bgCanvas]}
          style={styles.roiCard}
        >
          <View style={styles.roiHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={22} color={Colors.emerald} />
            <Text style={styles.roiTitle}>Financial Insight</Text>
          </View>
          <Text style={styles.roiText}>
            Every <Text style={styles.roiBold}>$1 spent on treatment</Text> saves{' '}
            <Text style={[styles.roiBold, { color: Colors.emerald }]}>
              ${Math.round(scenario.netSavings / scenario.treatmentCost)}
            </Text>{' '}
            in yield losses under the {activeScenario} risk scenario. Act early for maximum ROI.
          </Text>
        </LinearGradient>

        {/* Support programs */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support Programs</Text>
          {costAnalysis.supportPrograms.map((program, i) => (
            <View key={i} style={styles.programRow}>
              <View style={styles.programIconBg}>
                <MaterialCommunityIcons
                  name={program.type === 'Insurance' ? 'shield-account' : program.type === 'Grant' ? 'hand-coin' : 'account-supervisor'}
                  size={20}
                  color={Colors.emerald}
                />
              </View>
              <View style={styles.programContent}>
                <Text style={styles.programName}>{program.name}</Text>
                <Text style={styles.programType}>{program.type}</Text>
              </View>
              <TouchableOpacity style={styles.programCallBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="phone" size={16} color={Colors.emerald} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Download report */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.emerald, Colors.forestGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.downloadBtn}
          >
            <MaterialCommunityIcons name="file-chart" size={22} color={Colors.textWhite} />
            <Text style={styles.downloadBtnText}>Download Full Report</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    gap: 4,
    overflow: 'hidden',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    ...Shadows.md,
  },
  summaryCardValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  summaryCardLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    ...Shadows.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  scenarioSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  scenarioTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCanvas,
  },
  scenarioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scenarioTabText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  scenarioLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  scenarioStats: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCanvas,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  scenarioStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  scenarioStatLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  scenarioStatValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  scenarioStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  breakdownBullet: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownItem: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  breakdownCost: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
  breakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  breakdownTotalValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  chartSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    marginTop: -4,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
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
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  roiCard: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.mint,
  },
  roiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roiTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.emerald,
  },
  roiText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  roiBold: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  programIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightMint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programContent: {
    flex: 1,
    gap: 2,
  },
  programName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  programType: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  programCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightMint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtn: {
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  downloadBtnText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
  },
});
