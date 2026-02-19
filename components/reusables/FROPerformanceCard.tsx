import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

type Props = {
  total: number;
  closed: number;
  open: number;
  inProgress: number;
};

export default function FROPerformanceGraph({
  total,
  closed,
  open,
  inProgress,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const chartWidth = width - 32; // responsive padding

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.colorBgPage }]}>
      <Text
        style={[
          theme.typography.fontH5,
          { color: theme.colors.colorPrimary600 },
        ]}
      >
        Case Performance Day Wise
      </Text>

      <LineChart
        data={{
          labels: ["Total", "Closed", "Open", "Progress"],
          datasets: [{ data: [total, closed, open, inProgress] }],
        }}
        width={chartWidth}
        height={width > 400 ? 220 : 180} // smaller phones
        yAxisInterval={1}
        chartConfig={{
          backgroundGradientFrom: theme.colors.colorBgPage,
          backgroundGradientTo: theme.colors.colorBgPage,
          decimalPlaces: 0,
          color: () => theme.colors.colorPrimary600,
          labelColor: () => theme.colors.colorTextSecondary,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
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
    alignSelf: "center",
  },
});
