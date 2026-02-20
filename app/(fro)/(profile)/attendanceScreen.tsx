import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function Attendance() {
  return (
    <>
      {/* ✅ MY ATTENDANCE SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Attendance Today</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: "#e0f2f1" }]}>
            <Text style={[styles.summaryValue, { color: "#00695c" }]}>
              Present
            </Text>
            <Text style={[styles.summaryLabel, { color: "#00695c" }]}>
              Checked In
            </Text>
          </View>

          <View style={[styles.summaryBox, { backgroundColor: "#e3f2fd" }]}>
            <Text style={[styles.summaryValue, { color: "#1976d2" }]}>
              09:05 AM
            </Text>
            <Text style={[styles.summaryLabel, { color: "#1976d2" }]}>
              Check-in Time
            </Text>
          </View>
        </View>

        <View style={styles.attendanceTrack}>
          <View style={[styles.attendanceFill, { width: "92%" }]} />
        </View>

        <Text style={styles.attendanceText}>92% Monthly Attendance</Text>
      </View>

      {/* ✅ LATE CHECK-IN DETAILS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Late Check-in Details</Text>

        <LateRow date="12 Feb 2026" time="09:45 AM" lateText="Late by 45 min" />
        <LateRow date="05 Feb 2026" time="09:30 AM" lateText="Late by 30 min" />
      </View>

      {/* ✅ WEEKLY ATTENDANCE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Weekly Attendance</Text>

        <WeekRow day="Monday" value="Present" percent={100} />
        <WeekRow day="Tuesday" value="Present" percent={100} />
        <WeekRow day="Wednesday" value="Late" percent={70} />
        <WeekRow day="Thursday" value="Present" percent={100} />
        <WeekRow day="Friday" value="Present" percent={100} />
        <WeekRow day="Saturday" value="Absent" percent={0} />
        <WeekRow day="Sunday" value="Holiday" percent={0} />
      </View>

      {/* ✅ EXPORT */}
      <TouchableOpacity style={styles.exportBtn}>
        <RemixIcon name="download-line" size={20} color="#fff" />
        <Text style={styles.exportText}>Export My Attendance</Text>
      </TouchableOpacity>
    </>
  );
}

/* COMPONENTS */

const LateRow = ({ date, time, lateText }: any) => (
  <View style={styles.lateRow}>
    <View>
      <Text style={styles.lateName}>{date}</Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.lateTime}>{time}</Text>
      <Text style={styles.lateText}>{lateText}</Text>
    </View>
  </View>
);

const WeekRow = ({ day, value, percent }: any) => (
  <View style={{ marginBottom: 12 }}>
    <View style={styles.weekHeader}>
      <Text style={styles.weekDay}>{day}</Text>
      <Text style={styles.weekValue}>{value}</Text>
    </View>

    <View style={styles.weekTrack}>
      <View style={[styles.weekFill, { width: `${percent}%` }]} />
    </View>
  </View>
);

/* STYLES */

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

  summaryRow: { flexDirection: "row", gap: 12 },

  summaryBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  summaryValue: { fontSize: 18, fontWeight: "900" },
  summaryLabel: { fontSize: 12, marginTop: 4, fontWeight: "600" },

  attendanceTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginTop: 12,
  },

  attendanceFill: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#1e88e5",
  },

  attendanceText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },

  lateRow: {
    backgroundColor: "#fff7e6",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  lateName: { fontWeight: "700", color: "#fb8c00" },
  lateTime: { fontWeight: "700", color: "#fb8c00" },
  lateText: { fontSize: 12, color: "#6b7280" },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  weekDay: { fontSize: 12, fontWeight: "600" },
  weekValue: { fontSize: 12, fontWeight: "600", color: "#6b7280" },

  weekTrack: {
    height: 8,
    backgroundColor: "#e5f0e6",
    borderRadius: 8,
  },

  weekFill: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#2e7d32",
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
