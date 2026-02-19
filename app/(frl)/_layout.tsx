import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/theme/ThemeContext";
import { Tabs } from "expo-router";
import React from "react";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // <-- important!

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.btnPrimaryBg,
        tabBarInactiveTintColor: theme.colors.colorTextSecondary,

        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 60 + insets.bottom,
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
        name="(Tasks)"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="file-list-3-line" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(reports)"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="team-line" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(fro)"
        options={{
          title: "FROs",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="group-line" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <RemixIcon name="user-line" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
