import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

/* ---------------- MAIN FILE ---------------- */

export default function MyOverview() {
  return (
    <>
      {/* ✅ MY PERFORMANCE SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Performance Summary</Text>

        <View style={styles.statsGrid}>
          <StatBox
            title="Total Tasks"
            value="42"
            bg="#e6f6f4"
            color="#00796B"
          />
          <StatBox title="Completed" value="36" bg="#e3f2fd" color="#1976d2" />
          <StatBox title="Pending" value="6" bg="#fff3e0" color="#ef6c00" />
          <StatBox
            title="Resolution Rate"
            value="87%"
            bg="#fdecea"
            color="#d32f2f"
          />
        </View>
      </View>

      {/* ✅ AVERAGE RESPONSE TIME */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Average Task Time</Text>

        <ProgressRow
          label="Task Acceptance"
          value="8 min"
          percent={35}
          color="#1e88e5"
        />
        <ProgressRow
          label="Arrival Time"
          value="12 min"
          percent={45}
          color="#2e7d32"
        />
        <ProgressRow
          label="Task Resolution"
          value="45 min"
          percent={55}
          color="#ef6c00"
        />
      </View>

      {/* ✅ WEEKLY TASK TREND */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tasks Resolved - Weekly Trend</Text>
        <View style={styles.weekRow}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Text key={day} style={styles.weekText}>
              {day}
            </Text>
          ))}
        </View>
      </View>

      {/* ✅ TODAY'S PERFORMANCE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{"Today's Performance"}</Text>

        <InfoRow label="Tasks Assigned" value="10" />
        <InfoRow label="Tasks Completed" value="8" />
        <InfoRow label="Pending Tasks" value="2" />
        <InfoRow label="Average Rating" value="⭐ 4.7" />
      </View>

      {/* ✅ EXPORT BUTTON */}
      <TouchableOpacity style={styles.exportBtn}>
        <RemixIcon name="download-line" size={20} color="#fff" />
        <Text style={styles.exportText}>Export My Report (PDF)</Text>
      </TouchableOpacity>
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

const StatBox = ({ title, value, bg, color }: any) => (
  <View style={[styles.statBox, { backgroundColor: bg }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statTitle, { color }]}>{title}</Text>
  </View>
);

const ProgressRow = ({ label, value, percent, color }: any) => (
  <View style={{ marginBottom: 14 }}>
    <View style={styles.progressHeader}>
      <Text style={styles.progressLabel}>{label}</Text>
      <Text style={styles.progressValue}>{value}</Text>
    </View>

    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${percent}%`, backgroundColor: color },
        ]}
      />
    </View>
  </View>
);

const InfoRow = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAFAFA",
    elevation: 2,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  statBox: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },

  statTitle: {
    fontSize: 12,
    marginTop: 4,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 12, fontWeight: "600" },

  progressTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
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

  weekText: { fontSize: 12, color: "#6b7280" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  infoLabel: { fontSize: 13 },
  infoValue: { fontWeight: "700" },

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
