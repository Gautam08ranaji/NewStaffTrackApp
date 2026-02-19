import BodyLayout from "@/components/layout/BodyLayout";
import { useLocation } from "@/hooks/LocationContext";
import { useTheme } from "@/theme/ThemeContext";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import RemixIcon, { IconName } from "react-native-remix-icon";

/* ⚠️ Restrict this API key in Google Cloud Console */
const GOOGLE_MAPS_API_KEY = "AIzaSyDVl4s2zlYODWTIpEfzYePa_hj5nrWksuE";

/* ================= HELPER ================= */

const getDestinationFromItem = (item: any) => {
  if (item?.latitude && item?.longitude) {
    return {
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
    };
  }

  if (
    item?.geographicLocation?.latitude &&
    item?.geographicLocation?.longitude
  ) {
    return {
      latitude: Number(item.geographicLocation.latitude),
      longitude: Number(item.geographicLocation.longitude),
    };
  }

  if (typeof item?.location === "string" && item.location.includes(",")) {
    const [lat, lng] = item.location.split(",");
    return {
      latitude: Number(lat),
      longitude: Number(lng),
    };
  }

  return null;
};

/* ================= SCREEN ================= */

export default function StartNavigationScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const colors = theme.colors;

  const { fetchLocation } = useLocation();

  const params = useLocalSearchParams();
  const item = params.item ? JSON.parse(params.item as string) : null;

  const destination = getDestinationFromItem(item);
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  /* ================= GET USER LOCATION ================= */

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const loc = await fetchLocation();
        if (loc?.coords) setUserLocation(loc.coords);
      } catch (err) {
        console.log("Location fetch error:", err);
      }
    };

    loadLocation();
  }, []);

  /* ================= OPEN GOOGLE MAPS ================= */

  const openGoogleMaps = () => {
    if (!destination) return;

    const lat = destination.latitude;
    const lng = destination.longitude;

    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });

    if (url) Linking.openURL(url);
  };

  /* ================= RENDER ================= */

  return (
    <BodyLayout
      type="screen"
      screenName={t("navigation.screenTitle")}
      scrollContentStyle={{ paddingHorizontal: 0 }}
    >
      {/* MAP */}
      <View style={[styles.mapContainer, { borderColor: colors.colorBorder }]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation
          showsMyLocationButton
          followsUserLocation
        >
          {destination && (
            <Marker
              coordinate={destination}
              title={item?.contactName || "Destination"}
              description={item?.completeAddress || "Location"}
            />
          )}

          {userLocation && destination && (
            <MapViewDirections
              origin={userLocation}
              destination={destination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={5}
              strokeColor="#1E90FF"
              mode="DRIVING"
              onReady={(result) => {
                setDistance(result.distance);
                setDuration(result.duration);

                // Tight zoom ONLY on route
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    top: 40,
                    right: 20,
                    bottom: 40,
                    left: 20,
                  },
                  animated: true,
                });
              }}
              onError={(err) => console.log("Directions error:", err)}
            />
          )}
        </MapView>
      </View>

      {/* DETAILS CARD */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.colorBgSurface,
            borderColor: colors.colorBorder,
          },
        ]}
      >
        <Text style={[styles.name, { color: colors.colorTextPrimary }]}>
          {item?.contactName || "Unknown"}
        </Text>

        <View style={styles.row}>
          <RemixIcon
            name={"map-pin-2-line" as IconName}
            size={18}
            color={colors.colorTextSecondary}
          />
          <Text style={[styles.rowText, { color: colors.colorTextSecondary }]}>
            Distance: {distance ? `${distance.toFixed(1)} km` : "--"}
          </Text>
        </View>

        <View style={styles.row}>
          <RemixIcon
            name={"navigation-line" as IconName}
            size={18}
            color={colors.colorTextSecondary}
          />
          <Text style={[styles.rowText, { color: colors.colorTextSecondary }]}>
            ETA: {duration ? `${Math.ceil(duration)} min` : "--"}
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.colorTextSecondary }]}>
          Address:
        </Text>

        <Text style={[styles.address, { color: colors.colorTextPrimary }]}>
          {item?.area || "Address not available"}
        </Text>
      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        onPress={openGoogleMaps}
        style={[styles.primaryBtn, { backgroundColor: colors.btnPrimaryBg }]}
      >
        <RemixIcon
          name={"navigation-fill" as IconName}
          size={18}
          color={colors.btnPrimaryText}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.primaryBtnText, { color: colors.btnPrimaryText }]}>
          Open in Maps
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.secondaryBtn,
          {
            borderColor: colors.btnSecondaryBorder,
            backgroundColor: colors.colorBgSurface,
          },
        ]}
      >
        <Text
          style={[styles.secondaryBtnText, { color: colors.colorPrimary500 }]}
        >
          On the Way
        </Text>
      </TouchableOpacity>
    </BodyLayout>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  mapContainer: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  rowText: {
    marginLeft: 6,
    fontSize: 14,
  },
  label: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "500",
  },
  address: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1.6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
