import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { IconName } from "react-native-remix-icon";
import RemixIcon from "react-native-remix-icon";

import AttendanceTab from "./attendanceTab";
import LeavesTab from "./LeavesTab";
import ReimbursemantTab from "./ReimbursemantTab";

import { useTranslation } from "react-i18next";

type TabKey = "attendance" | "leaves" | "reimbursement";

export default function AvailabilityScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  /* ---------------------- TABS ---------------------- */
  const tabs: { label: string; key: TabKey; icon: IconName }[] = [
    {
      label: t("availability.tabAttendance"),
      key: "attendance",
      icon: "alarm-line",
    },
    {
      label: t("availability.tabLeaves"),
      key: "leaves",
      icon: "calendar-line",
    },
    {
      label: t("availability.tabReimbursement"),
      key: "reimbursement",
      icon: "wallet-3-line",
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    scrollRef.current?.scrollTo({
      x: index * 120,
      animated: true,
    });
  };

  const activeTabKey = tabs[activeTab]?.key;

  return (
    <BodyLayout
      type="screen"
      screenName={t("availability.screenTitle") || "Availability"}
    >
      {/* ---------- TOP TABS ---------- */}
      <View style={{ marginBottom: 20 }}>
        <ScrollView
          horizontal
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {tabs.map((item, index) => {
            const isActive = index === activeTab;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive
                      ? theme.colors.colorPrimary600
                      : theme.colors.colorBgSurface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleTabPress(index)}
              >
                <RemixIcon
                  name={item.icon}
                  size={18}
                  color={
                    isActive
                      ? theme.colors.colorBgPage
                      : theme.colors.colorTextSecondary
                  }
                />

                <Text
                  style={[
                    isActive ? styles.activeTabText : styles.tabText,
                    {
                      color: isActive
                        ? theme.colors.colorBgPage
                        : theme.colors.colorTextSecondary,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ---------- TAB CONTENT ---------- */}
      {activeTabKey === "attendance" && <AttendanceTab />}
      {activeTabKey === "leaves" && <LeavesTab />}
      {activeTabKey === "reimbursement" && <ReimbursemantTab />}
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  tabsScrollContainer: {
    flexDirection: "row",
    gap: 10,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },

  activeTabText: {
    fontSize: 14,
    fontWeight: "600",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
});