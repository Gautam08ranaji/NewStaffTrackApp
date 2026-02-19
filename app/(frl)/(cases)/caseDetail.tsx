import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const { width } = Dimensions.get("window");

/* ✅ STATIC JSON DATA (NO ICONS) */
const caseDetailData = {
  ticketNo: "TKT-14567-001",

  user: {
    name: "Ram Prasad Sharma",
    age: 72,
    gender: "Male",
    address: "Ameerpur, Agra, UP",
    phone: "+91-9453416629",
    emergencyPhone: "+91-9876543210",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },

  complaint: {
    category: "स्वास्थ्य सहायता",
    details: "बुजुर्ग को चलने में कठिनाई हो रही है...",
  },

  fro: {
    name: "Priya Singh",
    code: "FRO-002",
    status: "Working",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
  },

  location: {
    address: "123, Ameerpur, Sector 5, Agra, Uttar Pradesh - 400001",
  },

  timeline: {
    completedSteps: 3,
    steps: [
      { titleKey: "registered", time: "10:30 AM" },
      { titleKey: "assigned", time: "10:45 AM" },
      { titleKey: "approved" },
      { titleKey: "onway" },
      { titleKey: "arrived" },
      { titleKey: "working" },
    ],
  },
};

export default function CaseDetailScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  /* ✅ GET ASSIGNED STATUS FROM NAVIGATION */
  const { assigned } = useLocalSearchParams();
  const isAssigned = assigned === "yes";

  const { user, complaint, fro, location, timeline, ticketNo } = caseDetailData;

  const completedSteps = timeline.completedSteps;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: completedSteps,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <BodyLayout
      type="screen"
      screenName={t("caseDetail.screenTitle", { ticket: ticketNo })}
    >
      {/* ✅ PROFILE CARD */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.colors.colorPrimary600 },
        ]}
      >
        <View style={styles.profileTopRow}>
          <View style={styles.profileLeftRow}>
            <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
            <View style={{ maxWidth: width * 0.55 }}>
              <Text
                style={[styles.profileName, { color: theme.colors.inputBg }]}
              >
                {user.name}
              </Text>
              <Text
                style={[styles.profileSub, { color: theme.colors.inputBg }]}
              >
                {user.age} Years • {user.gender}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.profileSub, { color: theme.colors.inputBg }]}
              >
                {user.address} • {ticketNo}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.callBtn,
              { backgroundColor: theme.colors.colorBgSurface },
            ]}
          >
            <RemixIcon name="phone-line" size={22} color="#0F766E" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileBottomRow}>
          <View>
            <Text
              style={[styles.profileLabel, { color: theme.colors.inputBg }]}
            >
              Phone No.:
            </Text>
            <Text
              style={[styles.profileValue, { color: theme.colors.inputBg }]}
            >
              {user.phone}
            </Text>
          </View>

          <View>
            <Text
              style={[styles.profileLabel, { color: theme.colors.inputBg }]}
            >
              Emergency Contact:
            </Text>
            <Text
              style={[styles.profileValue, { color: theme.colors.inputBg }]}
            >
              {user.emergencyPhone}
            </Text>
          </View>
        </View>
      </View>

      {/* ✅ COMPLAINT INFO */}
      <View
        style={[styles.card, { backgroundColor: theme.colors.colorBgPage }]}
      >
        <Text
          style={[styles.cardTitle, { color: theme.colors.colorPrimary600 }]}
        >
          {t("caseDetail.complaintInfo")}
        </Text>

        <Text
          style={[styles.labelKey, { color: theme.colors.colorTextSecondary }]}
        >
          {t("caseDetail.category")}:
        </Text>
        <Text
          style={[
            styles.labelValue,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {complaint.category}
        </Text>

        <Text
          style={[
            styles.labelKey,
            styles.mt12,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {t("caseDetail.details")}:
        </Text>
        <Text
          style={[
            styles.labelValue,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {complaint.details}
        </Text>

        <Text
          style={[
            styles.labelKey,
            styles.mt12,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {t("caseDetail.attachments")}:
        </Text>

        <View
          style={[
            styles.attachmentBox,
            { backgroundColor: theme.colors.colorPrimary50 },
          ]}
        >
          <RemixIcon
            name="image-line"
            size={32}
            color={theme.colors.colorPrimary600}
          />
        </View>
      </View>

      {/* ✅ ASSIGN BUTTON ONLY IF NOT ASSIGNED */}
      {!isAssigned && (
        <TouchableOpacity
          style={[
            styles.assignBtn,
            { backgroundColor: theme.colors.btnPrimaryBg },
          ]}
          onPress={() => router.push("/assignScreen")}
        >
          <Text style={styles.assignText}>Assign to FRO</Text>
        </TouchableOpacity>
      )}

      {/* ✅ ASSIGNED TO (ONLY IF ASSIGNED) */}
      {isAssigned && (
        <>
          <Text
            style={[
              theme.typography.fontBody,
              styles.mt20,
              { color: theme.colors.colorPrimary600 },
            ]}
          >
            Assigned to
          </Text>

          <View
            style={[
              styles.froCard,
              { backgroundColor: theme.colors.colorPrimary600 },
            ]}
          >
            <View style={styles.froTopRow}>
              <View style={styles.froLeftRow}>
                <Image source={{ uri: fro.avatar }} style={styles.froAvatar} />
                <View>
                  <Text
                    style={[styles.froName, { color: theme.colors.inputBg }]}
                  >
                    {fro.name}
                  </Text>
                  <Text
                    style={[styles.froCode, { color: theme.colors.inputBg }]}
                  >
                    {fro.code}
                  </Text>
                </View>
              </View>

              <View style={styles.statusBadge}>
                <Text
                  style={[
                    theme.typography.fontBadge,
                    { color: theme.colors.colorPrimary600 },
                  ]}
                >
                  {fro.status}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.callFullBtn}>
              <RemixIcon name="phone-line" size={20} color="#0F766E" />
              <Text style={styles.callFullBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ✅ FRO LOCATION ONLY IF ASSIGNED */}
      {isAssigned && (
        <View
          style={[
            styles.mapContainer,
            { backgroundColor: theme.colors.colorBgPage },
          ]}
        >
          <Text
            style={[
              theme.typography.fontBody,
              { color: theme.colors.colorPrimary600 },
            ]}
          >
            {"Fro's Location"}
          </Text>

          <Text
            style={[styles.mapText, { color: theme.colors.colorTextSecondary }]}
          >
            Live Location:
          </Text>

          <Text
            style={[styles.mapText, { color: theme.colors.colorTextSecondary }]}
          >
            {location.address}
          </Text>

          <View style={styles.mapCard}>
            <Text style={styles.mapPlaceholder}>[ Map View Here ]</Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <RemixIcon name="map-pin-line" size={18} color="#fff" />
            <Text style={styles.callButtonText}>Open In Map</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ TIMELINE */}
      <View
        style={[styles.card, { backgroundColor: theme.colors.colorBgPage }]}
      >
        <Text
          style={[styles.cardTitle, { color: theme.colors.colorPrimary600 }]}
        >
          {t("caseDetail.timeline")}
        </Text>

        <View style={styles.timelineContainer}>
          {timeline.steps.map((item, index) => {
            const isLast = index === timeline.steps.length - 1;

            const lineProgress = animatedProgress.interpolate({
              inputRange: [index, index + 1],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            });

            return (
              <View key={index} style={styles.progressRow}>
                <View style={styles.progressLeft}>
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          index < completedSteps
                            ? theme.colors.colorPrimary600
                            : "#D8D8D8",
                      },
                    ]}
                  />

                  {!isLast && (
                    <View style={styles.lineContainer}>
                      <Animated.View
                        style={[
                          styles.lineFill,
                          {
                            backgroundColor: theme.colors.colorPrimary600,
                            width: lineProgress,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.progressContent}>
                  <Text
                    style={[
                      styles.progressTitle,
                      {
                        color:
                          index < completedSteps
                            ? theme.colors.colorPrimary600
                            : theme.colors.colorTextSecondary,
                      },
                    ]}
                  >
                    {t(`caseDetail.steps.${item.titleKey}`)}
                  </Text>

                  {item.time && (
                    <Text
                      style={[
                        styles.progressTime,
                        { color: theme.colors.colorTextSecondary },
                      ]}
                    >
                      {item.time}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </BodyLayout>
  );
}

/* ✅ STYLES */
const styles = StyleSheet.create({
  mt12: { marginTop: 12 },
  mt20: { marginTop: 20 },

  profileCard: { borderRadius: 14, padding: 16 },
  profileTopRow: { flexDirection: "row", justifyContent: "space-between" },
  profileLeftRow: { flexDirection: "row", alignItems: "center" },
  profileAvatar: { width: 54, height: 54, borderRadius: 27, marginRight: 12 },
  profileName: { fontSize: 16, fontWeight: "800" },
  profileSub: { fontSize: 12, marginTop: 2 },

  callBtn: { padding: 20, borderRadius: 99 },

  profileBottomRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  profileLabel: { fontSize: 12 },
  profileValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },

  card: {
    marginTop: 14,
    padding: 18,
    borderRadius: 12,
    elevation: 3,
  },

  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

  labelKey: { fontSize: 14, fontWeight: "500" },
  labelValue: { fontSize: 14, fontWeight: "600" },

  attachmentBox: {
    height: 70,
    borderRadius: 10,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  froCard: { marginTop: 14, borderRadius: 14, padding: 16 },
  froTopRow: { flexDirection: "row", justifyContent: "space-between" },
  froLeftRow: { flexDirection: "row", alignItems: "center" },
  froAvatar: { width: 46, height: 46, borderRadius: 23, marginRight: 10 },

  froName: { fontSize: 15, fontWeight: "800" },
  froCode: { fontSize: 12, marginTop: 2 },

  statusBadge: {
    backgroundColor: "#ECFEFF",
    paddingHorizontal: 20,
    borderRadius: 18,
    justifyContent: "center",
  },

  callFullBtn: {
    marginTop: 14,
    backgroundColor: "#ECFEFF",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },

  callFullBtnText: { color: "#027A61", fontSize: 15, fontWeight: "700" },

  mapContainer: { marginTop: 14, padding: 18, borderRadius: 12, elevation: 3 },

  mapText: { marginTop: 8 },

  mapCard: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0f766e",
    backgroundColor: "#e2e8f0",
  },

  mapPlaceholder: {
    height: 200,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#475569",
  },

  callButton: {
    marginTop: 12,
    backgroundColor: "#0f766e",
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },

  callButtonText: { color: "#fff", fontWeight: "600" },

  timelineContainer: { marginTop: 10010 },
  progressRow: { flexDirection: "row", minHeight: 55 },
  progressLeft: { width: 30, alignItems: "center" },

  dot: { width: 20, height: 20, borderRadius: 20 },

  lineContainer: {
    width: 2,
    height: 40,
    backgroundColor: "#D8D8D8",
    overflow: "hidden",
    marginTop: -2,
  },

  lineFill: { height: "100%", width: "0%" },

  progressContent: { paddingLeft: 10, paddingBottom: 10, flex: 1 },
  progressTitle: { fontSize: 14, fontWeight: "600" },
  progressTime: { fontSize: 12, marginTop: 2 },

  assignBtn: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  assignText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
