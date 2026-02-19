import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

/* ================= PROPS ================= */

interface BodyLayoutProps {
  type: "dashboard" | "screen" | "frl";
  screenName?: string;
  children: React.ReactNode;

  scrollViewStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;

  enableScroll?: boolean; // ✅ NEW

  userName?: string;
  userId?: string;
  todaysDutyCount?: number | string;
  totalTasks?: number | string;
  notificationCount?: number;
}

export default function BodyLayout({
  type,
  screenName,
  children,
  scrollViewStyle,
  scrollContentStyle,

  enableScroll = true, // ✅ DEFAULT TRUE

  userName,
  userId,
  todaysDutyCount,
  totalTasks,
  notificationCount = 0,
}: BodyLayoutProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authState = useAppSelector((state) => state.auth);

  /* ================= ICON NAVIGATION ================= */

  const handleIconPress = (
    iconType: "notification" | "escalation" | "call",
  ) => {
    if (type === "frl") {
      if (iconType === "notification") {
        router.push("/(frl)/(dashboard)/notification");
      } else if (iconType === "escalation") {
        router.push("/(frl)/(dashboard)/alert");
      }
    } else {
      if (iconType === "notification") {
        router.push("/notification");
      } else if (iconType === "escalation") {
        router.push("/escalation");
      }
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.colorBgSurface },
      ]}
    >
      {/* ================= HEADER ================= */}

      {type === "dashboard" || type === "frl" ? (
        <View
          style={[
            styles.dashboardHeader,
            {
              backgroundColor: theme.colors.colorPrimary600,
              paddingVertical: 24,
            },
          ]}
        >
          {/* ================= TOP ROW ================= */}

          <View style={styles.topRow}>
            <View>
              <Text
                style={[
                  theme.typography.fontH5,
                  { color: theme.colors.colorBgPage },
                ]}
              >
                Hello, {userName || "User"}
              </Text>

              <Text
                style={[
                  theme.typography.fontBodySmall,
                  styles.subId,
                  {
                    color: theme.colors.colorBgPage,
                    fontSize: width * 0.035,
                  },
                ]}
              >
                {userId || ""}
              </Text>
            </View>

            {/* ================= ICONS ================= */}

            <View style={styles.iconRow}>
              <TouchableOpacity
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.colors.colorBgSurface },
                ]}
                onPress={() => handleIconPress("notification")}
              >
                <RemixIcon
                  name="notification-line"
                  size={22}
                  color={theme.colors.colorPrimary600}
                />

                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notificationCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.colors.colorBgSurface },
                ]}
                onPress={() => handleIconPress("escalation")}
              >
                <RemixIcon
                  name="alert-line"
                  size={22}
                  color={theme.colors.colorPrimary600}
                />
              </TouchableOpacity>

              {type !== "frl" && (
                <TouchableOpacity
                  style={[
                    styles.iconCircle,
                    { backgroundColor: theme.colors.colorBgSurface },
                  ]}
                >
                  <RemixIcon
                    name="phone-line"
                    size={22}
                    color={theme.colors.colorPrimary600}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ================= DASHBOARD STATS ================= */}

          {type !== "frl" && (
            <View
              style={[
                styles.bottomSection,
                { backgroundColor: theme.colors.colorPrimary50 },
              ]}
            >
              <View style={styles.row}>
                <Text
                  style={[
                    theme.typography.fontBody,
                    { color: theme.colors.colorPrimary600 },
                  ]}
                >
                  {"Today's Duty"}
                </Text>

                <Text
                  style={[
                    theme.typography.fontBody,
                    { color: theme.colors.colorPrimary600 },
                  ]}
                >
                  Total Tasks
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[
                    theme.typography.fontH4,
                    { color: theme.colors.colorPrimary600 },
                  ]}
                >
                  {todaysDutyCount ?? 0}
                </Text>

                <Text
                  style={[
                    theme.typography.fontH4,
                    { color: theme.colors.colorPrimary600 },
                  ]}
                >
                  {totalTasks ?? 0}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        /* ================= NORMAL SCREEN HEADER ================= */

        <View
          style={[
            styles.dashboardHeader,
            {
              backgroundColor: theme.colors.colorPrimary600,
              flexDirection: "row",
              paddingVertical: 20,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <RemixIcon
              name="arrow-left-line"
              size={26}
              color={theme.colors.colorBgPage}
            />
          </TouchableOpacity>

          <Text
            style={[
              theme.typography.fontH3,
              styles.screenTitle,
              {
                color: theme.colors.colorBgPage,
                fontSize: width * 0.05,
              },
            ]}
          >
            {screenName}
          </Text>
        </View>
      )}

      {/* ================= BODY ================= */}

      {enableScroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[
            styles.bodyContainer,
            { backgroundColor: theme.colors.colorBgSurface },
            scrollViewStyle,
          ]}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingBottom: insets.bottom + 16,
            },
            scrollContentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.bodyContainer,
            {
              backgroundColor: theme.colors.colorBgSurface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  dashboardHeader: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 1,
    flexDirection: "column",
    gap: 16,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subId: {
    marginTop: 2,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconCircle: {
    padding: 8,
    borderRadius: 20,
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "red",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  bottomSection: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  screenTitle: {
    fontWeight: "700",
    marginLeft: 10,
  },

  bodyContainer: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
});
