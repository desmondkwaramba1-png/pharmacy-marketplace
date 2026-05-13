import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { CropBadge } from '../components/CropBadge';
import { farmer, notifications as defaultNotifications, crops } from '../data/mockData';

interface Props {
  navigation: any;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState({
    diseaseAlerts: defaultNotifications.diseaseAlerts,
    weatherWarnings: defaultNotifications.weatherWarnings,
    marketUpdates: defaultNotifications.marketUpdates,
    weeklyReports: defaultNotifications.weeklyReports,
    communityReports: defaultNotifications.communityReports,
  });
  const [offlineSync, setOfflineSync] = useState(true);
  const [language, setLanguage] = useState<'English' | 'Shona' | 'Ndebele'>('English');

  const toggleNotif = (key: keyof typeof notifs) => {
    Haptics.selectionAsync();
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of AgriGuard AI?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  const farmerCrops = crops.filter((c) => farmer.crops.map((fc) => fc.toLowerCase()).includes(c.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Profile header */}
      <LinearGradient colors={[Colors.forestGreen, Colors.emerald]} style={styles.profileHeader}>
        <View style={styles.bgCircle} />
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={[Colors.mint, Colors.springGreen]} style={styles.avatar}>
              <Text style={styles.avatarText}>{farmer.initials}</Text>
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-circle" size={18} color={Colors.springGreen} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{farmer.name}</Text>
            <Text style={styles.profileFarm}>{farmer.farm}</Text>
            <View style={styles.profileLocationRow}>
              <MaterialCommunityIcons name="map-marker" size={12} color={Colors.mint} />
              <Text style={styles.profileLocation}>{farmer.district}, {farmer.province}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="pencil" size={16} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>

        {/* Stats chips */}
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{farmer.totalScans}</Text>
            <Text style={styles.profileStatLabel}>Scans</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{farmer.hectares} ha</Text>
            <Text style={styles.profileStatLabel}>Farm Size</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>${farmer.savedIncome}</Text>
            <Text style={styles.profileStatLabel}>Income Saved</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{farmer.season}</Text>
            <Text style={styles.profileStatLabel}>Season</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
      >
        {/* Farm details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Farm Details</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="sprout" size={18} color={Colors.emerald} />
            <Text style={styles.detailLabel}>Primary Crops</Text>
          </View>
          <View style={styles.cropsRow}>
            {farmerCrops.map((crop) => (
              <CropBadge key={crop.id} label={crop.label} icon={crop.icon} selected small />
            ))}
          </View>
          {[
            { icon: 'resize', label: 'Farm Area', value: `${farmer.hectares} hectares` },
            { icon: 'map-marker', label: 'District', value: farmer.district },
            { icon: 'account', label: 'Member Since', value: farmer.memberSince },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <MaterialCommunityIcons name={item.icon as any} size={16} color={Colors.textMuted} />
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {[
            { key: 'diseaseAlerts' as const, icon: 'alert-circle', label: 'Disease Alerts', desc: 'New outbreak warnings near you' },
            { key: 'weatherWarnings' as const, icon: 'weather-lightning-rainy', label: 'Weather Warnings', desc: 'High-risk weather forecasts' },
            { key: 'marketUpdates' as const, icon: 'chart-line', label: 'Market Updates', desc: 'Crop price & input cost updates' },
            { key: 'weeklyReports' as const, icon: 'file-chart', label: 'Weekly Reports', desc: 'Summary of farm health stats' },
            { key: 'communityReports' as const, icon: 'account-group', label: 'Community Reports', desc: 'Disease reports from nearby farmers' },
          ].map((notif) => (
            <View key={notif.key} style={styles.toggleRow}>
              <View style={[styles.toggleIconBg, { backgroundColor: notifs[notif.key] ? Colors.lightMint : Colors.bgCanvas }]}>
                <MaterialCommunityIcons
                  name={notif.icon as any}
                  size={18}
                  color={notifs[notif.key] ? Colors.emerald : Colors.textMuted}
                />
              </View>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>{notif.label}</Text>
                <Text style={styles.toggleDesc}>{notif.desc}</Text>
              </View>
              <Switch
                value={notifs[notif.key]}
                onValueChange={() => toggleNotif(notif.key)}
                trackColor={{ false: Colors.border, true: Colors.mint }}
                thumbColor={notifs[notif.key] ? Colors.emerald : Colors.textMuted}
              />
            </View>
          ))}
        </View>

        {/* App preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          {/* Language */}
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <MaterialCommunityIcons name="translate" size={18} color={Colors.textMuted} />
              <Text style={styles.prefLabel}>Language</Text>
            </View>
            <View style={styles.languageSelector}>
              {(['English', 'Shona', 'Ndebele'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langTab, language === lang && styles.langTabActive]}
                  onPress={() => setLanguage(lang)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langTabText, language === lang && styles.langTabTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Offline sync */}
          <View style={styles.toggleRow}>
            <View style={[styles.toggleIconBg, { backgroundColor: offlineSync ? Colors.lightMint : Colors.bgCanvas }]}>
              <MaterialCommunityIcons
                name="wifi-sync"
                size={18}
                color={offlineSync ? Colors.emerald : Colors.textMuted}
              />
            </View>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>Offline Mode</Text>
              <Text style={styles.toggleDesc}>
                {offlineSync ? 'Last synced: Today, 9:14 AM' : 'Offline sync disabled'}
              </Text>
            </View>
            <Switch
              value={offlineSync}
              onValueChange={() => setOfflineSync(!offlineSync)}
              trackColor={{ false: Colors.border, true: Colors.mint }}
              thumbColor={offlineSync ? Colors.emerald : Colors.textMuted}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support</Text>
          {[
            { icon: 'help-circle-outline', label: 'Help Center', color: Colors.skyBlue },
            { icon: 'bug-outline', label: 'Report a Bug', color: Colors.harvestOrange },
            { icon: 'star-outline', label: 'Rate AgriGuard AI', color: Colors.goldenWheat },
            { icon: 'information-outline', label: 'About', color: Colors.textMuted },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuRow} activeOpacity={0.8}>
              <View style={[styles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.8}>
            <View style={[styles.menuIconBg, { backgroundColor: Colors.lightBlue }]}>
              <MaterialCommunityIcons name="lock-reset" size={18} color={Colors.skyBlue} />
            </View>
            <Text style={styles.menuLabel}>Change Password</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={handleLogout} activeOpacity={0.8}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="logout" size={18} color={Colors.blightRed} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors.blightRed }]}>Sign Out</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.blightRed} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AgriGuard AI v1.0.0</Text>
          <Text style={styles.footerSub}>Made with ❤️ for Zimbabwean Farmers</Text>
          <Text style={styles.footerSub}>University of Zimbabwe Innovation Week 2024</Text>
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
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    overflow: 'hidden',
    gap: 16,
  },
  bgCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -70,
    right: -50,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: 'rgba(255,255,255,0.8)',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.forestGreen,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  profileFarm: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.75)',
  },
  profileLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  profileLocation: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.mint,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  profileStatValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  profileStatLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.6)',
  },
  profileStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
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
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  cropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  toggleIconBg: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContent: {
    flex: 1,
    gap: 1,
  },
  toggleLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  toggleDesc: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  langTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.bgCanvas,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langTabActive: {
    backgroundColor: Colors.lightMint,
    borderColor: Colors.emerald,
  },
  langTabText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  langTabTextActive: {
    color: Colors.emerald,
    fontFamily: Typography.fontFamily.semiBold,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textMuted,
  },
  footerSub: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
});
