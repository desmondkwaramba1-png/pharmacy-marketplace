import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, G, Ellipse, Text as SvgText } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: [string, string];
  illustration: React.FC;
}

const ScanIllustration = () => (
  <Svg width={200} height={180} viewBox="0 0 200 180">
    {/* Phone/tablet frame */}
    <Rect x="55" y="10" width="90" height="150" rx="14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
    <Rect x="63" y="22" width="74" height="100" rx="6" fill="rgba(255,255,255,0.1)" />
    {/* Leaf in screen */}
    <Ellipse cx="100" cy="72" rx="24" ry="32" fill="rgba(165,214,167,0.8)" />
    <Path d="M100 42 L100 102" stroke="rgba(27,94,32,0.6)" strokeWidth="2" strokeLinecap="round" />
    <Path d="M100 60 C100 60 88 66 86 72" stroke="rgba(27,94,32,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M100 75 C100 75 112 81 114 87" stroke="rgba(27,94,32,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Scan lines */}
    <Rect x="70" y="62" width="60" height="1.5" fill="rgba(255,255,255,0.7)" />
    <Rect x="70" y="82" width="60" height="1.5" fill="rgba(255,255,255,0.7)" />
    {/* Corner brackets */}
    <Path d="M70 48 L70 40 L78 40" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M130 48 L130 40 L122 40" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M70 98 L70 106 L78 106" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M130 98 L130 106 L122 106" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Result badge */}
    <Rect x="68" y="128" width="64" height="20" rx="10" fill="rgba(76,175,80,0.9)" />
    <G transform="translate(73,133)">
      <Path d="M0 7 L4 11 L11 4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>
    <Rect x="90" y="133" width="34" height="4" rx="2" fill="rgba(255,255,255,0.8)" />
    <Rect x="90" y="140" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
    {/* AI sparkles */}
    <Circle cx="45" cy="45" r="4" fill="rgba(255,255,255,0.6)" />
    <Circle cx="155" cy="65" r="6" fill="rgba(255,255,255,0.4)" />
    <Circle cx="38" cy="110" r="3" fill="rgba(255,255,255,0.5)" />
  </Svg>
);

const WeatherIllustration = () => (
  <Svg width={200} height={180} viewBox="0 0 200 180">
    {/* Cloud */}
    <Ellipse cx="100" cy="70" rx="45" ry="28" fill="rgba(255,255,255,0.3)" />
    <Ellipse cx="75" cy="80" rx="28" ry="20" fill="rgba(255,255,255,0.3)" />
    <Ellipse cx="125" cy="80" rx="28" ry="20" fill="rgba(255,255,255,0.3)" />
    <Rect x="55" y="80" width="90" height="20" rx="0" fill="rgba(255,255,255,0.3)" />
    {/* Rain drops */}
    <Path d="M75 108 L72 122" stroke="rgba(187,222,251,0.9)" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M90 112 L87 128" stroke="rgba(187,222,251,0.9)" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M105 108 L102 124" stroke="rgba(187,222,251,0.9)" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M120 112 L117 126" stroke="rgba(187,222,251,0.9)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Thermometer */}
    <Rect x="150" y="40" width="8" height="40" rx="4" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    <Circle cx="154" cy="84" r="8" fill="rgba(249,168,37,0.8)" />
    <Rect x="153" y="60" width="2" height="25" rx="1" fill="rgba(249,168,37,0.8)" />
    {/* Field/crop rows */}
    <Path d="M20 145 C30 135 40 145 50 135 C60 125 70 135 80 125" stroke="rgba(165,214,167,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <Path d="M25 160 C35 150 45 160 55 150 C65 140 75 150 85 140" stroke="rgba(165,214,167,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Warning badge */}
    <Rect x="100" y="130" width="80" height="36" rx="10" fill="rgba(239,108,0,0.85)" />
    <G transform="translate(110,138)">
      <Path d="M10 0 L20 18 L0 18 Z" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 7 L10 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="10" cy="15" r="1" fill="white" />
    </G>
    <Rect x="132" y="137" width="38" height="4" rx="2" fill="rgba(255,255,255,0.85)" />
    <Rect x="132" y="145" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
    <Rect x="132" y="152" width="34" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
  </Svg>
);

const IncomeIllustration = () => (
  <Svg width={200} height={180} viewBox="0 0 200 180">
    {/* Bar chart */}
    <Rect x="30" y="120" width="22" height="40" rx="4" fill="rgba(255,255,255,0.3)" />
    <Rect x="62" y="90" width="22" height="70" rx="4" fill="rgba(255,255,255,0.5)" />
    <Rect x="94" y="60" width="22" height="100" rx="4" fill="rgba(255,255,255,0.7)" />
    <Rect x="126" y="40" width="22" height="120" rx="4" fill="rgba(255,255,255,0.9)" />
    <Rect x="158" y="20" width="22" height="140" rx="4" fill="rgba(165,214,167,0.9)" />
    {/* Chart baseline */}
    <Path d="M25 162 L188 162" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    {/* Trend arrow */}
    <Path d="M35 118 L75 88 L107 58 L139 38 L171 18" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Coin/dollar */}
    <Circle cx="50" cy="48" r="22" fill="rgba(249,168,37,0.85)" />
    <SvgText fill="white" fontSize="18" fontWeight="bold" x="41" y="55" fontFamily="sans-serif">$</SvgText>
    {/* Leaf badge */}
    <Circle cx="160" cy="50" r="15" fill="rgba(46,125,50,0.8)" />
    <Path d="M160 38 C160 38 150 43 150 52 C150 58 155 62 160 63 C165 62 170 58 170 52 C170 43 160 38 160 38 Z" fill="rgba(255,255,255,0.85)" />
    {/* Farmer silhouette */}
    <Circle cx="100" cy="20" r="8" fill="rgba(255,255,255,0.5)" />
    <Path d="M92 35 C92 28 108 28 108 35 L108 50 L92 50 Z" fill="rgba(255,255,255,0.4)" />
  </Svg>
);

const slides: Slide[] = [
  {
    id: '1',
    title: 'AI Disease\nDetection',
    subtitle: 'Scan • Detect • Act',
    description:
      'Point your camera at any crop leaf. Our AI instantly identifies diseases with up to 95% accuracy and tells you exactly what to do.',
    icon: 'leaf-circle',
    gradient: [Colors.forestGreen, '#1a4a30'],
    illustration: ScanIllustration,
  },
  {
    id: '2',
    title: 'Weather-Powered\nRisk Alerts',
    subtitle: 'Predict • Prepare • Protect',
    description:
      'Stay ahead of outbreaks. Real-time weather analysis predicts disease risk up to 7 days in advance so you can protect your crops.',
    icon: 'weather-lightning-rainy',
    gradient: [Colors.deepBlue, Colors.oceanBlue],
    illustration: WeatherIllustration,
  },
  {
    id: '3',
    title: 'Protect Your\nIncome',
    subtitle: 'Track • Analyse • Save',
    description:
      'Know exactly what every disease costs you. Get treatment ROI, financial projections, and connect to Zimbabwe agri-insurance programs.',
    icon: 'cash-multiple',
    gradient: ['#4a2800', '#7b4a00'],
    illustration: IncomeIllustration,
  },
];

interface Props {
  navigation: any;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            {/* Decorative circles */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Skip button */}
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <item.illustration />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </LinearGradient>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            activeIndex === slides.length - 1 && styles.getStartedButton,
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          {activeIndex === slides.length - 1 ? (
            <Text style={styles.getStartedText}>Get Started</Text>
          ) : (
            <MaterialCommunityIcons name="arrow-right" size={24} color={Colors.textWhite} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.forestGreen,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 80,
    left: -60,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  skipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
    textAlign: 'center',
    lineHeight: 36,
  },
  description: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textWhite,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  getStartedButton: {
    width: 160,
    borderRadius: 28,
    backgroundColor: Colors.springGreen,
    borderColor: Colors.mint,
  },
  getStartedText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
  },
});
