import { useTheme } from "@/theme/ThemeContext";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  percentage: number;
  label: string;
  size?: number;
  strokeWidth?: number;
};

export default function CircularKPIChart({
  percentage,
  label,
  size = 110,
  strokeWidth = 10,
}: Props) {
  const { theme } = useTheme();

  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke="#e5e7eb"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Animated progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.colorPrimary600}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center text */}
      <View style={styles.center}>
        <Text style={styles.percent}>{percentage.toFixed(0)}%</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    position: "absolute",
    alignItems: "center",
  },

  percent: {
    fontSize: 18,
    fontWeight: "700",
  },

  label: {
    fontSize: 12,
    color: "#6b7280",
  },
});
