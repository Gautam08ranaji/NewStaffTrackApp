import { useTheme } from "@/theme/ThemeContext";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

const knowledgeBaseData = [
  {
    id: 1,
    title: "Direct Support",
    subtitle: "Abused Elderly, Missing/Homeless, Engagement Opportunities",
    type: "Support",
  },
  {
    id: 2,
    title: "Indirect Support",
    subtitle: "Wish Fulfilment, Charity/donation, Product, Service Needs, Other",
    type: "Indirect",
  },
];

export default function FieldInterventionTab({ search = "" }) {
  const { theme } = useTheme();

  // ===============================
  // THEME-BASED UI COLOR MAPPING
  // ===============================
  const uiMap: any = {
    Support: {
      bg: theme.colors.validationInfoBg,        // light blue bg
      iconBg: theme.colors.validationInfoText, // deep blue icon bg
      icon: "group-line",
    },

    Indirect: {
      bg: theme.colors.validationWarningBg,         // light orange bg
      iconBg: theme.colors.validationWarningText, // deep orange icon bg
      icon: "shake-hands-line",
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
              <RemixIcon name={ui.icon} size={20} color={theme.colors.colorBgSurface} />
            </View>

            {/* TEXTS */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.colorTextSecondary }]}>
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
