import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import RemixIcon from "react-native-remix-icon";

const { width, height } = Dimensions.get("window");

// Static coordinates (fallback)
const STATIC_LAT = 28.6139; // Example: New Delhi
const STATIC_LONG = 77.209;

// Use web-based Google Maps API key for static maps
const GOOGLE_MAPS_API_KEY = "AIzaSyDVl4s2zlYODWTIpEfzYePa_hj5nrWksuE";

/* ================= HELPERS ================= */

const getCoordinatesFromItem = (item: any) => {
  if (!item) {
    return {
      latitude: STATIC_LAT,
      longitude: STATIC_LONG,
      isStatic: true,
    };
  }

  // Try different possible coordinate fields
  if (item?.latitude && item?.longitude) {
    return {
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      isStatic: false,
    };
  }

  if (
    item?.geographicLocation?.latitude &&
    item?.geographicLocation?.longitude
  ) {
    return {
      latitude: parseFloat(item.geographicLocation.latitude),
      longitude: parseFloat(item.geographicLocation.longitude),
      isStatic: false,
    };
  }

  if (typeof item?.location === "string" && item.location.includes(",")) {
    const [lat, lng] = item.location.split(",");
    if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        isStatic: false,
      };
    }
  }

  // Fallback to static location
  return {
    latitude: STATIC_LAT,
    longitude: STATIC_LONG,
    isStatic: true,
  };
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ================= COMPONENTS ================= */

const InfoRow = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

/* ================= MAIN SCREEN ================= */

export default function HospitalDetailScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const params = useLocalSearchParams();
  const item = params.item ? JSON.parse(params.item as string) : null;

  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Always call hooks unconditionally at the top level
  const coordinates = item
    ? getCoordinatesFromItem(item)
    : {
        latitude: STATIC_LAT,
        longitude: STATIC_LONG,
        isStatic: true,
      };

  // Get user location for map centering
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location.coords);
    })();
  }, []);

  // Fit map to show both user and destination
  useEffect(() => {
    if (item && mapReady && mapRef.current) {
      const coordinatesToFit = [];

      if (userLocation) {
        coordinatesToFit.push({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
      }

      coordinatesToFit.push({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (coordinatesToFit.length > 1) {
        mapRef.current.fitToCoordinates(coordinatesToFit, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      } else {
        // Only show destination if user location not available
        mapRef.current.animateToRegion(
          {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500,
        );
      }
    }
  }, [item, mapReady, userLocation, coordinates]);

  // Early return for no item - AFTER all hooks have been called
  if (!item) {
    return (
      <BodyLayout type="screen" screenName="Centre Details">
        <Text>No details available</Text>
      </BodyLayout>
    );
  }

  // Open in external maps app
  const openInMaps = () => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=${encodeURIComponent(item.title || "Location")}`,
      android: `geo:${coordinates.latitude},${coordinates.longitude}?q=${coordinates.latitude},${coordinates.longitude}(${encodeURIComponent(item.title || "Location")})`,
      default: `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => {
        Alert.alert("Error", "Could not open maps app");
        console.error(err);
      });
    }
  };

  // Get static map image URL
  const getStaticMapUrl = () => {
    const { latitude, longitude } = coordinates;
    const markers = `color:red%7C${latitude},${longitude}`;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=${markers}&key=${GOOGLE_MAPS_API_KEY}`;
  };

  return (
    <BodyLayout type="screen" screenName="Centre Details">
      {/* ================= CARD ================= */}
      <View style={[styles.card, { backgroundColor: colors.colorBgSurface }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.colorTextPrimary }]}>
            {item.title}
          </Text>

          <View
            style={[
              styles.openBadge,
              item.status !== "Open" && { backgroundColor: "#E5E7EB" },
            ]}
          >
            <Text
              style={[
                styles.openText,
                item.status !== "Open" && { color: "#6B7280" },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <InfoRow label="Category:" value={item.category} />
        <InfoRow label="Type:" value={item.type} />
        <InfoRow label="Hospital Type:" value={item.hospitalType} />
        <InfoRow label="Created On:" value={formatDate(item.createdDate)} />
      </View>

      {/* ================= DESCRIPTION ================= */}
      <Section title="Description">
        <Text
          style={[styles.description, { color: colors.colorTextSecondary }]}
        >
          {item.description || "No description available"}
        </Text>
      </Section>

      {/* ================= ADDRESS ================= */}
      <Section title="Address">
        <InfoRow label="Location:" value={item.address} />

        <View style={styles.coordinateRow}>
          <Text
            style={[
              styles.coordinateLabel,
              { color: colors.colorTextSecondary },
            ]}
          >
            Coordinates:
          </Text>
          <View style={styles.coordinateValue}>
            <Text
              style={[
                styles.coordinateText,
                coordinates.isStatic
                  ? styles.staticCoordinateText
                  : styles.liveCoordinateText,
              ]}
            >
              {coordinates.latitude.toFixed(6)},{" "}
              {coordinates.longitude.toFixed(6)}
            </Text>
            <View
              style={[
                styles.locationBadge,
                coordinates.isStatic ? styles.staticBadge : styles.liveBadge,
              ]}
            >
              <RemixIcon
                name={coordinates.isStatic ? "map-pin-line" : "map-pin-fill"}
                size={12}
                color={coordinates.isStatic ? "#6B7280" : "#10B981"}
              />
              <Text
                style={[
                  styles.badgeText,
                  coordinates.isStatic
                    ? styles.staticBadgeText
                    : styles.liveBadgeText,
                ]}
              >
                {coordinates.isStatic ? "Static" : "Live"}
              </Text>
            </View>
          </View>
        </View>
      </Section>

      {/* ================= INTERACTIVE MAP ================= */}
      <Section title="Location Map">
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            onMapReady={() => setMapReady(true)}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* Destination Marker */}
            <Marker
              coordinate={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
              }}
              title={item.title}
              description={item.address || "Location"}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerPin}>
                  <RemixIcon name="map-pin-fill" size={24} color="#DC2626" />
                </View>
              </View>
            </Marker>
          </MapView>

          {/* Map overlay info */}
          <View style={styles.mapOverlay}>
            <View style={styles.mapOverlayContent}>
              <RemixIcon
                name={coordinates.isStatic ? "map-pin-line" : "map-pin-fill"}
                size={16}
                color={coordinates.isStatic ? "#6B7280" : "#DC2626"}
              />
              <Text
                style={[
                  styles.mapOverlayText,
                  { color: colors.colorTextPrimary },
                ]}
              >
                {coordinates.isStatic ? "Static Location" : item.title}
              </Text>
            </View>
            {coordinates.isStatic && (
              <Text
                style={[
                  styles.mapOverlaySubtext,
                  { color: colors.colorTextSecondary },
                ]}
              >
                Exact coordinates not available
              </Text>
            )}
          </View>
        </View>

        {/* Map Actions */}
        <View style={styles.mapActions}>
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: colors.btnPrimaryBg }]}
            onPress={openInMaps}
          >
            <RemixIcon name="navigation-fill" size={18} color="#fff" />
            <Text
              style={[styles.mapButtonText, { color: colors.btnPrimaryText }]}
            >
              Open in Maps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryMapButton,
              {
                borderColor: colors.colorBorder,
                backgroundColor: colors.colorBgSurface,
              },
            ]}
            onPress={() => {
              if (userLocation && mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  500,
                );
              }
            }}
          >
            <RemixIcon
              name="focus-3-line"
              size={18}
              color={colors.colorPrimary500}
            />
            <Text
              style={[
                styles.secondaryMapButtonText,
                { color: colors.colorPrimary500 },
              ]}
            >
              My Location
            </Text>
          </TouchableOpacity>
        </View>

        {coordinates.isStatic && (
          <Text
            style={[styles.staticNote, { color: colors.colorTextSecondary }]}
          >
            <RemixIcon
              name="information-line"
              size={14}
              color={colors.colorTextSecondary}
            />{" "}
            This location is static because exact coordinates were not provided.
          </Text>
        )}
      </Section>
    </BodyLayout>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  openBadge: {
    backgroundColor: "#FFE7C2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  openText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
  },
  value: {
    fontSize: 13,
    color: "#111827",
    maxWidth: "60%",
    textAlign: "right",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  coordinateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  coordinateLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  coordinateValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  coordinateText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginRight: 6,
  },
  liveCoordinateText: {
    color: "#10B981",
  },
  staticCoordinateText: {
    color: "#6B7280",
  },
  locationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  liveBadge: {
    backgroundColor: "#D1FAE5",
  },
  staticBadge: {
    backgroundColor: "#F3F4F6",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },
  liveBadgeText: {
    color: "#065F46",
  },
  staticBadgeText: {
    color: "#6B7280",
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: "center",
  },
  markerPin: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  mapOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapOverlayContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapOverlayText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  mapOverlaySubtext: {
    fontSize: 11,
    fontStyle: "italic",
  },
  mapActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  mapButton: {
    flex: 1,
    backgroundColor: "#0A6C5A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  mapButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryMapButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  secondaryMapButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  staticNote: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});
