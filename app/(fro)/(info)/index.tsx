import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import type { IconName } from "react-native-remix-icon";
import RemixIcon from "react-native-remix-icon";

import AttendanceTab from "./attendanceTab";

import { useTranslation } from "react-i18next";
import DailyTab from "./dailyTab";

type TabKey = "attendance" | "daily" | "weekly" | "monthly";

export default function AvailabilityScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  // ---------------------- i18n Tabs ----------------------
  const tabs: { label: string; key: TabKey; icon: IconName }[] = [
    {
      label: t("availability.tabAttendance"),
      key: "attendance",
      icon: "alarm-line",
    },
    { label: "Leaves", key: "daily", icon: "calendar-line" },
  ];

  const [activeTab, setActiveTab] = useState(0);

  // Calculate scroll position when active tab changes
  useEffect(() => {
    if (tabWidths.length > 0 && containerWidth > 0) {
      const scrollToX =
        tabWidths.slice(0, activeTab).reduce((acc, width) => acc + width, 0) +
        activeTab * 10; // 10 is gap

      scrollRef.current?.scrollTo({
        x: Math.max(
          0,
          scrollToX - containerWidth / 2 + tabWidths[activeTab] / 2,
        ),
        animated: true,
      });
    }
  }, [activeTab, tabWidths, containerWidth]);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
  };

  const handleTabLayout = (event: LayoutChangeEvent, index: number) => {
    const { width } = event.nativeEvent.layout;
    setTabWidths((prev) => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const activeTabKey = tabs[activeTab]?.key;

  // Determine if tabs should be scrollable or fit in container
  const totalTabsWidth =
    tabWidths.reduce((acc, width) => acc + width, 0) + (tabs.length - 1) * 10;
  const shouldScroll = totalTabsWidth > containerWidth && containerWidth > 0;

  return (
    <BodyLayout type="screen" screenName={"Attendance"}>
      {/* ---------- TOP TABS ---------- */}
      <View
        style={[styles.tabsContainer, { marginBottom: 20 }]}
        onLayout={handleContainerLayout}
      >
        {shouldScroll ? (
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
                      elevation: isActive ? 4 : 2,
                      shadowColor: theme.colors.colorShadow,
                      shadowOffset: { width: 0, height: isActive ? 2 : 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: isActive ? 4 : 2,
                    },
                  ]}
                  onPress={() => handleTabPress(index)}
                  onLayout={(e) => handleTabLayout(e, index)}
                  activeOpacity={0.7}
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
                      styles.tabText,
                      {
                        color: isActive
                          ? theme.colors.colorBgPage
                          : theme.colors.colorTextSecondary,
                        fontWeight: isActive ? "600" : "500",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.tabsContainer}>
            {tabs.map((item, index) => {
              const isActive = index === activeTab;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.tab,
                    styles.fixedTab,
                    {
                      backgroundColor: isActive
                        ? theme.colors.colorPrimary600
                        : theme.colors.colorBgSurface,
                      elevation: isActive ? 4 : 2,
                      shadowColor: theme.colors.colorShadow,
                      shadowOffset: { width: 0, height: isActive ? 2 : 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: isActive ? 4 : 2,
                    },
                  ]}
                  onPress={() => handleTabPress(index)}
                  activeOpacity={0.7}
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
                      styles.tabText,
                      {
                        color: isActive
                          ? theme.colors.colorBgPage
                          : theme.colors.colorTextSecondary,
                        fontWeight: isActive ? "600" : "500",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ---------- RENDER TAB SCREENS ---------- */}
      <View style={styles.contentContainer}>
        {activeTabKey === "attendance" && <AttendanceTab />}
        {activeTabKey === "daily" && <DailyTab />}
      </View>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tabsScrollContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16, // Add padding to the scroll container
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Reduced from 10 for better spacing
    minWidth: 130, // Minimum width for tabs
    // Shadow for better elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  fixedTab: {
    flex: 1, // Make tabs take equal space when not scrolling
  },
  tabText: {
    fontSize: 14,
    includeFontPadding: false, // Better text alignment
    textAlignVertical: "center",
  },
  contentContainer: {
    flex: 1,
    // Add padding for content
    paddingHorizontal: 16,
  },
});
