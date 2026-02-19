import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// IMPORT ALL TAB SCREENS
import InformationTab from "./InformationTabs";
import DocumentsTab from "./documents";
import EmotionalSupportTab from "./emotionalSupport";
import FieldInterventionTab from "./fieldIntervention";
import GuidanceTab from "./guidance";
import SchemeTab from "./scheme";

export default function InfoScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("information");

  const tabs = [
    { key: "scheme", label: t("Article") },
    { key: "information", label: t("Information") },
    { key: "guidance", label: t("Guidance") },
    { key: "field_intervention", label: t("Field Intervention") },
    { key: "emotional_support", label: t("Emotional Support") },
    { key: "Documents", label: "Documents" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "information":
        return <InformationTab />;
      case "guidance":
        return <GuidanceTab />;
      case "field_intervention":
        return <FieldInterventionTab />;
      case "emotional_support":
        return <EmotionalSupportTab />;
      case "scheme":
        return <SchemeTab />;
      case "Documents":
        return <DocumentsTab />;
      default:
        return null;
    }
  };

  return (
    <BodyLayout scrollContentStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}  type="screen" screenName="Community">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollTabs,
          {
            backgroundColor: theme.colors.colorPrimary50,
            borderColor: theme.colors.btnPrimaryBg
          }
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                { borderColor: theme.colors.btnPrimaryBg },
                isActive && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.colors.colorPrimary600 },
                  isActive && { color: theme.colors.btnPrimaryText },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* TAB CONTENT */}
      <View style={{ padding: 16 }}>
        {renderTabContent()}
      </View>

    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  scrollTabs: {
    flexDirection: "row",
    paddingTop: 6,
    borderBottomWidth: 2
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRightWidth: 2
  },
  tabText: {
    fontSize: 14,
    color: "#555",
    maxWidth: 140,
  },
});
