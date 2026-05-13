import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface Props {
  confidence: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ConfidenceRing: React.FC<Props> = ({
  confidence,
  size = 120,
  strokeWidth = 10,
  color = Colors.springGreen,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: confidence,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    const listener = animValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });
    return () => animValue.removeListener(listener);
  }, [confidence]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  const bgColor = color + '25';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${strokeDashoffset}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={styles.centerContent}>
        <Text style={[styles.value, { color }]}>{displayValue}%</Text>
        <Text style={styles.label}>Confidence</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  value: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    lineHeight: 30,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
});
