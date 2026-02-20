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
import DailyTab from "./dailyTab";
import MonthlyTab from "./monthly";

import { useTranslation } from "react-i18next";

type TabKey = "attendance" | "daily" | "weekly" | "monthly";

export default function AvailabilityScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  // ---------------------- i18n Tabs ----------------------
  const tabs: { label: string; key: TabKey; icon: IconName }[] = [
    {
      label: t("availability.tabAttendance"),
      key: "attendance",
      icon: "alarm-line",
    },
    { label: "Leaves", key: "daily", icon: "calendar-line" },
    {
      label: "Reimbursement",
      key: "monthly",
      icon: "calendar-2-line",
    },
  ];

  const [activeTab, setActiveTab] = useState(0); // index-based like CasesScreen

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    scrollRef.current?.scrollTo({
      x: index * 120, // adjust if needed
      animated: true,
    });
  };

  const activeTabKey = tabs[activeTab]?.key;

  return (
    <BodyLayout type="screen" screenName={t("availability.screenTitle")}>
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
                    elevation: 2,
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
                  style={
                    isActive
                      ? [
                          styles.activeTabText,
                          { color: theme.colors.colorBgPage },
                        ]
                      : [
                          styles.tabText,
                          { color: theme.colors.colorTextSecondary },
                        ]
                  }
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ---------- RENDER TAB SCREENS ---------- */}
      {activeTabKey === "attendance" && <AttendanceTab />}
      {activeTabKey === "daily" && <DailyTab />}
      {activeTabKey === "monthly" && <MonthlyTab />}
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
    gap: 10,
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
