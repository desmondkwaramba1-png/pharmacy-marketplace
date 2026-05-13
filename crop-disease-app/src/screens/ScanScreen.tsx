import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { diseases } from '../data/mockData';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.72;

const CornerBracket = ({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const size = 30;
  const strokeWidth = 3;
  const isLeft = corner.includes('l');
  const isTop = corner.includes('t');
  const x1 = isLeft ? 0 : size;
  const y1 = isTop ? 0 : size;
  const x2Mid = isLeft ? size : 0;
  const y2Mid = isTop ? size : 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={isLeft && isTop
          ? `M ${strokeWidth} ${size} L ${strokeWidth} ${strokeWidth} L ${size} ${strokeWidth}`
          : isLeft && !isTop
          ? `M ${strokeWidth} 0 L ${strokeWidth} ${size - strokeWidth} L ${size} ${size - strokeWidth}`
          : !isLeft && isTop
          ? `M ${size - strokeWidth} ${size} L ${size - strokeWidth} ${strokeWidth} L 0 ${strokeWidth}`
          : `M ${size - strokeWidth} 0 L ${size - strokeWidth} ${size - strokeWidth} L 0 ${size - strokeWidth}`
        }
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

interface Props {
  navigation: any;
}

export const ScanScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [flashOn, setFlashOn] = useState(false);

  const captureScale = useRef(new Animated.Value(1)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;
  const analyzeProgress = useRef(new Animated.Value(0)).current;

  const analyzeSteps = [
    'Preprocessing image...',
    'Extracting leaf features...',
    'Running AI diagnosis...',
    'Generating report...',
  ];

  // Animate scan line
  React.useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: FRAME_SIZE - 2, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, []);

  const pickFromGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(captureScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(captureScale, { toValue: 1, useNativeDriver: true, damping: 8 }),
    ]).start();
    // Simulate capture — in production this would use expo-camera ref
    setCapturedImage('mock://captured');
  };

  const handleAnalyze = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsAnalyzing(true);
    setAnalyzeStep(0);

    // Simulate AI processing steps
    for (let i = 0; i < analyzeSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setAnalyzeStep(i + 1);
      Animated.timing(analyzeProgress, {
        toValue: (i + 1) / analyzeSteps.length,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }

    await new Promise((r) => setTimeout(r, 400));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsAnalyzing(false);

    // Navigate with mock result
    navigation.navigate('Results', { disease: diseases[0] });
  };

  const retake = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    setAnalyzeStep(0);
    analyzeProgress.setValue(0);
  };

  const progressBarWidth = analyzeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 80],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Camera or image preview */}
      {capturedImage && capturedImage !== 'mock://captured' ? (
        <Image source={{ uri: capturedImage }} style={styles.camera} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={['#0a1a0f', '#0d2a1a', '#0a1525']}
          style={styles.camera}
        >
          {/* Simulated camera viewfinder with green tint */}
          <View style={styles.cameraSimOverlay}>
            {/* Grid lines */}
            <View style={styles.gridLine1} />
            <View style={styles.gridLine2} />
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
          </View>
        </LinearGradient>
      )}

      {/* Scan overlay */}
      {!capturedImage && (
        <View style={styles.scanOverlay}>
          {/* Dark corners */}
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            {/* Scan frame */}
            <View style={styles.scanFrame}>
              {/* Corner brackets */}
              <View style={styles.cornerTL}><CornerBracket corner="tl" /></View>
              <View style={styles.cornerTR}><CornerBracket corner="tr" /></View>
              <View style={styles.cornerBL}><CornerBracket corner="bl" /></View>
              <View style={styles.cornerBR}><CornerBracket corner="br" /></View>
              {/* Animated scan line */}
              <Animated.View
                style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
              />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />

          {/* Instruction text */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Position leaf within frame</Text>
            <Text style={styles.instructionSub}>Ensure good lighting • Fill the frame</Text>
          </View>
        </View>
      )}

      {/* Captured image overlay */}
      {capturedImage && !isAnalyzing && (
        <View style={styles.capturedOverlay}>
          <View style={[styles.capturedFrame, styles.scanFrame]}>
            <View style={styles.cornerTL}><CornerBracket corner="tl" /></View>
            <View style={styles.cornerTR}><CornerBracket corner="tr" /></View>
            <View style={styles.cornerBL}><CornerBracket corner="bl" /></View>
            <View style={styles.cornerBR}><CornerBracket corner="br" /></View>
          </View>
          <View style={styles.capturedChip}>
            <MaterialCommunityIcons name="check-circle" size={16} color={Colors.springGreen} />
            <Text style={styles.capturedChipText}>Image captured — ready to analyze</Text>
          </View>
        </View>
      )}

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <View style={styles.analyzingOverlay}>
          <View style={styles.analyzingCard}>
            <View style={styles.analyzingIconBg}>
              <MaterialCommunityIcons name="brain" size={36} color={Colors.springGreen} />
            </View>
            <Text style={styles.analyzingTitle}>Analyzing...</Text>
            <Text style={styles.analyzingStep}>{analyzeSteps[Math.max(0, analyzeStep - 1)]}</Text>
            <View style={styles.analyzeTrack}>
              <Animated.View style={[styles.analyzeBar, { width: progressBarWidth }]} />
            </View>
            <Text style={styles.analyzeStepCount}>{analyzeStep}/{analyzeSteps.length}</Text>
          </View>
        </View>
      )}

      {/* Top bar */}
      <BlurView intensity={40} style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Crop Scanner</Text>
        <TouchableOpacity
          onPress={() => setFlashOn(!flashOn)}
          style={[styles.topBtn, flashOn && styles.topBtnActive]}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={flashOn ? 'flash' : 'flash-off'}
            size={22}
            color={Colors.textWhite}
          />
        </TouchableOpacity>
      </BlurView>

      {/* Bottom controls */}
      <BlurView intensity={60} style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {capturedImage ? (
          <View style={styles.capturedControls}>
            <TouchableOpacity onPress={retake} style={styles.retakeBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera-retake" size={20} color={Colors.textWhite} />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAnalyze} activeOpacity={0.85} disabled={isAnalyzing}>
              <LinearGradient
                colors={[Colors.springGreen, Colors.emerald]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeButton}
              >
                <MaterialCommunityIcons name="brain" size={22} color={Colors.textWhite} />
                <Text style={styles.analyzeButtonText}>Analyze Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraControls}>
            {/* Gallery */}
            <TouchableOpacity onPress={pickFromGallery} style={styles.galleryBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="image-multiple" size={26} color={Colors.textWhite} />
              <Text style={styles.galleryBtnText}>Gallery</Text>
            </TouchableOpacity>

            {/* Capture */}
            <Animated.View style={{ transform: [{ scale: captureScale }] }}>
              <TouchableOpacity onPress={handleCapture} style={styles.captureOuter} activeOpacity={0.9}>
                <View style={styles.captureInner}>
                  <MaterialCommunityIcons name="leaf" size={28} color={Colors.emerald} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Tips */}
            <TouchableOpacity style={styles.tipsBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="help-circle-outline" size={26} color={Colors.textWhite} />
              <Text style={styles.galleryBtnText}>Tips</Text>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraSimOverlay: {
    flex: 1,
  },
  gridLine1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridLine2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    height: (height - FRAME_SIZE) / 2 - 40,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
  },
  capturedFrame: {
    borderWidth: 0,
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(76,175,80,0.8)',
    shadowColor: Colors.springGreen,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  instructionText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  instructionSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.65)',
  },
  capturedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: FRAME_SIZE / 2 + 20,
  },
  capturedChipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textWhite,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 80,
    gap: 12,
  },
  analyzingIconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.lightMint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  analyzingTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  analyzingStep: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  analyzeTrack: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.bgCanvas,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  analyzeBar: {
    height: '100%',
    backgroundColor: Colors.springGreen,
    borderRadius: 3,
  },
  analyzeStepCount: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBtnActive: {
    backgroundColor: Colors.goldenWheat,
  },
  topTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryBtn: {
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
  tipsBtn: {
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
  galleryBtnText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.75)',
  },
  captureOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  retakeBtnText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textWhite,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  analyzeButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
  },
});
