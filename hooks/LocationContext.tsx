// LocationContext.tsx
import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";

/* ================= TYPES ================= */

type LocationContextType = {
  location: Location.LocationObject | null;
  address: string | null;
  hasPermission: boolean;
  hasBackgroundPermission: boolean;
  requestPermission: () => Promise<boolean>;
  requestBackgroundPermission: () => Promise<boolean>;
  revokePermission: () => void;
  fetchLocation: () => Promise<Location.LocationObject | null>;
  checkBackgroundPermission: () => Promise<boolean>;
  openSettings: () => void;
};

/* ================= CONTEXT ================= */

const LocationContext = createContext<LocationContextType>({
  location: null,
  address: null,
  hasPermission: false,
  hasBackgroundPermission: false,
  requestPermission: async () => false,
  requestBackgroundPermission: async () => false,
  revokePermission: () => {},
  fetchLocation: async () => null,
  checkBackgroundPermission: async () => false,
  openSettings: () => {},
});

/* ================= PROVIDER ================= */

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);

  /* ---------- CHECK PERMISSIONS ON MOUNT ---------- */
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check foreground permission
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    const foreground = foregroundStatus === "granted";
    setHasPermission(foreground);

    // Check background permission
    if (foreground) {
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      setHasBackgroundPermission(backgroundStatus === "granted");
      console.log("Background permission status:", backgroundStatus);
    }
  };

  /* ---------- REQUEST FOREGROUND PERMISSION ---------- */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      await fetchLocation();
      
      // After getting foreground, check background
      await checkPermissions();
      
      return true;
    } catch (error) {
      console.error("Location permission error:", error);
      return false;
    }
  };

  /* ---------- REQUEST BACKGROUND PERMISSION ---------- */
  const requestBackgroundPermission = async (): Promise<boolean> => {
    try {
      // Ensure we have foreground permission first
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            "Permission Required",
            "Foreground location permission is required before background permission."
          );
          return false;
        }
      }

      // On Android, background permission is handled differently
      if (Platform.OS === 'android') {
        // Show explanation dialog
        return new Promise((resolve) => {
          Alert.alert(
            "Background Location Permission",
            "To track your location when the app is closed, you need to grant background location permission.\n\nPlease select 'Allow all the time' in the next screen.",
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              { 
                text: "Continue", 
                onPress: async () => {
                  try {
                    const { status } = await Location.requestBackgroundPermissionsAsync();
                    const granted = status === "granted";
                    setHasBackgroundPermission(granted);
                    
                    if (!granted) {
                      // If denied, offer to open settings
                      Alert.alert(
                        "Permission Denied",
                        "Background location permission is required for tracking when app is closed. You can enable it in settings.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Open Settings", onPress: openSettings }
                        ]
                      );
                    }
                    resolve(granted);
                  } catch (error) {
                    console.error("Background permission error:", error);
                    resolve(false);
                  }
                }
              }
            ]
          );
        });
      } else {
        // iOS
        const { status } = await Location.requestBackgroundPermissionsAsync();
        const granted = status === "granted";
        setHasBackgroundPermission(granted);
        return granted;
      }
    } catch (error) {
      console.error("Background permission error:", error);
      return false;
    }
  };

  /* ---------- CHECK BACKGROUND PERMISSION ---------- */
  const checkBackgroundPermission = async (): Promise<boolean> => {
    const { status } = await Location.getBackgroundPermissionsAsync();
    return status === "granted";
  };

  /* ---------- OPEN SETTINGS ---------- */
  const openSettings = () => {
    Linking.openSettings();
  };

  /* ---------- FETCH LOCATION ---------- */
  const fetchLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);

      const { latitude, longitude } = currentLocation.coords;
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (places.length > 0) {
        const p = places[0];
        const readableAddress = [p.name, p.street, p.city, p.region, p.country]
          .filter(Boolean)
          .join(", ");

        setAddress(readableAddress);
      }

      return currentLocation;
    } catch (error) {
      console.error("Fetch location error:", error);
      return null;
    }
  };

  /* ---------- REVOKE (APP LEVEL) ---------- */
  const revokePermission = () => {
    setHasPermission(false);
    setHasBackgroundPermission(false);
    setLocation(null);
    setAddress(null);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        hasPermission,
        hasBackgroundPermission,
        requestPermission,
        requestBackgroundPermission,
        revokePermission,
        fetchLocation,
        checkBackgroundPermission,
        openSettings,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useLocation = () => useContext(LocationContext);