import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface Props {
  score: number; // 0–100
  level: string;
  color: string;
  size?: number;
}

export const RiskGauge: React.FC<Props> = ({ score, level, color, size = 140 }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.58;
  const strokeWidth = size * 0.1;
  const circumference = Math.PI * radius;

  const bgColor = color + '30';

  const scoreSegments = [
    { label: 'LOW', startAngle: 180, endAngle: 225, color: Colors.safeGreen },
    { label: 'MED', startAngle: 225, endAngle: 270, color: Colors.goldenWheat },
    { label: 'HIGH', startAngle: 270, endAngle: 315, color: Colors.harvestOrange },
    { label: 'CRIT', startAngle: 315, endAngle: 360, color: Colors.blightRed },
  ];

  const dashOffset = circumference - (score / 100) * circumference;
  const angle = 180 + (score / 100) * 180;
  const needleRad = (angle * Math.PI) / 180;
  const needleLength = radius * 0.85;
  const nx = cx + needleLength * Math.cos(needleRad - Math.PI);
  const ny = cy + needleLength * Math.sin(needleRad - Math.PI);

  return (
    <View style={[styles.container, { width: size }]}>
      <Svg width={size} height={size * 0.7}>
        {/* Background arc */}
        <Path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <Path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${dashOffset}`}
        />
        {/* Needle */}
        <G>
          <Path
            d={`M ${cx} ${cy} L ${nx} ${ny}`}
            stroke={Colors.textPrimary}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Circle cx={cx} cy={cy} r={6} fill={Colors.textPrimary} />
          <Circle cx={cx} cy={cy} r={3} fill={Colors.cardBg} />
        </G>
      </Svg>
      <View style={[styles.badge, { backgroundColor: bgColor, borderColor: color }]}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        <Text style={[styles.level, { color }]}>{level}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    marginTop: -16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  score: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    lineHeight: 28,
  },
  level: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1,
  },
});
