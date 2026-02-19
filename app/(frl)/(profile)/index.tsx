import BodyLayout from "@/components/layout/BodyLayout";
import ReusableCard from "@/components/reusables/ReusableCard";
import { logout } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/logoutApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";

/* ================= STATIC DATA WITH PROPER TYPES ================= */

type TeamMember = {
  id: number;
  name: string;
  code: string;
  Tasks: number;
  rating: number;
  status: "Active" | "Offline";
};

type Achievement = {
  id: number;
  title: string;
  date: string;
  icon: IconName;
};

type SettingItem = {
  id: number;
  label: string;
  icon: IconName;
  onPress: () => void;
};

const teamData: TeamMember[] = [
  {
    id: 1,
    name: "Ashish Tomar",
    code: "FRO-001",
    Tasks: 8,
    rating: 4.8,
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Singh",
    code: "FRO-002",
    Tasks: 6,
    rating: 4.7,
    status: "Active",
  },
  {
    id: 3,
    name: "Amit Sharma",
    code: "FRO-003",
    Tasks: 4,
    rating: 4.5,
    status: "Offline",
  },
  {
    id: 4,
    name: "Ashish Tomar",
    code: "FRO-001",
    Tasks: 8,
    rating: 4.8,
    status: "Active",
  },
  {
    id: 5,
    name: "Ashish Tomar",
    code: "FRO-001",
    Tasks: 8,
    rating: 4.8,
    status: "Active",
  },
];

const achievements: Achievement[] = [
  {
    id: 1,
    title: "Top Zone Leader",
    date: "November 2024",
    icon: "trophy-line",
  },
  {
    id: 2,
    title: "Best Team Performance",
    date: "October 2024",
    icon: "star-line",
  },
  {
    id: 3,
    title: "1000+ Case Resolved",
    date: "September 2024",
    icon: "target-line",
  },
  {
    id: 4,
    title: "Zero Escalations Week",
    date: "August 2024",
    icon: "sparkling-line",
  },
];

const settings: SettingItem[] = [
  {
    id: 1,
    label: "Notification Settings",
    icon: "notification-3-line",
    onPress: () => router.push("/(frl)/(profile)/NotificationsScreen"),
  },
  {
    id: 2,
    label: "Change Password",
    icon: "lock-line",
    onPress: () => router.push("/(frl)/(profile)/changePassword"),
  },
  {
    id: 3,
    label: "Help & Support",
    icon: "question-line",
    onPress: () => router.push("/(frl)/(profile)/helpAndSupport"),
  },
  {
    id: 4,
    label: "App Settings",
    icon: "settings-3-line",
    onPress: () => router.push("/(frl)/(profile)/appSetting"),
  },
  {
    id: 5,
    label: "About",
    icon: "information-line",
    onPress: () => router.push("/(frl)/(profile)/about"),
  },
];

/* ================= SCREEN ================= */

export default function ProfileScreen() {
  const { theme } = useTheme();
  const authState = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const antiforgeryToken = useAppSelector(
    (state) => state.auth.antiforgeryToken,
  );

  console.log(authState.userId);
  // console.log("anttt", antiforgeryToken);

  const logOutApi = async () => {
    try {
      const response = await logoutUser(
        String(authState.userId),
        String(authState.token),
        String(antiforgeryToken),
      );

      // console.log("Logout API response:", response);

      // ✅ Normal logout
      dispatch(logout());
      router.replace("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);

      const status = error?.status || error?.response?.status;
      const message =
        error?.data?.data ||
        error?.response?.data?.data ||
        "Your session has expired. Please login again.";

      // ✅ Handle Session Expired / Logged in elsewhere
      if (status === 440) {
        Alert.alert("Session Expired", message, [{ text: "OK" }], {
          cancelable: false,
        });

        // ⏳ Wait 3 seconds → clear auth → go to login
        setTimeout(() => {
          dispatch(logout()); // clear redux auth
          router.replace("/login"); // redirect
        }, 3000);

        return;
      }

      // ❌ Fallback error
      Alert.alert("Logout Failed", "Something went wrong. Please try again.");
    }
  };

  return (
    <BodyLayout type="screen" screenName="Profile">
      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.colors.colorPrimary600 },
        ]}
      >
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.colors.inputBg }]}>
            Pramod Rai
          </Text>
          <Text style={[styles.role, { color: theme.colors.inputBg }]}>
            Field Response Leader
          </Text>
          <Text style={[styles.code, { color: theme.colors.inputBg }]}>
            FRL-LKO-001
          </Text>

          <View style={styles.contactRow}>
            <Text style={[styles.contact, { color: theme.colors.inputBg }]}>
              +91-94534 16629
            </Text>
            <Text style={[styles.contact, { color: theme.colors.inputBg }]}>
              pramodrai@gov.in
            </Text>
          </View>

          <View style={styles.zoneRow}>
            <Text style={[styles.zoneText, { color: theme.colors.inputBg }]}>
              Zone{"\n"}Central Lucknow
            </Text>
            <Text style={[styles.zoneText, { color: theme.colors.inputBg }]}>
              Since{"\n"}Jan 2023
            </Text>
          </View>
        </View>
      </View>

      {/* ================= REPORTS CTA ================= */}
      <View
        style={[
          styles.reportsCard,
          { backgroundColor: theme.colors.validationInfoBg },
        ]}
      >
        <Text
          style={[
            styles.reportTitle,
            { color: theme.colors.validationInfoText },
          ]}
        >
          {/* Team Reports & Analytics */}
        </Text>
        <Text
          style={[
            styles.reportDesc,
            { color: theme.colors.validationInfoText },
          ]}
        >
          You can track all of your team’s and Tasks reports from here
        </Text>

        <TouchableOpacity
          style={[
            styles.reportBtn,
            { backgroundColor: theme.colors.validationInfoText },
          ]}
          onPress={() => {
            router.push("/(frl)/(profile)/TeamOverviewScreen");
          }}
        >
          <Text
            style={[
              styles.reportBtnText,
              { color: theme.colors.validationInfoBg },
            ]}
          >
            See Reports
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.colorTextSecondary },
        ]}
      >
        Leadership Statistics
      </Text>

      <View style={styles.row}>
        <ReusableCard
          icon="group-line"
          count={""}
          title={"Team Size"}
          subTitle={"24 FROs"}
          subTitleColor={theme.colors.validationInfoText}
          bg={theme.colors.colorBgPage}
          iconBg={theme.colors.validationInfoText}
          titleColor={theme.colors.colorTextSecondary}
        />

        <ReusableCard
          icon="map-pin-2-line"
          count={""}
          title={"Zone Coverage"}
          subTitle={"12 Areas"}
          subTitleColor={"#FF6900"}
          bg={theme.colors.colorBgPage}
          iconBg={theme.colors.validationErrorText}
          titleColor={theme.colors.colorTextSecondary}
        />
      </View>
      <View style={styles.row}>
        <ReusableCard
          icon="award-line"
          count={""}
          title={"Team Rating"}
          subTitle={"4.7/5.0"}
          subTitleColor={"#FF6900"}
          bg={theme.colors.colorBgPage}
          iconBg={theme.colors.colorWarning400}
          titleColor={theme.colors.colorTextSecondary}
        />

        <ReusableCard
          icon="line-chart-line"
          count={""}
          title={"Resolution Rate"}
          subTitle={"87%"}
          subTitleColor={theme.colors.validationInfoText}
          bg={theme.colors.colorBgPage}
          iconBg={theme.colors.validationSuccessText}
          titleColor={theme.colors.colorTextSecondary}
        />
      </View>

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.colorTextSecondary },
        ]}
      >
        Your Team (Top 5)
      </Text>

      {teamData.map((member) => (
        <View
          key={member.id}
          style={[styles.teamRow, { backgroundColor: theme.colors.colorBgAlt }]}
        >
          <View
            style={[
              styles.initialCircle,
              { backgroundColor: theme.colors.colorPrimary600 },
            ]}
          >
            <Text
              style={[
                styles.initialText,
                { color: theme.colors.colorPrimary50 },
              ]}
            >
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.memberName,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              {member.name}
            </Text>
            <Text
              style={[
                styles.memberMeta,
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              {member.code} • {member.Tasks} Tasks
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <View
              style={[
                styles.statusBadge,
                member.status === "Active"
                  ? { backgroundColor: theme.colors.validationSuccessBg }
                  : { backgroundColor: theme.colors.validationErrorBg },
              ]}
            >
              <Text
                style={{
                  color:
                    member.status === "Active"
                      ? theme.colors.validationSuccessText
                      : theme.colors.validationErrorText,
                  fontWeight: "700",
                }}
              >
                {member.status}
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <RemixIcon name="star-fill" size={12} color="#FACC15" />
              <Text
                style={[
                  styles.ratingText,
                  { color: theme.colors.colorTextTertiary },
                ]}
              >
                {member.rating}
              </Text>
            </View>
          </View>
        </View>
      ))}

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.colorTextSecondary },
        ]}
      >
        Leadership Achievements
      </Text>

      {achievements.map((item) => (
        <View
          key={item.id}
          style={[
            styles.achievementRow,
            { backgroundColor: theme.colors.validationWarningBg },
          ]}
        >
          <RemixIcon
            name={item.icon}
            size={22}
            color={theme.colors.validationWarningText}
          />
          <View>
            <Text
              style={[
                styles.achievementTitle,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.achievementDate,
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              {item.date}
            </Text>
          </View>
        </View>
      ))}

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.colorTextSecondary },
        ]}
      >
        Settings
      </Text>

      {settings.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={item.onPress}
          style={[
            styles.settingRow,
            { backgroundColor: theme.colors.colorBgAlt },
          ]}
        >
          <View style={styles.settingLeft}>
            <RemixIcon
              name={item.icon}
              size={18}
              color={theme.colors.colorPrimary600}
            />
            <Text
              style={[
                styles.settingText,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              {item.label}
            </Text>
          </View>

          <RemixIcon
            name="arrow-right-s-line"
            size={20}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.logoutBtn,
          {
            backgroundColor: theme.colors.colorError100,
            borderColor: theme.colors.validationErrorText,
          },
        ]}
        onPress={() => {
          logOutApi();
        }}
      >
        <RemixIcon
          name="logout-circle-r-line"
          size={20}
          color={theme.colors.validationErrorText}
        />

        <Text
          style={[
            styles.logoutText,
            { color: theme.colors.validationErrorText },
          ]}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },

  iconBadge: { padding: 8, borderRadius: 20 },
  badgeDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "700" },

  profileCard: {
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
  },

  name: { fontWeight: "700", fontSize: 16 },
  role: { fontSize: 12 },
  code: { fontSize: 11 },

  contactRow: { marginTop: 6 },
  contact: { fontSize: 12 },

  zoneRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  zoneText: { fontSize: 12 },

  reportsCard: {
    marginTop: 16,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 16,
  },

  reportTitle: { fontWeight: "700" },
  reportDesc: { marginVertical: 6, fontSize: 12 },

  reportBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  reportBtnText: { fontWeight: "700" },

  sectionTitle: {
    marginTop: 22,
    marginHorizontal: 12,
    fontWeight: "700",
  },

  teamRow: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: { fontWeight: "700" },

  memberName: { fontWeight: "700" },
  memberMeta: { fontSize: 12 },
  ratingText: { fontSize: 12 },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  achievementRow: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  achievementTitle: { fontWeight: "700" },
  achievementDate: { fontSize: 12 },

  settingRow: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  settingText: { fontWeight: "600" },

  logoutBtn: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  logoutText: {
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
  },
});
