import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SchemeTab() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  /* ---------- TABS ---------- */
  const tabs = [
    t("info.tabs.all"),
    t("info.tabs.housing"),
    t("info.tabs.legal"),
    t("info.tabs.support"),
  ];

  const [activeTab, setActiveTab] = useState(t("info.tabs.all"));

  /* ---------- DATA ---------- */
  const data = [
    {
      id: 1,
      title: t("info.items.item1.title"),
      tag: t("info.items.item1.tag"),
      desc: t("info.items.item1.desc"),
      category: t("info.tabs.support"),
    },
    {
      id: 2,
      title: t("info.items.item2.title"),
      tag: t("info.items.item2.tag"),
      desc: t("info.items.item2.desc"),
      category: t("info.tabs.housing"),
    },
    {
      id: 3,
      title: t("info.items.item3.title"),
      tag: t("info.items.item3.tag"),
      desc: t("info.items.item3.desc"),
      category: t("info.tabs.legal"),
    },
    {
      id: 4,
      title: t("info.items.item4.title"),
      tag: t("info.items.item4.tag"),
      desc: t("info.items.item4.desc"),
      category: t("info.tabs.support"),
    },
  ];

  const filteredData =
    activeTab === t("info.tabs.all")
      ? data
      : data.filter((item) => item.category === activeTab);

  return (
    <View style={{ marginTop: 0 }}>
      {/* ---------- TABS ---------- */}
      <View style={styles.tabContainer}>
        {tabs.map((label) => {
          const isActive = activeTab === label;

          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive
                    ? theme.colors.colorPrimary50
                    : theme.colors.colorBgPage,
                  borderColor: isActive
                    ? theme.colors.colorPrimary600
                    : theme.colors.colorPrimary600,
                },
              ]}
              onPress={() => setActiveTab(label)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive
                      ? theme.colors.btnPrimaryBg
                      : theme.colors.btnPrimaryBg,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
          {/* Title + Tag */}
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              {item.title}
            </Text>

            <View
              style={[
                styles.tagWrapper,
                { backgroundColor: theme.colors.validationWarningBg },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: theme.colors.validationWarningText },
                ]}
              >
                {item.tag}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text
            style={[
              styles.description,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {item.desc}
          </Text>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.btnPrimaryBg },
            ]}
            onPress={() => router.push("/articlepage")}
          >
            <Text
              style={[
                styles.buttonText,
                { color: theme.colors.btnPrimaryText },
              ]}
            >
              Read Article 
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
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

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 20,
  },

  tagWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },

  title: {
    flex: 1,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 22,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },

  button: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
