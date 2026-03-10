import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

/* ---------------- MAIN FILE ---------------- */

export default function MyOverview() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  // Get week days as array - handle both string and array cases
  const weekDays = t("overview.days", { returnObjects: true });
  const daysArray = Array.isArray(weekDays) ? weekDays : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      {/* ✅ MY PERFORMANCE SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("overview.performanceSummary")}
        </Text>

        <View style={styles.statsGrid}>
          <StatBox
            title={t("overview.totalTasks")}
            value="42"
            bg={theme.colors.colorSuccess100}
            color={theme.colors.colorSuccess600}
          />
          <StatBox
            title={t("overview.completed")}
            value="36"
            bg={theme.colors.colorPrimary50}
            color={theme.colors.colorPrimary600}
          />
          <StatBox
            title={t("overview.pending")}
            value="6"
            bg={theme.colors.colorWarning100}
            color={theme.colors.colorWarning600}
          />
          <StatBox
            title={t("overview.resolutionRate")}
            value="87%"
            bg={theme.colors.colorError100}
            color={theme.colors.colorError600}
          />
        </View>
      </View>

      {/* ✅ AVERAGE RESPONSE TIME */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("overview.averageTaskTime")}
        </Text>

        <ProgressRow
          label={t("overview.taskAcceptance")}
          value="8 min"
          percent={35}
          color={theme.colors.colorPrimary600}
          theme={theme}
        />
        <ProgressRow
          label={t("overview.arrivalTime")}
          value="12 min"
          percent={45}
          color={theme.colors.colorSuccess600}
          theme={theme}
        />
        <ProgressRow
          label={t("overview.taskResolution")}
          value="45 min"
          percent={55}
          color={theme.colors.colorWarning600}
          theme={theme}
        />
      </View>

      {/* ✅ WEEKLY TASK TREND */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("overview.weeklyTrend")}
        </Text>
        <View style={styles.weekRow}>
          {daysArray.map((day: string, index: number) => (
            <Text key={index} style={[styles.weekText, { color: theme.colors.colorTextTertiary }]}>
              {day}
            </Text>
          ))}
        </View>
      </View>

      {/* ✅ TODAY'S PERFORMANCE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("overview.todayPerformance")}
        </Text>

        <InfoRow
          label={t("overview.tasksAssigned")}
          value="10"
          theme={theme}
          styles={styles}
        />
        <InfoRow
          label={t("overview.tasksCompleted")}
          value="8"
          theme={theme}
          styles={styles}
        />
        <InfoRow
          label={t("overview.pendingTasks")}
          value="2"
          theme={theme}
          styles={styles}
        />
        <InfoRow
          label={t("overview.averageRating")}
          value="⭐ 4.7"
          theme={theme}
          styles={styles}
        />
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
          {t("overview.exportReport")}
        </Text>
      </TouchableOpacity>
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

const StatBox = ({ title, value, bg, color }: any) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={[styles.statBox, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statTitle, { color }]}>{title}</Text>
    </View>
  );
};

const ProgressRow = ({ label, value, percent, color, theme }: any) => {
  const styles = createStyles(theme);
  
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: theme.colors.colorTextSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.progressValue, { color: theme.colors.colorTextPrimary }]}>
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

const InfoRow = ({ label, value, theme, styles }: any) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: theme.colors.colorTextSecondary }]}>
      {label}
    </Text>
    <Text style={[styles.infoValue, { color: theme.colors.colorTextPrimary }]}>
      {value}
    </Text>
  </View>
);

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

    statsGrid: { 
      flexDirection: "row", 
      flexWrap: "wrap", 
      gap: 10 
    },

    statBox: {
      width: "48%",
      borderRadius: 12,
      padding: 12,
    },

    statValue: {
      fontSize: 20,
      fontWeight: "800",
      fontFamily: 'Poppins-Bold',
    },

    statTitle: {
      fontSize: 12,
      marginTop: 4,
      fontFamily: 'Poppins-Medium',
    },

    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },

    progressLabel: { 
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
    },
    
    progressValue: { 
      fontSize: 12, 
      fontWeight: "600",
      fontFamily: 'Poppins-SemiBold',
    },

    progressTrack: {
      height: 8,
      borderRadius: 8,
    },

    progressFill: {
      height: 8,
      borderRadius: 8,
    },

    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 150,
    },

    weekText: { 
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
    },

    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
    },

    infoLabel: { 
      fontSize: 13,
      fontFamily: 'Poppins-Regular',
    },
    
    infoValue: { 
      fontWeight: "700",
      fontFamily: 'Poppins-SemiBold',
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