import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function Attendance() {
  return (
    <>
      {/* ✅ TODAY'S ATTENDANCE SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{"Today's Attendance Summary"}</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: "#e0f2f1" }]}>
            <Text style={[styles.summaryValue, { color: "#00695c" }]}>18</Text>
            <Text style={[styles.summaryLabel, { color: "#00695c" }]}>
              Present
            </Text>
          </View>

          <View style={[styles.summaryBox, { backgroundColor: "#fdecea" }]}>
            <Text style={[styles.summaryValue, { color: "#c62828" }]}>06</Text>
            <Text style={[styles.summaryLabel, { color: "#c62828" }]}>
              Absent
            </Text>
          </View>
        </View>

        <View style={styles.attendanceTrack}>
          <View style={[styles.attendanceFill, { width: "75%" }]} />
        </View>

        <Text style={styles.attendanceText}>75% Attendance Rate</Text>
      </View>

      {/* ✅ LATE CHECK-INS TODAY */}
      <View style={styles.card}>
        <View style={styles.lateHeader}>
          <Text style={styles.sectionTitle}>Late Check-ins Today</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3 FROs</Text>
          </View>
        </View>

        <LateRow
          name="Amit Sharma"
          id="FRO-001"
          time="09:45 AM"
          lateText="Late by 45 min"
        />
        <LateRow
          name="Ravi Kumar"
          id="FRO-001"
          time="09:30 AM"
          lateText="Late by 30 min"
        />
        <LateRow
          name="Pooja Devi"
          id="FRO-001"
          time="09:15 AM"
          lateText="Late by 15 min"
        />
      </View>

      {/* ✅ WEEKLY ATTENDANCE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Weekly Attendance</Text>

        <WeekRow day="Monday" value="22/24" percent={92} />
        <WeekRow day="Tuesday" value="21/24" percent={88} />
        <WeekRow day="Wednesday" value="23/24" percent={96} />
        <WeekRow day="Thursday" value="20/24" percent={83} />
        <WeekRow day="Friday" value="18/24" percent={75} />
        <WeekRow day="Saturday" value="17/24" percent={71} />
        <WeekRow day="Sunday" value="21/24" percent={88} />
      </View>

      {/* ✅ ATTENDANCE BY FROs */}
      <View style={styles.card}>
        <View style={styles.froHeader}>
          <Text style={styles.sectionTitle}>Attendance by FROs</Text>
          <Text style={styles.link}>See Full List</Text>
        </View>

        <FRORow
          name="Amit Sharma"
          id="FRO-001"
          days="20/24 Days"
          absent="02 Days Absent"
        />
        <FRORow
          name="Ravi Kumar"
          id="FRO-001"
          days="23/24 Days"
          absent="01 Days Absent"
        />
        <FRORow
          name="Pooja Devi"
          id="FRO-001"
          days="19/24 Days"
          absent="05 Days Absent"
        />
      </View>

      {/* ✅ EXPORT BUTTON */}
      <TouchableOpacity style={styles.exportBtn}>
        <RemixIcon name="download-line" size={20} color="#fff" />
        <Text style={styles.exportText}>Export Report (PDF)</Text>
      </TouchableOpacity>
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

const LateRow = ({ name, id, time, lateText }: any) => (
  <View style={styles.lateRow}>
    <View>
      <Text style={styles.lateName}>{name}</Text>
      <Text style={styles.lateId}>{id}</Text>
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

const FRORow = ({ name, id, days, absent }: any) => (
  <View style={styles.froRow}>
    <View>
      <Text style={styles.froName}>{name}</Text>
      <Text style={styles.froId}>{id}</Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.froDays}>{days}</Text>
      <Text style={styles.froAbsent}>{absent}</Text>
    </View>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAFAFA",
    elevation: 2,    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },

  /* Summary */

  summaryRow: { flexDirection: "row", gap: 12 },

  summaryBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  summaryValue: { fontSize: 24, fontWeight: "900" },
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

  /* Late Check-ins */

  lateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  badge: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fb8c00",
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
  lateId: { fontSize: 12, color: "#6b7280" },

  lateTime: { fontWeight: "700", color: "#fb8c00" },
  lateText: { fontSize: 12, color: "#6b7280" },

  /* Weekly */

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

  /* FRO List */

  froHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  link: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00695c",
  },

  froRow: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  froName: { fontWeight: "700" },
  froId: { fontSize: 12, color: "#9ca3af" },

  froDays: { fontWeight: "700" },
  froAbsent: { fontSize: 12, color: "#9ca3af" },

  /* Export */

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
