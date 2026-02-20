import BodyLayout from "@/components/layout/BodyLayout";
import CircularKPIChart from "@/components/reusables/CircularKPIChart";
import FROPerformanceCard from "@/components/reusables/FROPerformanceCard";
import PunchInCard from "@/components/reusables/PunchInCard";
import ReusableCard from "@/components/reusables/ReusableCard";
import { getDashCount } from "@/features/fro/interaction/countApi";
import { getUserDataById } from "@/features/fro/profile/getProfile";
import { useInteractionPopupPoller } from "@/hooks/InteractionPopupProvider";
import { useFROLocationUpdater } from "@/hooks/useFROLocationUpdater";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import RemixIcon from "react-native-remix-icon";

/* ================= TYPES ================= */

type DashCount = {
  closed: number;
  open: number;
  inProgress: number;
  tickets: number;
};

/* ================= SCREEN ================= */

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const authState = useAppSelector((state) => state.auth);
  const { Popup } = useInteractionPopupPoller();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [count, setCount] = useState<DashCount>({
    closed: 0,
    open: 0,
    inProgress: 0,
    tickets: 0,
  });

  // Location state
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationAddress, setLocationAddress] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);

  /* 🔴 Demo Attendance Values (replace with API later) */
  const presentDays = 20;
  const absentDays = 6;

  const totalDays = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  const attendanceRateNum = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  /* 🔴 KPI calculation */
  const completionRate =
    count.tickets > 0 ? (count.closed / count.tickets) * 100 : 0;

  useFROLocationUpdater(authState?.userId);

  useFocusEffect(
    useCallback(() => {
      Promise.all([fetchUserData(), fetchCountData(), getCurrentLocation()]);
    }, []),
  );

  /* ================= LOCATION ================= */

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setLoadingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address) {
        const addressString = [
          address.street,
          address.district,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");
        setLocationAddress(addressString || "Current Location");
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  /* ================= API ================= */

  const fetchUserData = async () => {
    console.log("authState.userId", authState.antiforgeryToken);
    console.log("authState.token", authState.token);

    try {
      const response = await getUserDataById({
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("use Data", response);

      setFirstName(response?.data?.firstName || "User");
      setLastName(response?.data?.lastName || "");
    } catch (error) {
      console.error("User fetch error:", error);
      alert(
        "Failed to fetch user data. " +
          (error instanceof Error ? error?.message : "Unknown error"),
      );
    }
  };

  const fetchCountData = async () => {
    try {
      const response = await getDashCount({
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      if (response?.success) {
        setCount(response.data);
      }
    } catch (error) {
      console.error("Count fetch error:", error);
    }
  };

  /* ================= CARD CONFIG ================= */

  const caseCardConfig = {
    open: {
      title: "Open",
      icon: "folder-check-line",
      iconBg: "#00C950",
      cardBg: theme.colors.validationSuccessBg,
      countColor: theme.colors.colorPrimary600,
      filter: "Open",
    },
    InProgress: {
      title: "In-Progress",
      icon: "time-line",
      iconBg: theme.colors.validationWarningText,
      cardBg: theme.colors.validationWarningBg,
      countColor: theme.colors.validationWarningText,
      filter: "inProgress",
    },
    Total: {
      title: "Total",
      icon: "arrow-right-box-line",
      iconBg: theme.colors.colorHeadingH1,
      cardBg: theme.colors.validationInfoBg,
      countColor: theme.colors.colorHeadingH1,
      filter: "tickets",
    },
    closed: {
      title: "Closed",
      icon: "close-circle-line",
      iconBg: "#6A7282",
      cardBg: theme.colors.navDivider,
      countColor: theme.colors.colorTextSecondary,
      filter: "Closed",
    },
  };

  /* ================= UI ================= */

  return (
    <>
      {Popup}

      <BodyLayout
        type="dashboard"
        userName={`${firstName} ${lastName}`}
        userId=""
        todaysDutyCount={count.tickets}
        totalTasks={count.tickets}
        notificationCount={3}
      >
        {/* Attendance */}
        <Text
          style={[
            theme.typography.fontH5,
            { color: theme.colors.colorPrimary600 },
          ]}
        >
          Attendance
        </Text>

        <PunchInCard />

        {/* KPI Circular Charts */}
        <View style={styles.kpiRow}>
          <CircularKPIChart percentage={attendanceRateNum} label="Attendance" />
          <CircularKPIChart percentage={completionRate} label="Leaves" />
        </View>

        {/* TaskOverview */}
        <Text
          style={[
            theme.typography.fontH6,
            { color: theme.colors.colorPrimary600, marginTop: 20 },
          ]}
        >
          Task Overview
        </Text>

        {/* TaskCards */}
        <View style={styles.row}>
          <ReusableCard
            icon={caseCardConfig.Total.icon}
            count={String(count.tickets)}
            title={caseCardConfig.Total.title}
            iconBg={caseCardConfig.Total.iconBg}
            cardBg={caseCardConfig.Total.cardBg}
            countColor={caseCardConfig.Total.countColor}
            titleColor={theme.colors.colorTextSecondary}
            onPress={() =>
              router.push({
                pathname: "/(fro)/(complaints)",
                params: { filter: caseCardConfig.Total.filter },
              })
            }
          />
          <ReusableCard
            icon={caseCardConfig.open.icon}
            count={String(count.open)}
            title={caseCardConfig.open.title}
            iconBg={caseCardConfig.open.iconBg}
            cardBg={caseCardConfig.open.cardBg}
            countColor={caseCardConfig.open.countColor}
            titleColor={theme.colors.colorTextSecondary}
            onPress={() =>
              router.push({
                pathname: "/(fro)/(complaints)",
                params: { filter: caseCardConfig.open.filter },
              })
            }
          />
        </View>

        <View style={styles.row}>
          <ReusableCard
            icon={caseCardConfig.InProgress.icon}
            count={String(count.inProgress)}
            title={caseCardConfig.InProgress.title}
            iconBg={caseCardConfig.InProgress.iconBg}
            cardBg={caseCardConfig.InProgress.cardBg}
            countColor={caseCardConfig.InProgress.countColor}
            titleColor={theme.colors.colorTextSecondary}
            onPress={() =>
              router.push({
                pathname: "/(fro)/(complaints)",
                params: { filter: caseCardConfig.InProgress.filter },
              })
            }
          />

          <ReusableCard
            icon={caseCardConfig.closed.icon}
            count={String(count.closed)}
            title={caseCardConfig.closed.title}
            iconBg={caseCardConfig.closed.iconBg}
            cardBg={caseCardConfig.closed.cardBg}
            countColor={caseCardConfig.closed.countColor}
            titleColor={theme.colors.colorTextSecondary}
            onPress={() =>
              router.push({
                pathname: "/(fro)/(complaints)",
                params: { filter: caseCardConfig.closed.filter },
              })
            }
          />
        </View>

        {/* Performance Card */}
        <FROPerformanceCard
          total={count.tickets}
          closed={count.closed}
          open={count.open}
          inProgress={count.inProgress}
        />

        {/* Location Map Section - Added at bottom */}
        <View
          style={[
            styles.mapCard,
            {
              backgroundColor: theme.colors.colorBgSurface,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <View style={styles.mapHeader}>
            <View style={styles.mapTitleContainer}>
              <RemixIcon
                name="map-pin-line"
                size={20}
                color={theme.colors.colorPrimary600}
              />
              <Text
                style={[
                  styles.mapTitle,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                Current Location
              </Text>
            </View>
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.refreshBtn}
            >
              <RemixIcon
                name="refresh-line"
                size={16}
                color={theme.colors.colorPrimary600}
              />
            </TouchableOpacity>
          </View>

          {currentLocation && (
            <>
              <View style={styles.addressContainer}>
                <RemixIcon
                  name="home-3-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    styles.addressText,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {loadingLocation ? "Loading..." : locationAddress}
                </Text>
              </View>

              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  loadingEnabled={true}
                  loadingIndicatorColor={theme.colors.colorPrimary600}
                >
                  <Marker
                    coordinate={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    }}
                    title="You are here"
                    description={locationAddress}
                  >
                    <View style={styles.markerContainer}>
                      <View
                        style={[
                          styles.markerPin,
                          { backgroundColor: theme.colors.colorPrimary600 },
                        ]}
                      >
                        <RemixIcon name="map-pin-fill" size={16} color="#FFF" />
                      </View>
                      <View
                        style={[
                          styles.markerTail,
                          { borderTopColor: theme.colors.colorPrimary600 },
                        ]}
                      />
                    </View>
                  </Marker>
                </MapView>

                <TouchableOpacity
                  style={styles.mapOverlayButton}
                  onPress={() => {
                    if (currentLocation) {
                      router.push({
                        pathname: "/FullMapScreen",
                        params: {
                          latitude: currentLocation.latitude.toString(),
                          longitude: currentLocation.longitude.toString(),
                          title: "Current Location",
                          description: locationAddress,
                        },
                      });
                    }
                  }}
                >
                  <RemixIcon name="fullscreen-line" size={16} color="#027A61" />
                  <Text style={styles.mapOverlayText}>Full Map</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!currentLocation && !loadingLocation && (
            <View style={styles.noLocationContainer}>
              <RemixIcon
                name="map-pin-line"
                size={32}
                color={theme.colors.colorTextSecondary}
              />
              <Text
                style={[
                  styles.noLocationText,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Unable to get current location
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryBtn,
                  { backgroundColor: theme.colors.colorPrimary600 },
                ]}
                onPress={getCurrentLocation}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {loadingLocation && (
            <View style={styles.loadingContainer}>
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Getting your location...
              </Text>
            </View>
          )}
        </View>
      </BodyLayout>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
  },

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },

  // Map styles
  mapCard: {
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  mapTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  mapTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  refreshBtn: {
    padding: 8,
    borderRadius: 20,
  },

  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  addressText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },

  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  markerTail: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },

  mapOverlayButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#027A61",
  },

  mapOverlayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#027A61",
    marginLeft: 4,
  },

  noLocationContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
  },

  noLocationText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },

  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 14,
  },
});
