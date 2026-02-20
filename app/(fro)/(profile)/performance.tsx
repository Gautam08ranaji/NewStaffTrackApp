import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function Performance() {
  return (
    <>
      {/* ✅ MY KPIs */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Performance KPIs</Text>

        <KPIRow
          label="Task Resolution Rate"
          value="87%"
          percent={87}
          color="#1e88e5"
        />

        <KPIRow
          label="Customer Rating"
          value="4.6 / 5"
          percent={92}
          color="#2e7d32"
        />

        <KPIRow
          label="SLA Compliance"
          value="94%"
          percent={94}
          color="#fb8c00"
        />
      </View>

      {/* ✅ PERSONAL PERFORMANCE ALERT */}
      <View style={styles.card}>
        <View style={styles.alertHeader}>
          <Text style={styles.sectionTitle}>My Performance Alerts</Text>
          <View style={styles.issueBadge}>
            <Text style={styles.issueText}>2 Alerts</Text>
          </View>
        </View>

        {/* 🔴 Pending Tasks */}
        <View style={[styles.alertRow, { backgroundColor: "#fdecea" }]}>
          <View style={styles.alertIconRed}>
            <RemixIcon name="error-warning-line" size={18} color="#c62828" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitleRed}>Pending Tasks</Text>
            <Text style={styles.alertDesc}>
              You have 3 tasks pending resolution
            </Text>
          </View>
        </View>

        {/* 🔵 SLA Warning */}
        <View style={[styles.alertRow, { backgroundColor: "#e3f2fd" }]}>
          <View style={styles.alertIconBlue}>
            <RemixIcon name="time-line" size={18} color="#1565c0" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitleBlue}>SLA Warning</Text>
            <Text style={styles.alertDesc}>2 tasks nearing SLA deadline</Text>
          </View>
        </View>
      </View>

      {/* ✅ EXPORT BUTTON */}
      <TouchableOpacity style={styles.exportBtn}>
        <RemixIcon name="download-line" size={20} color="#fff" />
        <Text style={styles.exportText}>Export My Performance Report</Text>
      </TouchableOpacity>
    </>
  );
}

/* KPI COMPONENT */

const KPIRow = ({ label, value, percent, color }: any) => (
  <View style={{ marginBottom: 14 }}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>

    <View style={styles.kpiTrack}>
      <View
        style={[
          styles.kpiFill,
          { width: `${percent}%`, backgroundColor: color },
        ]}
      />
    </View>
  </View>
);

/* STYLES */

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#FAFAFA",
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },

  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  kpiLabel: { fontSize: 12, fontWeight: "600" },

  kpiValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },

  kpiTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
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
    backgroundColor: "#fdecea",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  issueText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c62828",
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
    backgroundColor: "#f9d6d3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  alertIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  alertTitleRed: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c62828",
  },

  alertTitleBlue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1565c0",
  },

  alertDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  exportBtn: {
    flexDirection: "row",
    backgroundColor: "#00695c",
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 40,
  },

  exportText: {
    color: "#fff",
    fontWeight: "700",
  },
});
