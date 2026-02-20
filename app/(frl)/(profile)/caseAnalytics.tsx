import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function CaseAnalytics() {
  return (
    <>
      {/* ✅ CASE CATEGORY DISTRIBUTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>TaskCategory Distribution</Text>

        <CategoryRow
          label="Medical Emergency"
          value="45 Tasks"
          percent={70}
          color="#1e88e5"
        />
        <CategoryRow
          label="Legal Aid"
          value="28 Tasks"
          percent={45}
          color="#fb8c00"
        />
        <CategoryRow
          label="Pension Support"
          value="32 Tasks"
          percent={55}
          color="#2e7d32"
        />
        <CategoryRow
          label="Food Security"
          value="15 Tasks"
          percent={30}
          color="#c62828"
        />
        <CategoryRow
          label="Housing"
          value="08 Tasks"
          percent={25}
          color="#ef6c00"
        />
      </View>

      {/* ✅ CURRENT STATUS BREAKDOWN */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Status Breakdown</Text>

        <View style={styles.statusGrid}>
          <StatusBox value="12" label="New" bg="#e0f2f1" color="#00796b" />
          <StatusBox value="08" label="Assigned" bg="#fff3e0" color="#fb8c00" />
          <StatusBox
            value="15"
            label="In Progress"
            bg="#e8f5e9"
            color="#2e7d32"
          />
          <StatusBox value="05" label="Resolved" bg="#e3f2fd" color="#1e88e5" />
          <StatusBox
            value="02"
            label="Follow-up"
            bg="#fdecea"
            color="#c62828"
          />
          <StatusBox value="128" label="Closed" bg="#e0f2fb" color="#1565c0" />
        </View>
      </View>

      {/* ✅ EXPORT BUTTON */}
      <TouchableOpacity style={styles.exportBtn}>
        <RemixIcon name="download-line" size={20} color="#fff" />
        <Text style={styles.exportText}>Export Report (PDF)</Text>
      </TouchableOpacity>
    </>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

const CategoryRow = ({ label, value, percent, color }: any) => (
  <View style={{ marginBottom: 14 }}>
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryLabel}>{label}</Text>
      <Text style={styles.categoryValue}>{value}</Text>
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

const StatusBox = ({ value, label, bg, color }: any) => (
  <View style={[styles.statusBox, { backgroundColor: bg }]}>
    <Text style={[styles.statusValue, { color }]}>{value}</Text>
    <Text style={[styles.statusLabel, { color }]}>{label}</Text>
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

  /* Category Distribution */

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  categoryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
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
  },

  statusLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  /* Export Button */

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
