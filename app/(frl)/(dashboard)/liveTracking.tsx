import BodyLayout from "@/components/layout/BodyLayout";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function LiveFROTracking() {
  return (

        <BodyLayout type="screen" screenName="Live Tracking">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Location Details</Text>
          <Text style={styles.sectionDesc}>
            Select the FRO profile over map or via FRO profile card to see the
            exact location
          </Text>
        </View>

        
        <View style={styles.mapCard}>
          <View style={styles.legendBox}>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#2563eb" }]} />
              <Text style={styles.legendText}>On Site</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#16a34a" }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#f97316" }]} />
              <Text style={styles.legendText}>On the way</Text>
            </View>
          </View>

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

      
        <Text style={styles.listTitle}>Active FROs List</Text>

        <FROCard
          name="Ashish Tomar"
          code="FRO-001"
          status="On the way"
          statusBg="#fde68a"
          statusColor="#f97316"
          location="Ghazipur, UP"
          eta="20 mins to reach site"
          caseText="Active Case: TKT-14567-023 → Rauza, Ghazipur"
          updated="Just Now"
        />

        <FROCard
          name="Priya Singh"
          code="FRO-002"
          status="On Site"
          statusBg="#dbeafe"
          statusColor="#2563eb"
          location="Gomti Nagar, Lucknow"
          eta="--:--"
          caseText="Active Case: TKT-14567-023 → With Victim"
          updated="1 min ago"
        />

        <FROCard
          name="Amit Sharma"
          code="FRO-003"
          status="Available"
          statusBg="#dcfce7"
          statusColor="#16a34a"
          location="Indira Nagar, Lucknow"
          eta="--:--"
          caseText=""
          updated="Just Now"
        />
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

const FROCard = ({
  name,
  code,
  status,
  statusBg,
  statusColor,
  location,
  eta,
  caseText,
  updated,
}: any) => {
  return (
    <View style={styles.froCard}>
      <View style={styles.froHeader}>
        <View style={styles.froLeft}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.froName}>{name}</Text>
            <Text style={styles.froCode}>{code}</Text>
          </View>
        </View>

        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>

      {/* LOCATION + ETA WITH REMIX ICONS */}
      <View style={styles.metaRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <RemixIcon name="map-pin-line" size={14} color="#64748b" />
          <Text style={styles.metaText}>{location}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <RemixIcon name="time-line" size={14} color="#64748b" />
          <Text style={styles.metaText}>ETA: {eta}</Text>
        </View>
      </View>

      {caseText ? (
        <View style={styles.caseBadge}>
          <Text style={styles.caseText}>{caseText}</Text>
        </View>
      ) : null}

      {/* ACTION BUTTONS WITH REMIX ICONS */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.trackBtn}>
          <RemixIcon name="map-pin-line" size={16} color="#0f766e" />
          <Text style={styles.trackText}>Track</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callBtn}>
          <RemixIcon name="phone-line" size={16} color="#fff" />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.updatedText}>Updated: {updated}</Text>
    </View>
  );
};

/* ----------------- STYLES ----------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    backgroundColor: "#0f766e",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  headerRight: {
    flexDirection: "row",
    gap: 12,
  },

  iconCircle: {
    backgroundColor: "#fff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ef4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },

  section: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
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

  legendBox: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  legendText: {
    fontSize: 12,
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

  listTitle: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "600",
  },

  froCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  froHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  froLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#cbd5f5",
  },

  froName: {
    fontSize: 14,
    fontWeight: "600",
  },

  froCode: {
    fontSize: 12,
    color: "#64748b",
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  metaText: {
    fontSize: 12,
    color: "#64748b",
  },

  caseBadge: {
    backgroundColor: "#e0f2fe",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  caseText: {
    fontSize: 12,
    color: "#0369a1",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  trackBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0f766e",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  trackText: {
    color: "#0f766e",
    fontWeight: "600",
  },

  callBtn: {
    flex: 1,
    backgroundColor: "#0f766e",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  callText: {
    color: "#fff",
    fontWeight: "600",
  },

  updatedText: {
    textAlign: "center",
    fontSize: 11,
    color: "#64748b",
    marginTop: 8,
  },
});
