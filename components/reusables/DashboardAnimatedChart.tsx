import { useTheme } from "@/theme/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

type Props = {
  closed: number;
  open: number;
  inProgress: number;
};

export default function DashboardAnimatedChart({
  closed,
  open,
  inProgress,
}: Props) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [chartData, setChartData] = useState([0, 0, 0]);

  useEffect(() => {
    setChartData([closed, open, inProgress]);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [closed, open, inProgress]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          backgroundColor: theme.colors.colorBgPage,
        },
      ]}
    >
      {/* ✅ Heading inside card */}
      <Text
        style={[
          theme.typography.fontH6,
          { color: theme.colors.colorPrimary600, marginBottom: 8 },
        ]}
      >
        Case Performance Trend
      </Text>

      {/* ✅ Chart */}
      <LineChart
        data={{
          labels: ["Closed", "Open", "Progress"],
          datasets: [{ data: chartData }],
        }}
        width={screenWidth - 60} // smaller to fit card padding
        height={220}
        yAxisInterval={1}
        bezier
        chartConfig={{
          backgroundGradientFrom: theme.colors.colorBgPage,
          backgroundGradientTo: theme.colors.colorBgPage,
          decimalPlaces: 0,
          color: () => theme.colors.colorPrimary600,
          labelColor: () => theme.colors.colorTextSecondary,
        }}
        style={styles.chart}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
    elevation: 2,
  },

  chart: {
    borderRadius: 16,
  },
});
