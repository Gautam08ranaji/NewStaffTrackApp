import BodyLayout from "@/components/layout/BodyLayout";
import Card from "@/components/reusables/Card";
import PunchInCard from "@/components/reusables/PunchInCard";
import ReusableCard from "@/components/reusables/ReusableCard";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";
import { useSelector } from "react-redux";

const TaskstatusData = [
  {
    id: 1,
    label: "Follow Up",
    value: 12,
    color: "#1677FF",
    bg: "#E9F4FF",
  },
  {
    id: 2,
    label: "Assigned",
    value: 8,
    color: "#2E7D32",
    bg: "#EAF7ED",
  },
  {
    id: 3,
    label: "In Progress",
    value: 15,
    color: "#FF8C00",
    bg: "#FFF3E0",
  },
  {
    id: 4,
    label: "Resolved",
    value: 5,
    color: "#1B5E20",
    bg: "#EAF7ED",
  },
  {
    id: 5,
    label: "Closed",
    value: 2,
    color: "#FF7A00",
    bg: "#FFF3E0",
  },
];

const recentAlerts: {
  id: number;
  title: string;
  time: string;
  icon: IconName;
  bg: string;
  color: string;
}[] = [
  {
    id: 1,
    title: "High Priority TaskPending",
    time: "5 min ago",
    icon: "error-warning-line",
    bg: "#FFEAEA",
    color: "#E62929",
  },
  {
    id: 2,
    title: "FRO Late Check-in Alert",
    time: "15 min ago",
    icon: "progress-1-line",
    bg: "#E9F4FF",
    color: "#1677FF",
  },
  {
    id: 3,
    title: "TaskResolved Successfully",
    time: "1 hour ago",
    icon: "checkbox-circle-line",
    bg: "#EAF7ED",
    color: "#16A34A",
  },
];

const topPerformers = [
  {
    id: 1,
    name: "Ashish Tomar",
    code: "FRO-001",
    Tasks: 28,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Gautam Rana",
    code: "FRO-005",
    Tasks: 25,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Abhishek Mishra",
    code: "FRO-012",
    Tasks: 23,
    rating: 4.6,
  },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const authState = useAppSelector((state) => state.auth);

  const antiforgeryToken = useSelector(
    (state: RootState) => state.antiForgery.antiforgeryToken,
  );

  // console.log("antiforgeryToken",antiforgeryToken);
  // console.log(authState.userId);
  // console.log(authState.token);

  const getAlertColor = (title: string) => {
    if (title.toLowerCase().includes("high")) {
      return theme.colors.validationErrorText;
    }

    if (title.toLowerCase().includes("resolved")) {
      return theme.colors.validationSuccessText;
    }

    return theme.colors.colorPrimary600;
  };

  const getAlertBg = (title: string) => {
    if (title.toLowerCase().includes("high")) {
      return theme.colors.validationErrorBg;
    }

    if (title.toLowerCase().includes("resolved")) {
      return theme.colors.validationSuccessBg;
    }

    return theme.colors.validationInfoBg;
  };

  return (
    <BodyLayout type="frl">
      <Text
        style={[
          theme.typography.fontH5,
          { color: theme.colors.colorPrimary600 },
        ]}
      >
        Attendance
      </Text>

      <PunchInCard />
      <Text
        style={[
          theme.typography.fontH5,
          { color: theme.colors.colorPrimary600, marginTop: 20 },
        ]}
      >
        {t("frl.home.TasksOverview")}
      </Text>
      <View style={styles.row}>
        <ReusableCard
          icon="file-text-line"
          count={"+9"}
          countBg={"#FF6900" + 22}
          title={t("frl.home.working")}
          subTitle={13}
          subTitleColor={"#FF6900"}
          bg={theme.colors.colorBgPage}
          iconBg="#FF6900"
          countColor={"#FF6900"}
          titleColor={theme.colors.colorTextSecondary}
          onPress={() => {
            router.push({
              pathname: "/(frl)/(Tasks)",
              params: { filter: "In Progress" },
            });
          }}
        />

        <ReusableCard
          icon="group-line"
          count={""}
          title={t("frl.home.newTasks")}
          subTitle={43}
          subTitleColor={theme.colors.validationInfoText}
          bg={theme.colors.colorBgPage}
          iconBg={theme.colors.validationInfoText}
          titleColor={theme.colors.colorTextSecondary}
          onPress={() => {
            router.push({
              pathname: "/(frl)/(fro)",
              params: { filter: "Available" },
            });
          }}
        />
      </View>

      <View style={styles.row}>
        <ReusableCard
          icon="user-follow-line"
          count={""}
          title={t("frl.home.approvedTasks")}
          subTitle={13}
          subTitleColor={"#00C950"}
          bg={theme.colors.colorBgPage}
          iconBg="#00C950"
          countColor={theme.colors.colorPrimary600}
          titleColor={theme.colors.colorTextSecondary}
          onPress={() => {
            router.push({
              pathname: "/(frl)/(fro)",
              params: { filter: "On Duty" },
            });
          }}
        />

        <ReusableCard
          icon="user-unfollow-line"
          count={""}
          title={t("frl.home.onTheWay")}
          subTitle={13}
          subTitleColor={"#6A7282"}
          bg={theme.colors.colorBgPage}
          iconBg="#6A7282"
          countColor={theme.colors.colorPrimary600}
          titleColor={theme.colors.colorTextSecondary}
          onPress={() => {
            router.push({
              pathname: "/(frl)/(fro)",
              params: { filter: "Off Duty" },
            });
          }}
        />
      </View>

      <Text
        style={[
          theme.typography.fontH5,
          { color: theme.colors.colorPrimary600, marginTop: 20 },
        ]}
      >
        {t("frl.home.quickActions")}
      </Text>

      <Card
        cardStyle={{
          backgroundColor: theme.colors.colorBgPage,
          gap: 10,
        }}
        titleColor={theme.colors.btnPrimaryBg}
      >
        <View style={[styles.row, { marginTop: 0 }]}>
          <ActionBox
            icon="file-text-line"
            label="Assign Case"
            onPress={() => {
              router.push({
                pathname: "/(frl)/(Tasks)",
                params: { filter: "New" },
              });
            }}
          />
          <ActionBox
            icon="map-pin-2-line"
            label="Live Tracking"
            onPress={() => {
              router.push({
                pathname: "/liveTracking",
              });
            }}
          />
        </View>

        <View style={[styles.row, { marginTop: 0 }]}>
          <ActionBox
            icon="group-line"
            label="View FROs"
            onPress={() => {
              router.push({
                pathname: "/(frl)/(fro)",
                params: { filter: "All" },
              });
            }}
          />
          <ActionBox icon="line-chart-line" label="Performance" />
        </View>
      </Card>

      <Text
        style={[
          theme.typography.fontH5,
          { color: theme.colors.colorPrimary600, marginTop: 20 },
        ]}
      >
        TaskStatus Overview
      </Text>
      <Card
        titleColor={theme.colors.colorTextSecondary}
        cardStyle={{ backgroundColor: theme.colors.colorBgPage }}
      >
        {TaskstatusData.map((item) => (
          <View key={item.id} style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View
                style={[styles.statusDot, { backgroundColor: item.color }]}
              />
              <Text
                style={[
                  theme.typography.fontBody,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.label}
              </Text>
            </View>

            <View style={styles.statusRight}>
              <View
                style={[styles.progressTrack, { backgroundColor: item.bg }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: item.color,
                      width: `${item.value * 5}%`,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  theme.typography.fontH5,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.value.toString().padStart(2, "0")}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      <Card cardStyle={{ backgroundColor: theme.colors.colorBgPage }}>
        <View style={[styles.row, { marginTop: 0 }]}>
          <Text
            style={[
              theme.typography.fontH5,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            Recent Alerts
          </Text>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            onPress={() => {
              router.push("/alert");
            }}
          >
            <Text
              style={[
                theme.typography.fontH5,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              View All Alerts
            </Text>
            <RemixIcon
              name="arrow-right-line"
              size={22}
              color={theme.colors.colorPrimary600}
            />
          </TouchableOpacity>
        </View>

        {recentAlerts.map((item) => (
          <View
            key={item.id}
            style={[
              styles.alertBox,
              { backgroundColor: getAlertBg(item.title) },
            ]}
          >
            <RemixIcon name={item.icon} size={22} color={item.color} />

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  theme.typography.fontH5,
                  { color: getAlertColor(item.title) },
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  theme.typography.fontBodySmall,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.time}
              </Text>
            </View>
          </View>
        ))}

        <Text
          style={[
            theme.typography.fontH5,
            {
              color: theme.colors.colorTextSecondary,
              marginTop: 20,
              marginBottom: 10,
            },
          ]}
        >
          Top Performers Today
        </Text>

        {topPerformers.map((user, index) => (
          <View
            key={user.id}
            style={[
              styles.performerBox,
              { backgroundColor: theme.colors.colorPrimary50 },
            ]}
          >
            <View
              style={[
                styles.rankCircle,
                { backgroundColor: theme.colors.colorPrimary600 },
              ]}
            >
              <Text
                style={[
                  styles.rankText,
                  { color: theme.colors.colorPrimary50 },
                ]}
              >
                #{index + 1}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.performerName,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {user.name}
              </Text>
              <Text
                style={[
                  styles.performerCode,
                  { color: theme.colors.colorTextTertiary },
                ]}
              >
                {user.code}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={[
                  styles.caseText,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {user.Tasks} Tasks
              </Text>

              <View style={{ flexDirection: "row", gap: 4 }}>
                <RemixIcon name="star-fill" size={14} color="#FACC15" />
                <Text
                  style={[
                    styles.ratingText,
                    { color: theme.colors.colorTextTertiary },
                  ]}
                >
                  {user.rating}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </BodyLayout>
  );
}

function ActionBox({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: theme.colors.colorBgSurface,
        borderWidth: 1,
        borderColor: theme.colors.colorPrimary600,
        padding: 15,
        flex: 1,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <RemixIcon name={icon} size={28} color={theme.colors.colorPrimary600} />
      <Text
        style={[
          theme.typography.fontH5,
          { marginTop: 10, color: theme.colors.colorPrimary600 },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
  },

  topRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  topBox: {
    padding: 20,
    borderRadius: 10,
    flex: 1,
  },

  alertBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  performerBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  rankCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  rankText: {
    fontWeight: "700",
  },

  performerName: {
    fontWeight: "700",
  },

  performerCode: {
    fontSize: 12,
  },

  caseText: {
    fontWeight: "700",
  },

  ratingText: {
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  progressTrack: {
    width: 140,
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
});
