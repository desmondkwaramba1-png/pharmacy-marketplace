import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import * as Haptics from 'expo-haptics';

const TAB_ICONS: Record<string, { active: string; inactive: string; label: string }> = {
  HomeTab: { active: 'home', inactive: 'home-outline', label: 'Home' },
  AlertsTab: { active: 'bell', inactive: 'bell-outline', label: 'Alerts' },
  ScanTab: { active: 'leaf', inactive: 'leaf', label: 'Scan' },
  WeatherTab: { active: 'cloud', inactive: 'cloud-outline', label: 'Weather' },
  ProfileTab: { active: 'account', inactive: 'account-outline', label: 'Profile' },
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;

  const handlePress = (route: any, index: number, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 300 }),
    ]).start();

    if (!isFocused) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 12 }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = route.name === 'ScanTab';
          const tabConfig = TAB_ICONS[route.name];

          if (!tabConfig) return null;

          if (isCenter) {
            return (
              <Animated.View
                key={route.key}
                style={[styles.centerButtonWrapper, { transform: [{ scale: scaleAnims[index] }] }]}
              >
                <TouchableOpacity
                  onPress={() => handlePress(route, index, isFocused)}
                  style={styles.centerButton}
                  activeOpacity={0.9}
                >
                  <MaterialCommunityIcons name="leaf-circle" size={32} color={Colors.textWhite} />
                  <Text style={styles.centerLabel}>Scan</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          }

          return (
            <Animated.View
              key={route.key}
              style={[styles.tabItem, { transform: [{ scale: scaleAnims[index] }] }]}
            >
              <TouchableOpacity
                onPress={() => handlePress(route, index, isFocused)}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <View style={isFocused ? styles.activeIndicator : null}>
                  <MaterialCommunityIcons
                    name={(isFocused ? tabConfig.active : tabConfig.inactive) as any}
                    size={22}
                    color={isFocused ? Colors.springGreen : Colors.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused && styles.activeTabLabel,
                  ]}
                >
                  {tabConfig.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    ...Shadows.tabBar,
  },
  tabItem: {
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  activeIndicator: {
    backgroundColor: Colors.lightMint,
    borderRadius: 10,
    padding: 4,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  activeTabLabel: {
    color: Colors.springGreen,
    fontFamily: Typography.fontFamily.semiBold,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.fab,
    borderWidth: 3,
    borderColor: Colors.cardBg,
    gap: 0,
  },
  centerLabel: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
    marginTop: 1,
  },
});
