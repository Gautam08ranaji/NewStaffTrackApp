import Card from "@/components/reusables/Card";
import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MonthlyTab() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      title={t("monthlyReport.title")}
      backgroundColor={theme.colors.colorBgPage}
      titleColor={theme.colors.colorPrimary600}
    >
      {/* Row 1 */}
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
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("monthlyReport.totalTasks")}
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
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("monthlyReport.solvedTasks")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.box,
            { backgroundColor: theme.colors.colorWarning100 },
          ]}
        >
          <Text
            style={[
              theme.typography.fontH3,
              { color: theme.colors.colorWarning600 },
            ]}
          >
            08
          </Text>
          <Text
            style={[
              theme.typography.fontTag,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("monthlyReport.followUp")}
          </Text>
        </TouchableOpacity>

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
            98%
          </Text>
          <Text
            style={[
              theme.typography.fontTag,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("monthlyReport.placeVisited")}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  box: {
    width: "48%",
    height: 100,
    borderRadius: 10,
    padding: 10,
  },
});
