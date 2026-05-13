import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { ConfidenceRing } from '../components/ConfidenceRing';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: any;
}

export const ResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const disease = route.params?.disease || {
    name: 'Gray Leaf Spot',
    pathogen: 'Cercospora zeae-maydis',
    crop: 'Maize',
    confidence: 87,
    severity: 'Moderate',
    severityColor: '#F9A825',
    yieldLoss: '12–18%',
    treatment: 'Apply Mancozeb (2g/L) or Propiconazole (0.5ml/L). Repeat every 14 days during wet season.',
    prevention: [
      'Use resistant hybrid varieties (SC403, SC513)',
      'Practice 2-year crop rotation with legumes',
      'Ensure adequate plant spacing for airflow',
    ],
    regionalCases: 47,
    provinces: ['Mashonaland Central', 'Manicaland'],
  };

  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 120 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 12 }),
    ]).start();
  }, []);

  const severityBg = disease.severityColor + '20';
  const isHealthy = disease.severity === 'Healthy';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Image area */}
      <LinearGradient
        colors={isHealthy ? [Colors.forestGreen, Colors.emerald] : [Colors.forestGreen, '#2d1a00']}
        style={styles.imageArea}
      >
        {/* Decorative leaf pattern bg */}
        <View style={styles.patternBg}>
          {[...Array(12)].map((_, i) => (
            <View key={i} style={[styles.patternDot, { top: Math.random() * 200, left: Math.random() * width, opacity: 0.08 }]} />
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textWhite} />
        </TouchableOpacity>

        <View style={styles.imageAreaContent}>
          <View style={styles.leafIconBg}>
            <MaterialCommunityIcons
              name={isHealthy ? 'leaf-circle' : 'alert-decagram'}
              size={64}
              color={isHealthy ? Colors.springGreen : disease.severityColor}
            />
          </View>
          <Text style={styles.cropLabel}>{disease.crop} Leaf Analysis</Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main result card */}
        <Animated.View
          style={[
            styles.resultCard,
            { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
          ]}
        >
          {/* Disease header */}
          <View style={styles.diseaseHeader}>
            <View style={styles.diseaseNameBlock}>
              <Text style={styles.diseaseName}>{disease.name}</Text>
              <Text style={styles.pathogenName}>{disease.pathogen}</Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
              <View style={[styles.severityDot, { backgroundColor: disease.severityColor }]} />
              <Text style={[styles.severityText, { color: disease.severityColor }]}>
                {disease.severity}
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ConfidenceRing
                confidence={disease.confidence}
                size={100}
                strokeWidth={9}
                color={isHealthy ? Colors.springGreen : disease.severityColor}
              />
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.rightStats}>
              <View style={styles.rightStat}>
                <Text style={styles.rightStatLabel}>Yield Loss Risk</Text>
                <Text style={[styles.rightStatValue, { color: disease.severityColor }]}>
                  {disease.yieldLoss}
                </Text>
              </View>
              <View style={styles.rightStat}>
                <Text style={styles.rightStatLabel}>Regional Cases</Text>
                <Text style={styles.rightStatValue}>{disease.regionalCases}</Text>
              </View>
              <View style={styles.rightStat}>
                <Text style={styles.rightStatLabel}>Affected Crop</Text>
                <Text style={styles.rightStatValue}>{disease.crop}</Text>
              </View>
            </View>
          </View>

          {/* Regional spread */}
          <View style={styles.regionRow}>
            <MaterialCommunityIcons name="map-marker-multiple" size={16} color={Colors.textMuted} />
            <Text style={styles.regionText}>
              Reported in: {disease.provinces.join(' • ')}
            </Text>
          </View>
        </Animated.View>

        {/* Treatment card */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailIconBg, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="flask" size={20} color={Colors.skyBlue} />
            </View>
            <Text style={styles.detailTitle}>Recommended Treatment</Text>
          </View>
          <Text style={styles.treatmentText}>{disease.treatment}</Text>
          <View style={styles.treatmentWarning}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.goldenWheat} />
            <Text style={styles.treatmentWarningText}>Apply within 48 hours for best results</Text>
          </View>
        </View>

        {/* Prevention card */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailIconBg, { backgroundColor: Colors.lightMint }]}>
              <MaterialCommunityIcons name="shield-check" size={20} color={Colors.emerald} />
            </View>
            <Text style={styles.detailTitle}>Prevention Tips</Text>
          </View>
          {disease.prevention.map((tip: string, i: number) => (
            <View key={i} style={styles.preventionRow}>
              <View style={styles.preventionBullet}>
                <Text style={styles.preventionBulletText}>{i + 1}</Text>
              </View>
              <Text style={styles.preventionText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Community cases */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailIconBg, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="account-group" size={20} color={Colors.harvestOrange} />
            </View>
            <Text style={styles.detailTitle}>In Your Region</Text>
          </View>
          <View style={styles.communityStats}>
            <View style={styles.communityStat}>
              <Text style={styles.communityStatValue}>{disease.regionalCases}</Text>
              <Text style={styles.communityStatLabel}>Cases this month</Text>
            </View>
            <View style={styles.communityStat}>
              <Text style={styles.communityStatValue}>{disease.provinces.length}</Text>
              <Text style={styles.communityStatLabel}>Provinces affected</Text>
            </View>
            <View style={styles.communityStat}>
              <Text style={[styles.communityStatValue, { color: Colors.harvestOrange }]}>↑ 18%</Text>
              <Text style={styles.communityStatLabel}>vs last month</Text>
            </View>
          </View>
          <Text style={styles.communityNote}>
            {disease.regionalCases} similar cases reported across {disease.provinces[0]} this month. Disease pressure is {disease.severity.toLowerCase()}.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="content-save" size={20} color={Colors.emerald} />
            <Text style={styles.secondaryBtnText}>Save Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="share-variant" size={20} color={Colors.skyBlue} />
            <Text style={[styles.secondaryBtnText, { color: Colors.skyBlue }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.emerald, Colors.forestGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <MaterialCommunityIcons name="message-text" size={20} color={Colors.textWhite} />
            <Text style={styles.primaryBtnText}>Get Treatment Advice</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgCanvas,
  },
  imageArea: {
    height: 200,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  patternBg: {
    ...StyleSheet.absoluteFillObject,
  },
  patternDot: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.textWhite,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAreaContent: {
    alignItems: 'center',
    paddingBottom: 20,
    gap: 8,
  },
  leafIconBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cropLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  resultCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    ...Shadows.card,
    marginTop: -30,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diseaseNameBlock: {
    flex: 1,
    gap: 3,
  },
  diseaseName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  pathogenName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    height: 80,
    backgroundColor: Colors.border,
  },
  rightStats: {
    flex: 1,
    gap: 10,
  },
  rightStat: {
    gap: 1,
  },
  rightStatLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rightStatValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCanvas,
    borderRadius: 10,
    padding: 10,
  },
  regionText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  detailCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    ...Shadows.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  treatmentText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  treatmentWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 10,
  },
  treatmentWarningText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.goldenWheat,
  },
  preventionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  preventionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lightMint,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  preventionBulletText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.emerald,
  },
  preventionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgCanvas,
    borderRadius: 12,
    padding: 14,
  },
  communityStat: {
    alignItems: 'center',
    gap: 3,
  },
  communityStatValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  communityStatLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  communityNote: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    backgroundColor: Colors.cardBg,
  },
  secondaryBtnText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.emerald,
  },
  primaryBtn: {
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  primaryBtnText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
  },
});
