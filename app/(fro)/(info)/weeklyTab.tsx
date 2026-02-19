import Card from "@/components/reusables/Card";
import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function WeeklyTab() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const weeklyData = [
    { value: 2, label: t("weeklyReport.days.mon") },
    { value: 5, label: t("weeklyReport.days.tue") },
    { value: 3, label: t("weeklyReport.days.wed") },
    { value: 8, label: t("weeklyReport.days.thu") },
    { value: 6, label: t("weeklyReport.days.fri") },
    { value: 4, label: t("weeklyReport.days.sat") },
    { value: 7, label: t("weeklyReport.days.sun") },
  ];

  return (
    <Card
      title={t("weeklyReport.title")}
      backgroundColor={theme.colors.colorBgPage}
      titleColor={theme.colors.colorPrimary600}
    >
      {/* --- GRAPH --- */}
      <View style={styles.graphContainer}>
        <LineChart
          data={weeklyData}
          curved
          thickness={3}
          color={theme.colors.colorPrimary600}
          hideDataPoints
          areaChart
          startFillColor={theme.colors.colorPrimary100}
          endFillColor="transparent"
          yAxisThickness={0}
          xAxisThickness={0}
        />
      </View>

      {/* --- BOXES --- */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.box,
            { backgroundColor: theme.colors.validationInfoBg },
          ]}
        >
          <Text
            style={[
              theme.typography.fontH3,
              { color: theme.colors.validationInfoText },
            ]}
          >
            12
          </Text>
          <Text
            style={[
              theme.typography.fontTag,
              { color: theme.colors.colorTextSecondary, marginTop: 10 },
            ]}
          >
            {t("weeklyReport.totalTasks")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.box,
            { backgroundColor: theme.colors.colorSuccess100 },
          ]}
        >
          <Text
            style={[
              theme.typography.fontH3,
              { color: theme.colors.colorSuccess600 },
            ]}
          >
            34
          </Text>
          <Text
            style={[
              theme.typography.fontTag,
              { color: theme.colors.colorTextSecondary, marginTop: 10 },
            ]}
          >
            {t("weeklyReport.solvedTasks")}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  graphContainer: {
    height: 200,
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  box: {
    width: "48%",
    height: 100,
    borderRadius: 10,
    padding: 10,
  },
});
