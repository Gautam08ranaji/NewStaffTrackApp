import { useTheme } from "@/theme/ThemeContext";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

const knowledgeBaseData = [
  {
    id: 1,
    title: "Legal",
    subtitle: "Personal/Family Legal Issues, Right and Protection",
    type: "Legal",
  },
  {
    id: 2,
    title: "Dispute Resolution",
    subtitle: "Property/Neighbourhood disputes, Mediation process",
    type: "Dispute",
  },
  {
    id: 3,
    title: "Financial",
    subtitle: "Financial help, Investment guidance, Medical emergency",
    type: "Financial",
  },
  {
    id: 4,
    title: "Pension-related",
    subtitle: "Eligibility, Application process, Pension issue resolution",
    type: "Pension",
  },
  {
    id: 5,
    title: "Government Schemes",
    subtitle: "Central govt schemes, State govt schemes, How to apply",
    type: "Schemes",
  },
];

export default function GuidanceTab({ search = "" }) {
  const { theme } = useTheme();

  // ===============================
  // THEME UI MAP (Same structure as previous tabs)
  // ===============================
  const uiMap: any = {
    Financial: {
      bg: theme.colors.validationErrorBg,
      iconBg: theme.colors.validationErrorText,
      icon: "money-rupee-circle-line",
    },

    Dispute: {
      bg: theme.colors.validationInfoBg,
      iconBg: theme.colors.validationInfoText,
      icon: "group-line",
    },

    Legal: {
      bg: theme.colors.validationWarningBg,
      iconBg: theme.colors.validationWarningText,
      icon: "scales-3-line",
    },

    Schemes: {
      bg: theme.colors.validationWarningBg,
      iconBg: theme.colors.validationWarningText,
      icon: "file-list-3-line",
    },

    Pension: {
      bg: theme.colors.validationSuccessBg,
      iconBg: theme.colors.validationSuccessText,
      icon: "wallet-3-line",
    },
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return knowledgeBaseData;

    return knowledgeBaseData.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      renderItem={({ item }) => {
        const ui = uiMap[item.type];

        return (
          <View style={[styles.card, { backgroundColor: ui.bg }]}>
            {/* ICON BOX */}
            <View style={[styles.iconBox, { backgroundColor: ui.iconBg }]}>
              <RemixIcon
                name={ui.icon}
                size={20}
                color={theme.colors.colorBgSurface}
              />
            </View>

            {/* TEXT */}
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>

            {/* ARROW */}
            <RemixIcon
              name="arrow-right-up-line"
              size={20}
              color={ui.iconBg}
            />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginTop: 14,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
