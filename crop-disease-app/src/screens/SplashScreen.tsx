import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const AgriGuardLogo = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Shield background */}
    <Path
      d="M50 5 L85 20 L85 55 C85 75 65 90 50 95 C35 90 15 75 15 55 L15 20 Z"
      fill="rgba(255,255,255,0.2)"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
    />
    {/* Leaf */}
    <Path
      d="M50 25 C50 25 30 35 30 55 C30 70 40 78 50 80 C60 78 70 70 70 55 C70 35 50 25 50 25 Z"
      fill="rgba(255,255,255,0.9)"
    />
    {/* Leaf vein */}
    <Path
      d="M50 30 L50 75"
      stroke="rgba(27,94,32,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M50 45 C50 45 40 50 38 55"
      stroke="rgba(27,94,32,0.4)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M50 52 C50 52 60 57 62 62"
      stroke="rgba(27,94,32,0.4)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* AI scan lines */}
    <G opacity={0.7}>
      <Path d="M35 55 L65 55" stroke="rgba(255,255,255,0.8)" strokeWidth="1" strokeDasharray="3,3" />
      <Circle cx="65" cy="55" r="3" fill="rgba(255,255,255,0.9)" />
    </G>
  </Svg>
);

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(150),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(progressOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(progressWidth, { toValue: width * 0.55, duration: 1400, useNativeDriver: false }),
    ]).start(() => {
      setTimeout(() => navigation.replace('Onboarding'), 400);
    });
  }, []);

  return (
    <LinearGradient
      colors={[Colors.forestGreen, '#1a3a6b', Colors.oceanBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Background decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoBg}>
          <AgriGuardLogo size={72} />
        </View>
      </Animated.View>

      {/* Brand text */}
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textTranslate }] }}>
        <Text style={styles.appName}>AgriGuard</Text>
        <Text style={styles.aiSuffix}> AI</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Protect. Predict. Prosper.
      </Animated.Text>

      {/* Loading bar */}
      <Animated.View style={[styles.progressContainer, { opacity: progressOpacity }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingText}>Initializing AI models...</Text>
      </Animated.View>

      {/* Powered by */}
      <View style={styles.poweredBy}>
        <Text style={styles.poweredByText}>Made for Zimbabwean Farmers</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -80,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 50,
    left: -60,
  },
  circle3: {
    width: 150,
    height: 150,
    bottom: 200,
    right: -30,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  logoContainer: {
    marginBottom: 28,
  },
  logoBg: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  appName: {
    fontSize: 38,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  aiSuffix: {
    fontSize: 38,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.mint,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: -38,
    marginLeft: 178,
  },
  tagline: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    width: width * 0.55,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.mint,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  poweredBy: {
    position: 'absolute',
    bottom: 40,
  },
  poweredByText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
