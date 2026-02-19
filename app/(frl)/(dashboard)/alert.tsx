import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const FILTERS = ["All Alerts", "Urgent", "Case Alerts", "FRO Alerts"] as const;
type FilterType = (typeof FILTERS)[number];

type AlertType = {
  id: number;
  title: string;
  badge: "High" | "Medium" | "Low";
  description: string;
  time: string;
  location?: string;
  caseId: string;
  actionText: string;
  contactNumber?: string; // ✅ ADDED
  type: "danger" | "warning" | "info";
  outline?: boolean;
  category: "Case Alerts" | "FRO Alerts";
};

/* ✅ ALERT DATA */
const ALERTS_DATA: AlertType[] = [
  {
    id: 1,
    title: "High Priority Case - Unassigned",
    badge: "High",
    description:
      "Medical emergency case pending for 8 minutes. No FRO assigned yet.",
    time: "2 min ago",
    location: "Hazratganj, Lucknow",
    caseId: "Case TKT-14567-001",
    actionText: "Assign to FRO",
    contactNumber: "9876543210",
    type: "danger",
    category: "Case Alerts",
  },
  {
    id: 2,
    title: "FRO Late Check-in Alert",
    badge: "High",
    description:
      "Amit Sharma (FRO-003) has not checked in yet. Duty time started 45 min ago",
    time: "15 min ago",
    caseId: "FRO ID: FRO-003",
    actionText: "View FRO Profile",
    contactNumber: "9123456780",
    type: "danger",
    category: "FRO Alerts",
  },
  {
    id: 3,
    title: "TAT Breach Warning",
    badge: "Medium",
    description: "Case TKT-14567-015 approaching SLA deadline in 10 minutes",
    time: "5 min ago",
    location: "Ghazipur, Lucknow",
    caseId: "Case: TKT-14567-015",
    actionText: "Assign Now",
    contactNumber: "9988776655",
    type: "warning",
    category: "Case Alerts",
  },
  {
    id: 4,
    title: "Case Successfully Resolved",
    badge: "Low",
    description: "Priya Singh (FRO-002) marked case TKT-14567-024 as resolved",
    time: "10 min ago",
    caseId: "Case: TKT-14567-024",
    actionText: "Mark as Read",
    contactNumber: "9000011111",
    type: "info",
    outline: true,
    category: "Case Alerts",
  },
];

/* ============================= SCREEN ============================= */

export default function AlertsScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<FilterType>("All Alerts");

  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<FilterType, number>>({} as any);

  const counts: Record<FilterType, number> = useMemo(() => {
    return {
      "All Alerts": ALERTS_DATA.length,
      Urgent: ALERTS_DATA.filter((i) => i.badge === "High").length,
      "Case Alerts": ALERTS_DATA.filter((i) => i.category === "Case Alerts")
        .length,
      "FRO Alerts": ALERTS_DATA.filter((i) => i.category === "FRO Alerts")
        .length,
    };
  }, []);

  const filteredAlerts = useMemo(() => {
    switch (activeTab) {
      case "Urgent":
        return ALERTS_DATA.filter((i) => i.badge === "High");
      case "Case Alerts":
        return ALERTS_DATA.filter((i) => i.category === "Case Alerts");
      case "FRO Alerts":
        return ALERTS_DATA.filter((i) => i.category === "FRO Alerts");
      default:
        return ALERTS_DATA;
    }
  }, [activeTab]);

  const handleTabPress = (tab: FilterType) => {
    setActiveTab(tab);
    const x = tabLayouts.current[tab];
    if (x !== undefined) {
      scrollRef.current?.scrollTo({ x: Math.max(x - 40, 0), animated: true });
    }
  };

  return (
    <BodyLayout type="screen" screenName="Alerts">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsRow}
        contentContainerStyle={styles.tabsContent}
      >
        {FILTERS.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab)}
              onLayout={(e: LayoutChangeEvent) => {
                tabLayouts.current[tab] = e.nativeEvent.layout.x;
              }}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive
                    ? theme.colors.colorPrimary600
                    : theme.colors.inputBg,
                  borderColor: theme.colors.colorPrimary600,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  {
                    color: isActive
                      ? theme.colors.inputBg
                      : theme.colors.colorPrimary600,
                  },
                ]}
              >
                {tab}
              </Text>

              <View
                style={[
                  styles.countCircle,
                  {
                    backgroundColor: isActive
                      ? theme.colors.inputBg
                      : theme.colors.colorPrimary600,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color: isActive
                        ? theme.colors.colorPrimary600
                        : theme.colors.inputBg,
                    },
                  ]}
                >
                  {counts[tab]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredAlerts.map((alert) => (
        <AlertCard key={alert.id} {...alert} />
      ))}
    </BodyLayout>
  );
}

/* ============================= ALERT CARD ============================= */

const AlertCard = ({
  title,
  badge,
  description,
  time,
  location,
  caseId,
  actionText,
  contactNumber,
  type,
  outline = false,
}: AlertType) => {
  const bgMap: Record<AlertType["type"], string> = {
    danger: "#fee2e2",
    warning: "#fff7ed",
    info: "#e0f2fe",
  };

  const badgeMap: Record<AlertType["badge"], string> = {
    High: "#dc2626",
    Medium: "#f97316",
    Low: "#2563eb",
  };

  return (
    <View
      style={[
        styles.alertCard,
        { backgroundColor: bgMap[type], borderColor: badgeMap[badge] },
      ]}
    >
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>{title}</Text>

        <View style={[styles.badgePill, { backgroundColor: badgeMap[badge] }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>

      <Text style={styles.alertDesc}>{description}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <RemixIcon name="time-line" size={14} color="#64748b" />
          <Text style={styles.metaText}>{time}</Text>
        </View>

        {location && (
          <View style={styles.metaItem}>
            <RemixIcon name="map-pin-line" size={14} color="#64748b" />
            <Text style={styles.metaText}>{location}</Text>
          </View>
        )}
      </View>

      <View style={styles.caseBox}>
        <Text style={styles.caseText}>{caseId}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.mainBtn,
            outline && {
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "#64748b",
            },
          ]}
          onPress={() => {
            if (actionText === "Assign to FRO" || actionText === "Assign Now") {
              router.push("/assignScreen");
              return;
            }

            if (actionText === "View FRO Profile") {
              console.log("view profile");
              return;
            }

            if (actionText === "Mark as Read") {
              console.log("✅ Marked as read for:", caseId);
              return;
            }
          }}
        >
          <Text style={[styles.mainBtnText, outline && { color: "#475569" }]}>
            {actionText}
          </Text>
        </TouchableOpacity>

        {/* ✅ REAL PHONE CALL USING LINKING */}
        <TouchableOpacity
          style={styles.callIcon}
          onPress={() => {
            if (!contactNumber) {
              console.log("❌ No contact number available");
              return;
            }

            Linking.openURL(`tel:${contactNumber}`);
          }}
        >
          <RemixIcon name="phone-line" size={18} color="#0f766e" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  tabsRow: { marginVertical: 8 },
  tabsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 2,
    marginRight: 8,
    gap: 8,
    flexShrink: 0,
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 0,
  },
  countCircle: {
    minWidth: 22,
    height: 22,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 13,
    fontWeight: "800",
  },
  alertCard: {
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertTitle: { fontSize: 14, fontWeight: "600" },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  alertDesc: { fontSize: 13, marginTop: 6, color: "#475569" },
  metaRow: { flexDirection: "row", marginTop: 10, gap: 20 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: "#64748b" },
  caseBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  caseText: { fontSize: 12, color: "#475569" },
  actionRow: { flexDirection: "row", marginTop: 12, gap: 10 },
  mainBtn: {
    flex: 1,
    backgroundColor: "#0f766e",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  mainBtnText: { color: "#fff", fontWeight: "600" },
  callIcon: {
    backgroundColor: "#e7f5f3",
    width: 46,
    height: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
