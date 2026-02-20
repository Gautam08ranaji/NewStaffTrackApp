import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Attendance from "./attendanceScreen";
import CaseAnalytics from "./caseAnalytics";
import CaseOverview from "./overView";
import Performance from "./performance";

const tabs = ["My Overview", "Task Analytics", "Attendance", "Performance"];

export default function SelfPerformanceScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("My Overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "My Overview":
        return <CaseOverview />;

      case "Task Analytics":
        return <CaseAnalytics />;

      case "Attendance":
        return <Attendance />;

      case "Performance":
        return <Performance />;

      default:
        return null;
    }
  };

  return (
    <BodyLayout type="screen" screenName="My Performance Reports">
      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab
                      ? theme.colors.colorPrimary600
                      : "transparent",
                  borderColor: theme.colors.colorPrimary600,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab ? "#fff" : theme.colors.colorPrimary600,
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {renderTabContent()}
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  tabsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: "600" },
});
