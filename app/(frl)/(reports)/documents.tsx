import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function DocumentsTab() {
  const { theme } = useTheme();

  const tabs = ["Policy", "Act & Rules", "Documents", "Press Release"];
  const [activeTab, setActiveTab] = useState("Policy");

  const data = [
    {
      id: 1,
      title: "National Housing Policy Guidelines",
      desc:
        "Overview of housing schemes, eligibility criteria, and benefits under government initiatives.",
      category: "Policy",
    },
    {
      id: 2,
      title: "Senior Citizen Welfare Act",
      desc:
        "Legal provisions, rights, and protections available for senior citizens.",
      category: "Act & Rules",
    },
    {
      id: 3,
      title: "Application & Reference Documents",
      desc:
        "Official documents, forms, and references required for public services.",
      category: "Documents",
    },
    {
      id: 4,
      title: "Latest Government Press Release",
      desc:
        "Recent announcements and official press releases issued by the department.",
      category: "Press Release",
    },
  ];

  const filteredData = data.filter(
    (item) => item.category === activeTab
  );

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map((label) => {
          const isActive = activeTab === label;

          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive
                    ? theme.colors.btnPrimaryBg
                    : theme.colors.colorBgPage,
                  borderColor: isActive
                    ? theme.colors.btnPrimaryBg
                    : theme.colors.colorBorder,
                },
              ]}
              onPress={() => setActiveTab(label)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive
                      ? theme.colors.btnPrimaryText
                      : theme.colors.colorTextSecondary,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ---------- CARD LIST ---------- */}
      {filteredData.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.colorBgSurface,
              borderColor: theme.colors.colorBorder,
            },
          ]}
        >
          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: theme.colors.colorPrimary600 },
            ]}
          >
            {item.title}
          </Text>

          <Text
            style={[
              styles.description,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {item.desc}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.btnPrimaryBg },
            ]}
            onPress={() => router.push("/articlepage")}
            activeOpacity={0.85}
          >
            <RemixIcon
              name="file-text-line"
              size={16}
              color={theme.colors.btnPrimaryText}
            />
            <Text
              style={[
                styles.buttonText,
                { color: theme.colors.btnPrimaryText },
              ]}
            >
              View Document
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },

  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 22,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },

  button: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
