import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/theme/ThemeContext";
import { Tabs } from "expo-router";
import React from "react";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.btnPrimaryBg,
        tabBarInactiveTintColor: theme.colors.colorTextSecondary,

        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          // height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },

        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="home-5-line" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(complaints)"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="customer-service-line" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(community)"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="team-line" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(info)"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="article-line" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="user-line" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
