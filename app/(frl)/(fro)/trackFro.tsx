import BodyLayout from "@/components/layout/BodyLayout";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function LiveFROTracking() {
  return (
    <BodyLayout type="screen" screenName="Live Tracking">
      <View style={styles.section}>
        <Text style={[styles.sectionTitle]}>Live Location Details</Text>
      </View>

      <View style={styles.mapCard}>
        <Text style={styles.mapPlaceholder}>[ Map View Here ]</Text>

        {/* LIVE DETAILS PANEL */}
        <View style={styles.detailCard}>
          <DetailRow label="FRO Detail" value="Ashish Tomar (FRO-001)" />
          <DetailRow label="Status" value="On the way to Rauza" />
          <DetailRow label="Coordinates" value="26.864° N, 80.975° E" />
          <DetailRow label="Current Speed" value="15 km/h" />
          <DetailRow label="Last Update" value="30 sec ago" />

          <TouchableOpacity style={styles.callButton}>
            <RemixIcon name="phone-line" size={18} color="#fff" />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BodyLayout>
  );
}

/* ----------------- SMALL COMPONENTS ----------------- */

const DetailRow = ({ label, value }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

/* ----------------- STYLES ----------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  section: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
    color: "#0f766e",
  },

  sectionDesc: {
    fontSize: 13,
    color: "#64748b",
  },

  mapCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0f766e",
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
  },

  mapPlaceholder: {
    height: 200,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#475569",
  },

  detailCard: {
    backgroundColor: "#e7f5f3",
    padding: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  detailLabel: {
    fontSize: 13,
    color: "#475569",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },

  callButton: {
    marginTop: 12,
    backgroundColor: "#0f766e",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },

  callButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
