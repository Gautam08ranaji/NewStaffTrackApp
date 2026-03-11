// services/backgroundLocationService.ts
import { addAndUpdateFROLocation } from "@/features/fro/froLocationApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

const LOCATION_TASK = "fro-background-location";

// Define the background task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }

  try {
    const { locations } = data;
    const location = locations[0];

    if (!location) return;

    const { latitude, longitude } = location.coords;

    // console.log("📍 Background location:", latitude, longitude);

    // Get stored user data from AsyncStorage
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    const csrfToken = await AsyncStorage.getItem("csrfToken");
    const fullName = await AsyncStorage.getItem("fullName");

    if (!userId || !token) {
      console.log("❌ Background: Missing auth data");
      return;
    }

    // Get address from location
    let address = "Unknown location";
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (places.length > 0) {
        const p = places[0];
        address = [p.name, p.street, p.city, p.region, p.country]
          .filter(Boolean)
          .join(", ");
      }
    } catch (geocodeError) {
      console.log("⚠️ Background: Geocode error");
    }

    // Prepare payload
    const payload = {
      name: fullName ?? "User",
      latitute: latitude.toString(),
      longititute: longitude.toString(),
      discriptions: address,
      froPinLocation: address,
      userId,
    };
console.log("add",address);

    // Send to server
    await addAndUpdateFROLocation(
      payload,
      token,
      csrfToken || ""
    );

          // console.log("payload background",payload);


    // console.log("✅ Background location update success");
  } catch (error) {
    console.error("❌ Background location update error:", error);
  }
});

// Start background tracking
export const startBackgroundTracking = async (): Promise<boolean> => {
  try {
    // First check if we have background permission
    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.log("❌ No background permission");
      return false;
    }

    // Check if already running
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    if (isRunning) {
      console.log("✅ Background tracking already running");
      return true;
    }

    // For Android, we need to ensure we have the right configuration
    const options: Location.LocationTaskOptions = {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1200000, // 1 minute
      distanceInterval: 50, // 50 meters
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
    };

    // Add foreground service config for Android
    if (Platform.OS === 'android') {
      options.foregroundService = {
        notificationTitle: "FIELD TRACK",
        notificationBody: "Tracking your location in background",
        notificationColor: "#FF0000",
      };
    }

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK, options);

    console.log("✅ Background location tracking started");
    return true;
  } catch (err) {
    console.log("❌ Failed to start background tracking:", err);
    return false;
  }
};

// Stop background tracking
export const stopBackgroundTracking = async () => {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK);
      console.log("✅ Background tracking stopped");
    }
  } catch (err) {
    console.log("❌ Failed to stop background tracking:", err);
  }
};

// Check if background tracking is running
export const isBackgroundTrackingRunning = async () => {
  return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
};