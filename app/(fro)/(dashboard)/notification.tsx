import BodyLayout from "@/components/layout/BodyLayout";
import { getInteractionsListByAssignToId } from "@/features/fro/interactionApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";

// Define the interaction type from your API
interface Interaction {
  id: number;
  transactionNumber: string;
  subject: string;
  categoryName: string;
  subCategoryName: string;
  subStatusId: number;
  subStatusName: string;
  priority: string;
  createdDate: string;
  assignToId: string;
  assignToName: string;
  name: string; // Contact name
  mobileNo: string;
  area: string;
  districtName: string;
  stateName: string;
  // Add other fields as needed
}

interface NotificationType {
  id: number;
  icon: IconName;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
  isNew: boolean;
  subStatusId: number;
  subStatusName: string;
  transactionNumber: string;
  contactName: string;
  mobileNo: string;
  location: string;
}

export default function NotificationScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const authState = useAppSelector((state) => state.auth);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchInteractions();
    }, []),
  );

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const res = await getInteractionsListByAssignToId({
        assignToId: String(authState.userId),
        pageNumber: 1,
        pageSize: 100,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("Fetched interactions:", res?.data?.interactions);
      // Log subStatusId values to verify
      console.log("SubStatus IDs:", res?.data?.interactions?.map((i: Interaction) => ({
        id: i.id,
        subStatusId: i.subStatusId,
        subStatusName: i.subStatusName
      })));
      
      setInteractions(res?.data?.interactions || []);
    } catch (error) {
      console.error("❌ Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get icon based on category or subStatus
  const getNotificationIcon = (interaction: Interaction): IconName => {
    if (interaction.subStatusId === 9) {
      return "checkbox-circle-line"; // Pending acceptance
    } else if (interaction.subStatusName?.toLowerCase().includes("accepted")) {
      return "check-line";
    } else if (interaction.subStatusName?.toLowerCase().includes("rejected")) {
      return "close-line";
    } else if (interaction.subStatusName?.toLowerCase().includes("progress")) {
      return "loader-line";
    } else if (interaction.subStatusName?.toLowerCase().includes("completed")) {
      return "check-double-line";
    }

    // Default icons based on category
    switch (interaction.categoryName?.toLowerCase()) {
      case "field intervention":
        return "map-pin-line";
      case "abuse":
        return "error-warning-line";
      default:
        return "file-copy-line";
    }
  };

  // Get icon background color based on status
  const getIconBgColor = (interaction: Interaction): string => {
    if (interaction.subStatusId === 22) {
      return "#E65100"; // Orange for pending
    } else if (interaction.subStatusName?.toLowerCase().includes("accepted")) {
      return "#2E7D32"; // Green for accepted
    } else if (interaction.subStatusName?.toLowerCase().includes("rejected")) {
      return "#C62828"; // Red for rejected
    } else if (interaction.subStatusName?.toLowerCase().includes("progress")) {
      return "#1976D2"; // Blue for in progress
    }

    // Priority based colors
    switch (interaction.priority?.toLowerCase()) {
      case "high":
        return "#C62828";
      case "medium":
        return "#E65100";
      case "low":
        return "#2E7D32";
      default:
        return "#1976D2";
    }
  };

  // Format time from createdDate
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t("notifications.minAgo")}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? t("notifications.hourAgo") : t("notifications.hoursAgo")}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? t("notifications.dayAgo") : t("notifications.daysAgo")}`;
    }
  };

  // Format location from area, district, state
  const formatLocation = (interaction: Interaction): string => {
    const parts = [];
    if (interaction.area) parts.push(interaction.area.split(",")[0].trim());
    if (interaction.districtName) parts.push(interaction.districtName);
    if (interaction.stateName) parts.push(interaction.stateName);
    return parts.join(", ");
  };

  // Transform interactions to notifications
  const notifications: NotificationType[] = interactions.map((interaction) => ({
    id: interaction.id,
    icon: getNotificationIcon(interaction),
    iconBg: getIconBgColor(interaction),
    title:
      interaction.subject ||
      `${interaction.transactionNumber} - ${interaction.categoryName}`,
    subtitle: `${t("notifications.ticketNumber")} ${interaction.transactionNumber} • ${interaction.subStatusName}`,
    time: formatTime(interaction.createdDate),
    isNew: interaction.subStatusId === 22, // Mark as new if pending (using 22 as per your getIconBgColor)
    subStatusId: interaction.subStatusId,
    subStatusName: interaction.subStatusName,
    transactionNumber: interaction.transactionNumber,
    contactName: interaction.name,
    mobileNo: interaction.mobileNo,
    location: formatLocation(interaction),
  }));

  const handleNotificationPress = (notification: NotificationType) => {
    // Handle navigation to notification details
    console.log("Pressed notification:", notification);
    // You can navigate to a details screen here
  };

  const handleAccept = (notification: NotificationType) => {
    // Handle accept action
    console.log("Accept:", notification);
    // Add your accept API call here
  };

  const handleReject = (notification: NotificationType) => {
    // Handle reject action
    console.log("Reject:", notification);
    // Add your reject API call here
  };

  return (
    <BodyLayout screenName={t("notifications.screenTitle")} type="screen">
      <View style={styles.container}>
        {loading && (
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("common.loading")}
          </Text>
        )}

        {!loading && notifications.length === 0 && (
          <Text
            style={[
              styles.emptyText,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("notifications.noNotifications")}
          </Text>
        )}

        {notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => handleNotificationPress(item)}
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
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <RemixIcon
                  name={item.icon}
                  size={24}
                  color={theme.colors.colorBgPage}
                />
              </View>

              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                {/* Contact Name */}
                <View style={styles.contactRow}>
                  <RemixIcon name="user-line" size={14} color={theme.colors.colorTextSecondary} />
                  <Text
                    style={[
                      styles.contactName,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {item.contactName}
                  </Text>
                </View>
              </View>

              {item.isNew && <View style={[styles.dot, { backgroundColor: theme.colors.colorPrimary600 }]} />}
            </View>

            {/* Mobile Number */}
            {item.mobileNo && (
              <View style={[styles.infoRow, styles.indented]}>
                <RemixIcon name="phone-line" size={14} color={theme.colors.colorTextSecondary} />
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {item.mobileNo}
                </Text>
              </View>
            )}

            {/* Location */}
            {item.location && (
              <View style={[styles.infoRow, styles.indented]}>
                <RemixIcon name="map-pin-line" size={14} color={theme.colors.colorTextSecondary} />
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>
            )}

            <Text style={[styles.subtitle, styles.indented]} numberOfLines={2}>
              {item.subtitle}
            </Text>

            <Text style={[styles.time, styles.indented]}>{item.time}</Text>

            {/* Show Accept/Reject buttons for pending status (subStatusId === 22 based on your getIconBgColor) */}
            {item.subStatusId === 22 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.acceptButton, { backgroundColor: "#2E7D32" }]}
                  onPress={() => handleAccept(item)}
                >
                  <Text style={styles.buttonText}>{t("common.accept")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectButton, { backgroundColor: "#C62828" }]}
                  onPress={() => handleReject(item)}
                >
                  <Text style={styles.buttonText}>{t("common.reject")}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Show status for other cases */}
            {item.subStatusId !== 22 && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.iconBg + "20" },
                ]}
              >
                <Text style={[styles.statusText, { color: item.iconBg }]}>
                  {item.subStatusName}
                </Text>
              </View>
            )}
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
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
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
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "500",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginLeft: 10,
    marginTop: 4,
  },
  indented: {
    marginLeft: 57,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
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
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginLeft: 57,
    gap: 8,
  },
  acceptButton: {
    paddingHorizontal: 40,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rejectButton: {
    paddingHorizontal: 40,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    marginLeft: 57,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});