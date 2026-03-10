import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function Performance() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <>
      {/* ✅ MY KPIs */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("performance.kpiTitle")}
        </Text>

        <KPIRow
          label={t("performance.kpi.resolutionRate")}
          value="87%"
          percent={87}
          color={theme.colors.colorPrimary600}
          theme={theme}
        />

        <KPIRow
          label={t("performance.kpi.customerRating")}
          value="4.6 / 5"
          percent={92}
          color={theme.colors.colorSuccess600}
          theme={theme}
        />

        <KPIRow
          label={t("performance.kpi.slaCompliance")}
          value="94%"
          percent={94}
          color={theme.colors.colorWarning600}
          theme={theme}
        />
      </View>

      {/* ✅ PERSONAL PERFORMANCE ALERT */}
      <View style={styles.card}>
        <View style={styles.alertHeader}>
          <Text style={styles.sectionTitle}>
            {t("performance.alerts.title")}
          </Text>
          <View style={[styles.issueBadge, { backgroundColor: theme.colors.colorError100 }]}>
            <Text style={[styles.issueText, { color: theme.colors.colorError600 }]}>
              {t("performance.alerts.count", { count: 2 })}
            </Text>
          </View>
        </View>

        {/* 🔴 Pending Tasks */}
        <View style={[styles.alertRow, { backgroundColor: theme.colors.colorError100 }]}>
          <View style={[styles.alertIconRed, { backgroundColor: theme.colors.colorError100 + '80' }]}>
            <RemixIcon name="error-warning-line" size={18} color={theme.colors.colorError600} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.alertTitleRed, { color: theme.colors.colorError600 }]}>
              {t("performance.alerts.pendingTasks")}
            </Text>
            <Text style={[styles.alertDesc, { color: theme.colors.colorTextSecondary }]}>
              {t("performance.alerts.pendingDesc", { count: 3 })}
            </Text>
          </View>
        </View>

        {/* 🔵 SLA Warning */}
        <View style={[styles.alertRow, { backgroundColor: theme.colors.colorPrimary50 }]}>
          <View style={[styles.alertIconBlue, { backgroundColor: theme.colors.colorPrimary100 }]}>
            <RemixIcon name="time-line" size={18} color={theme.colors.colorPrimary600} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.alertTitleBlue, { color: theme.colors.colorPrimary600 }]}>
              {t("performance.alerts.slaWarning")}
            </Text>
            <Text style={[styles.alertDesc, { color: theme.colors.colorTextSecondary }]}>
              {t("performance.alerts.slaDesc", { count: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* ✅ EXPORT BUTTON */}
      <TouchableOpacity
        style={[styles.exportBtn, { backgroundColor: theme.colors.colorSuccess600 }]}
        onPress={() => {
          // Handle export functionality
          console.log("Export performance report");
        }}
      >
        <RemixIcon name="download-line" size={20} color={theme.colors.btnPrimaryText} />
        <Text style={[styles.exportText, { color: theme.colors.btnPrimaryText }]}>
          {t("performance.exportReport")}
        </Text>
      </TouchableOpacity>
    </>
  );
}

/* KPI COMPONENT */

const KPIRow = ({ label, value, percent, color, theme }: any) => {
  const styles = createStyles(theme);
  
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.kpiHeader}>
        <Text style={[styles.kpiLabel, { color: theme.colors.colorTextPrimary }]}>
          {label}
        </Text>
        <Text style={[styles.kpiValue, { color: theme.colors.colorTextSecondary }]}>
          {value}
        </Text>
      </View>

      <View style={[styles.kpiTrack, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.kpiFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

/* STYLES */

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      backgroundColor: theme.colors.colorBgSurface,
      elevation: 2,
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

    kpiHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },

    kpiLabel: { 
      fontSize: 12, 
      fontWeight: "600",
      fontFamily: 'Poppins-SemiBold',
    },

    kpiValue: {
      fontSize: 12,
      fontWeight: "700",
      fontFamily: 'Poppins-SemiBold',
    },

    kpiTrack: {
      height: 8,
      borderRadius: 8,
    },

    kpiFill: {
      height: 8,
      borderRadius: 8,
    },

    alertHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },

    issueBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },

    issueText: {
      fontSize: 11,
      fontWeight: "700",
      fontFamily: 'Poppins-SemiBold',
    },

    alertRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },

    alertIconRed: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    alertIconBlue: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    alertTitleRed: {
      fontSize: 13,
      fontWeight: "700",
      fontFamily: 'Poppins-SemiBold',
    },

    alertTitleBlue: {
      fontSize: 13,
      fontWeight: "700",
      fontFamily: 'Poppins-SemiBold',
    },

    alertDesc: {
      fontSize: 12,
      marginTop: 2,
      fontFamily: 'Poppins-Regular',
    },

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