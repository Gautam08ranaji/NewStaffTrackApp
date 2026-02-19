import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const knowledgeBaseData = [
  {
    id: 1,
    title: "Health",
    subtitle: "Awareness, Diagnostics, Treatment",
    type: "health",
  },
  {
    id: 2,
    title: "Shelter, Old Age Homes",
    subtitle: "Govt homes, Private homes, Admission & Eligibility",
    type: "shelter",
  },
  {
    id: 3,
    title: "Nutrition",
    subtitle: "Nutrition for health, Diet charts, Govt nutrition programs",
    type: "nutrition",
  },
  {
    id: 4,
    title: "Day-care Centres",
    subtitle: "Centre list, Activities, Timing/Fees",
    type: "dayCare",
  },
  {
    id: 5,
    title: "Elderly-friendly Products",
    subtitle: "Mobility aids, Daily living aids, Safety aids",
    type: "elder",
  },
  {
    id: 6,
    title: "Cultural, Spiritual, Art",
    subtitle: "Cultural / Spiritual programs, Art workshops, Recreational events",
    type: "cultural",
  },
  {
    id: 7,
    title: "Companionship",
    subtitle: "Community groups, Social groups, Volunteer companionship",
    type: "companionship",
  },
];

export default function InformationTab({ search = "" }) {
  const { theme } = useTheme();


  const routeMap: any = {
    health: "/detailCardScreen",
    shelter: "/detailCardScreen",
    nutrition: "/detailCardScreen",
    dayCare: "/detailCardScreen",
    elder: "/detailCardScreen",
    cultural: "/detailCardScreen",
    companionship: "/detailCardScreen",
  };


  const uiMap: any = {
    health: {
      bg: theme.colors.validationErrorBg,
      iconBg: theme.colors.validationErrorText,
      icon: "heart-line",
    },
    nutrition: {
      bg: theme.colors.validationErrorBg,
      iconBg: theme.colors.validationErrorText,
      icon: "dna-line",
    },
    elder: {
      bg: theme.colors.validationErrorBg,
      iconBg: theme.colors.validationErrorText,
      icon: "box-2-line",
    },

    dayCare: {
      bg: theme.colors.validationInfoBg,
      iconBg: theme.colors.validationInfoText,
      icon: "group-line",
    },
    cultural: {
      bg: theme.colors.validationInfoBg,
      iconBg: theme.colors.validationInfoText,
      icon: "hotel-line",
    },

    companionship: {
      bg: theme.colors.validationWarningBg,
      iconBg: theme.colors.validationWarningText,
      icon: "shake-hands-line",
    },

    shelter: {
      bg: theme.colors.validationSuccessBg,
      iconBg: theme.colors.validationSuccessText,
      icon: "home-5-line",
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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(routeMap[item.type])}
          >
            <View style={[styles.card, { backgroundColor: ui.bg }]}>
              {/* ICON BLOCK */}
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
          </TouchableOpacity>
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
