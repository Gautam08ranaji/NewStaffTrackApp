import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function CaseAnalytics() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <>
      {/* ✅ CASE CATEGORY DISTRIBUTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("analytics.categoryDistribution")}
        </Text>

        <CategoryRow
          label={t("analytics.categories.medical")}
          value="45 Tasks"
          percent={70}
          color={theme.colors.colorPrimary600}
          theme={theme}
        />
        <CategoryRow
          label={t("analytics.categories.legal")}
          value="28 Tasks"
          percent={45}
          color={theme.colors.colorWarning600}
          theme={theme}
        />
        <CategoryRow
          label={t("analytics.categories.pension")}
          value="32 Tasks"
          percent={55}
          color={theme.colors.colorSuccess600}
          theme={theme}
        />
        <CategoryRow
          label={t("analytics.categories.food")}
          value="15 Tasks"
          percent={30}
          color={theme.colors.colorError600}
          theme={theme}
        />
        <CategoryRow
          label={t("analytics.categories.housing")}
          value="08 Tasks"
          percent={25}
          color={theme.colors.colorAccent500}
          theme={theme}
        />
      </View>

      {/* ✅ CURRENT STATUS BREAKDOWN */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("analytics.statusBreakdown")}
        </Text>

        <View style={styles.statusGrid}>
          <StatusBox
            value="12"
            label={t("analytics.status.new")}
            bg={theme.colors.colorSuccess100}
            color={theme.colors.colorSuccess600}
            theme={theme}
          />
          <StatusBox
            value="08"
            label={t("analytics.status.assigned")}
            bg={theme.colors.colorWarning100}
            color={theme.colors.colorWarning600}
            theme={theme}
          />
          <StatusBox
            value="15"
            label={t("analytics.status.inProgress")}
            bg={theme.colors.colorPrimary50}
            color={theme.colors.colorPrimary600}
            theme={theme}
          />
          <StatusBox
            value="05"
            label={t("analytics.status.resolved")}
            bg={theme.colors.colorSuccess100}
            color={theme.colors.colorSuccess600}
            theme={theme}
          />
          <StatusBox
            value="02"
            label={t("analytics.status.followup")}
            bg={theme.colors.colorError100}
            color={theme.colors.colorError600}
            theme={theme}
          />
          <StatusBox
            value="128"
            label={t("analytics.status.closed")}
            bg={theme.colors.colorInfoBg || theme.colors.colorPrimary50}
            color={theme.colors.colorPrimary600}
            theme={theme}
          />
        </View>
      </View>

      {/* ✅ EXPORT BUTTON */}
      <TouchableOpacity
        style={[styles.exportBtn, { backgroundColor: theme.colors.colorSuccess600 }]}
        onPress={() => {
          // Handle export functionality
          console.log("Export report");
        }}
      >
        <RemixIcon name="download-line" size={20} color={theme.colors.btnPrimaryText} />
        <Text style={[styles.exportText, { color: theme.colors.btnPrimaryText }]}>
          {t("analytics.exportReport")}
        </Text>
      </TouchableOpacity>
    </>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

const CategoryRow = ({ label, value, percent, color, theme }: any) => {
  const styles = createStyles(theme);
  
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryLabel, { color: theme.colors.colorTextPrimary }]}>
          {label}
        </Text>
        <Text style={[styles.categoryValue, { color: theme.colors.colorTextSecondary }]}>
          {value}
        </Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const StatusBox = ({ value, label, bg, color, theme }: any) => {
  const styles = createStyles(theme);
  
  return (
    <View style={[styles.statusBox, { backgroundColor: bg }]}>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
      <Text style={[styles.statusLabel, { color }]}>{label}</Text>
    </View>
  );
};

/* ---------------- STYLES ---------------- */

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.colorBgSurface,
      elevation: 2,
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      shadowColor: theme.colors.colorShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 12,
      color: theme.colors.colorPrimary600,
      fontFamily: 'Poppins-SemiBold',
    },

    /* Category Distribution */

    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },

    categoryLabel: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: 'Poppins-SemiBold',
    },

    categoryValue: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: 'Poppins-Medium',
    },

    progressTrack: {
      height: 8,
      borderRadius: 8,
    },

    progressFill: {
      height: 8,
      borderRadius: 8,
    },

    /* Status Grid */

    statusGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    statusBox: {
      width: "48%",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },

    statusValue: {
      fontSize: 20,
      fontWeight: "800",
      fontFamily: 'Poppins-Bold',
    },

    statusLabel: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: "600",
      fontFamily: 'Poppins-SemiBold',
    },

    /* Export Button */

    exportBtn: {
      flexDirection: "row",
      padding: 14,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 40,
      shadowColor: theme.colors.colorShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    exportText: {
      fontWeight: "700",
      fontFamily: 'Poppins-SemiBold',
    },
  });