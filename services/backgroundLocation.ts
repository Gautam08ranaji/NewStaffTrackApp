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
    // Check if we have location data
    if (!data || !data.locations || data.locations.length === 0) {
      console.log("Background task: No location data received");
      return;
    }
    
    const location = data.locations[0];
    if (!location) return;

    const { latitude, longitude } = location.coords;

    // Get stored user data from AsyncStorage
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    const csrfToken = await AsyncStorage.getItem("csrfToken");
    const fullName = await AsyncStorage.getItem("fullName");

    if (!userId || !token) {
      console.log("Background: Missing auth data");
      return;
    }

    // Get address from location
    let address = "Unknown location";
    try {
  const places = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });

  if (places && places.length > 0) {
        const p = places[0];
        address = [p.name, p.street, p.city, p.region, p.country]
          .filter(Boolean)
          .join(", ");
      }
    } catch (geocodeError) {
      console.log("Background: Geocode error");
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

    // Send to server
    await addAndUpdateFROLocation(
      payload,
      token,
      csrfToken || ""
    );

  } catch (error) {
    console.error("Background location update error:", error);
  }
});

// Start background tracking (only if permissions granted)
export const startBackgroundTracking = async (): Promise<boolean> => {
  try {
    console.log("Attempting to start background tracking...");
    
    // Check if background location is available on device
    const isAvailable = await Location.isBackgroundLocationAvailableAsync();
    if (!isAvailable) {
      console.log("Background location is not available on this device");
      return false;
    }

    // Check foreground permission
    const { status: foregroundStatus, canAskAgain: canAskForeground } = 
      await Location.getForegroundPermissionsAsync();
    
    // Check background permission
    const { status: backgroundStatus, canAskAgain: canAskBackground } = 
      await Location.getBackgroundPermissionsAsync();
    
    console.log("Permission status:", { 
      foreground: foregroundStatus, 
      background: backgroundStatus,
      canAskForeground,
      canAskBackground
    });

    // Don't start if permissions aren't granted
    if (foregroundStatus !== 'granted') {
      console.log("Cannot start background tracking: foreground permission not granted");
      return false;
    }

    if (backgroundStatus !== 'granted') {
      console.log("Cannot start background tracking: background permission not granted");
      return false;
    }

    // Check if already running
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    if (isRunning) {
      console.log("Background tracking already running");
      return true;
    }

    // Configure options
    const options: Location.LocationTaskOptions = {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // 1 minute
      distanceInterval: 50, // 50 meters
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.OtherNavigation,
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
    console.log("✅ Background location tracking started successfully");
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

// Get background tracking status with details
export const getBackgroundTrackingStatus = async () => {
  try {
    const [isRunning, foregroundPerm, backgroundPerm, isAvailable] = await Promise.all([
      Location.hasStartedLocationUpdatesAsync(LOCATION_TASK),
      Location.getForegroundPermissionsAsync(),
      Location.getBackgroundPermissionsAsync(),
      Location.isBackgroundLocationAvailableAsync()
    ]);

    return {
      isRunning,
      foregroundPermission: foregroundPerm.status,
      backgroundPermission: backgroundPerm.status,
      isAvailable,
      canAskForeground: foregroundPerm.canAskAgain,
      canAskBackground: backgroundPerm.canAskAgain
    };
  } catch (error) {
    console.error("Error getting background tracking status:", error);
    return null;
  }
};