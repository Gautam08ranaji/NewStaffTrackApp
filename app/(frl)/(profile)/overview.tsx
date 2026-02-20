import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

/* ---------------- MAIN FILE ---------------- */

export default function CaseOverview() {
  return (
    <>
      {/* ✅ TEAM PERFORMANCE SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Team Performance Summary</Text>

        <View style={styles.statsGrid}>
          <StatBox title="Total FROs" value="24" bg="#e6f6f4" color="#00796B" />
          <StatBox title="On Duty" value="18" bg="#fff3e0" color="#ef6c00" />
          <StatBox
            title="Active Tasks"
            value="42"
            bg="#e3f2fd"
            color="#1976d2"
          />
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
        <Text style={styles.sectionTitle}>Average Response Time</Text>

        <ProgressRow
          label="TaskAcceptance"
          value="8 min"
          percent={35}
          color="#1e88e5"
        />
        <ProgressRow
          label="Arrival Time"
          value="08 min"
          percent={45}
          color="#2e7d32"
        />
        <ProgressRow
          label="TaskResolution"
          value="45 min"
          percent={55}
          color="#ef6c00"
        />
      </View>

      {/* ✅ WEEKLY TREND */}
      <View style={[styles.card]}>
        <Text style={styles.sectionTitle}>TaskResolved - Weekly Trend</Text>
        <View style={styles.weekRow}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Text key={day} style={styles.weekText}>
              {day}
            </Text>
          ))}
        </View>
      </View>

      {/* ✅ TOP PERFORMERS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top 5 Performers This Today</Text>

        <PerformerCard
          rank={1}
          name="Ashish Tomar"
          id="FRO-001"
          Tasks="28"
          rating="4.8"
        />
        <PerformerCard
          rank={2}
          name="Gautam Rana"
          id="FRO-005"
          Tasks="25"
          rating="4.7"
        />
        <PerformerCard
          rank={3}
          name="Abhishek Mishra"
          id="FRO-012"
          Tasks="23"
          rating="4.6"
        />
        <PerformerCard
          rank={4}
          name="Bhupinder"
          id="FRO-014"
          Tasks="22"
          rating="4.5"
        />
        <PerformerCard
          rank={5}
          name="Jagjeet Singh"
          id="FRO-044"
          Tasks="20"
          rating="4.1"
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

const PerformerCard = ({ rank, name, id, Tasks, rating }: any) => (
  <View style={styles.performerRow}>
    <View style={styles.rankCircle}>
      <Text style={styles.rankText}>#{rank}</Text>
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.performerName}>{name}</Text>
      <Text style={styles.performerId}>{id}</Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.caseCount}>{Tasks} Tasks</Text>
      <Text style={styles.rating}>⭐ {rating}</Text>
    </View>
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

  performerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f6f4",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00695c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  rankText: { color: "#fff", fontWeight: "700" },

  performerName: { fontWeight: "700" },
  performerId: { fontSize: 12, color: "#6b7280" },

  caseCount: { fontWeight: "700", color: "#00695c" },
  rating: { fontSize: 12, color: "#f59e0b" },

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
