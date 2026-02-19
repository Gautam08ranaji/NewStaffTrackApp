import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";

export default function NotificationScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  interface NotificationType {
    id: number;
    icon: IconName;
    iconBg: string;
    title: string;
    subtitle: string;
    time: string;
    isNew: boolean;
  }

  const notifications: NotificationType[] = [
    {
      id: 1,
      icon: "file-copy-line",
      iconBg: "#1976D2",
      title: t("notifications.newCaseAssigned"),
      subtitle: `${t("notifications.ticketNumber")} TKT-14567-001`,
      time: `5 ${t("notifications.minAgo")}`,
      isNew: true,
    },
    {
      id: 2,
      icon: "error-warning-line",
      iconBg: "#E65100",
      title: t("notifications.ticketUpdated"),
      subtitle: t("notifications.newMessage"),
      time: `1 ${t("notifications.hourAgo")}`,
      isNew: true,
    },
    {
      id: 3,
      icon: "message-2-line",
      iconBg: "#2E7D32",
      title: t("notifications.supervisorComment"),
      subtitle: `${t("notifications.ticketNumber")} TKT-14567-002 • ${t(
        "notifications.newComment"
      )}`,
      time: `2 ${t("notifications.hourAgo")}`,
      isNew: false,
    },
  ];

  return (
    <BodyLayout screenName={t("notifications.screenTitle")} type="screen">
      <View style={styles.container}>
        {notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.colorBgSurface,
                borderLeftWidth: item.isNew ? 4 : 0,
                borderLeftColor: item.isNew
                  ? theme.colors.colorPrimary600
                  : "transparent",
              },
            ]}
          >
            <View style={styles.topRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.iconBg },
                ]}
              >
                <RemixIcon
                  name={item.icon}
                  size={24}
                  color={theme.colors.colorBgPage}
                />
              </View>

              {/* Title */}
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {item.title}
              </Text>

              {item.isNew && <View style={styles.dot} />}
            </View>

            {/* Subtitle */}
            <Text style={[styles.subtitle, styles.indented]}>
              {item.subtitle}
            </Text>

            {/* Time */}
            <Text style={[styles.time, styles.indented]}>{item.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.6,
    borderColor: "#E6E6E6",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

  dot: {
    width: 10,
    height: 10,
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    marginLeft: 10,
  },

  indented: {
    marginLeft: 57,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    marginTop: 4,
  },

  time: {
    fontSize: 12,
    color: "#999",
  },
});
