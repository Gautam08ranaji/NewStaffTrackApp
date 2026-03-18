// services/backgroundLocation.ts
import { addAndUpdateFROLocation } from "@/features/fro/froLocationApi";
import { getInteractionsListByAssignToId } from "@/features/fro/interactionApi";
import { createFROUsersTicketLocation } from "@/features/fro/trackFroBasedOnTicket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { AppState, Platform } from "react-native";

export const LOCATION_TASK = "fro-background-location";

// Store for in-progress tickets
let inProgressTickets: any[] = [];
let lastLocationUpdate = 0;
let lastTicketRefresh = 0;

// Define the background task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error, executionInfo }: any) => {
  if (error) {
    console.error("❌ Background location task error:", error);
    return;
  }

  const now = new Date().toISOString();
  console.log(`🔄 Background task triggered at: ${now}`);
  console.log(`📱 App state at trigger:`, AppState.currentState);

  try {
    // Check if we have location data
    if (!data || !data.locations || data.locations.length === 0) {
      console.log("⚠️ Background task: No location data received");
      return;
    }

    console.log(`📍 Received ${data.locations.length} location(s)`);
    
    // Log the time since last update
    const timeSinceLastUpdate = lastLocationUpdate ? (Date.now() - lastLocationUpdate) / 1000 : 0;
    console.log(`⏱️ Time since last update: ${timeSinceLastUpdate} seconds`);
    
    const location = data.locations[0];
    if (!location) {
      console.log("⚠️ First location is null/undefined");
      return;
    }

    const { latitude, longitude, accuracy, timestamp } = location.coords;
    console.log(`📍 Location: (${latitude}, ${longitude}), accuracy: ${accuracy}m`);

    // Get stored user data from AsyncStorage
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    const csrfToken = await AsyncStorage.getItem("csrfToken");
    const fullName = await AsyncStorage.getItem("fullName");

    if (!userId || !token) {
      console.log("⚠️ Background: Missing auth data");
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
      console.log("⚠️ Background reverse geocode failed:", geocodeError);
    }

    // Always update main location
    const mainPayload = {
      name: fullName ?? "User",
      latitute: latitude.toString(),
      longititute: longitude.toString(),
      discriptions: address,
      froPinLocation: address,
      userId,
    };

    console.log("📤 Sending main location update...");
    
    // Send main location update
    await addAndUpdateFROLocation(mainPayload, token, csrfToken || "");
    console.log("✅ Main location updated successfully at", new Date().toISOString());

    // Refresh tickets every 5 minutes
    const currentTime = Date.now();
    if (currentTime - lastTicketRefresh > 300000) { // 5 minutes
      console.log("🔄 Refreshing in-progress tickets...");
      await fetchAndUpdateInProgressTickets(userId, token, csrfToken || "");
      lastTicketRefresh = currentTime;
    }

    // Send location update for all in-progress tickets
    if (inProgressTickets.length > 0) {
      console.log(`📍 Updating location for ${inProgressTickets.length} in-progress tickets`);
      
      for (const ticket of inProgressTickets) {
        // Only update if ticket is in-progress
        if (ticket.statusName?.toLowerCase() === "in-progress") {
          console.log(`📤 Updating ticket ${ticket.transactionNumber}...`);
          
          const ticketPayload = {
            name: `Visit - ${ticket.transactionNumber || ticket.subject || "Ticket"}`,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            description: `Location update for ticket ${ticket.transactionNumber}`,
            froPinLocation: address,
            froStatus: ticket.statusName,
            froStatusId: ticket.statusId,
            ticketNumber: ticket.transactionNumber,
            userId,
            token,
            csrfToken: csrfToken || "",
          };
          
          try {
            await createFROUsersTicketLocation(ticketPayload);
            console.log(`✅ Location updated for ticket: ${ticket.transactionNumber}`);
          } catch (ticketError) {
            console.log(`❌ Failed to update ticket ${ticket.transactionNumber}:`, ticketError);
          }
        }
      }
    } else {
      console.log("ℹ️ No in-progress tickets found");
    }

    lastLocationUpdate = currentTime;
    console.log("✅ Background task completed at:", new Date().toISOString());

  } catch (error) {
    console.error("❌ Background location update error:", error);
  }
});

// Fetch and update in-progress tickets
const fetchAndUpdateInProgressTickets = async (userId: string, token: string, csrfToken: string) => {
  try {
    console.log("📡 Fetching interactions for user:", userId);
    
    const response = await getInteractionsListByAssignToId({
      assignToId: userId,
      pageNumber: 1,
      pageSize: 100,
      token,
      csrfToken,
    });

    console.log("📥 Interactions response received");
    
    const interactions = response?.data?.interactions || [];
    console.log(`📊 Total interactions: ${interactions.length}`);
    
    // Store all in-progress tickets
    inProgressTickets = interactions.filter((ticket: any) => {
      const isInProgress = ticket.statusName?.toLowerCase() === "in-progress";
      if (isInProgress) {
        console.log(`🎫 In-progress ticket: ${ticket.transactionNumber} - ${ticket.subject}`);
      }
      return isInProgress;
    });
    
    console.log(`✅ Found ${inProgressTickets.length} in-progress tickets`);
    
  } catch (error) {
    console.error("❌ Failed to fetch in-progress tickets:", error);
  }
};

// Enhanced start function with optimized background settings
export const startBackgroundTracking = async (): Promise<boolean> => {
  try {
    console.log("🚀 Attempting to start background tracking...");

    // Check if background location is available
    const isAvailable = await Location.isBackgroundLocationAvailableAsync();
    console.log("📱 Background location available:", isAvailable);
    
    if (!isAvailable) {
      console.log("❌ Background location is not available on this device");
      return false;
    }

    // Check permissions
    const [foregroundPerm, backgroundPerm] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Location.getBackgroundPermissionsAsync(),
    ]);

    console.log("🔐 Permission status:", {
      foreground: foregroundPerm.status,
      background: backgroundPerm.status,
      foregroundCanAsk: foregroundPerm.canAskAgain,
      backgroundCanAsk: backgroundPerm.canAskAgain
    });

    // Request permissions if needed
    if (foregroundPerm.status !== 'granted') {
      console.log("📲 Requesting foreground permission...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("❌ Foreground permission denied");
        return false;
      }
    }

    if (backgroundPerm.status !== 'granted') {
      console.log("📲 Requesting background permission...");
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("❌ Background permission denied");
        return false;
      }
    }

    // Check if already running
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    if (isRunning) {
      console.log("ℹ️ Background tracking already running");
      return true;
    }

    // OPTIMIZED CONFIGURATION FOR BETTER BACKGROUND UPDATES
    const options: Location.LocationTaskOptions = {
      // Use High accuracy for frequent updates
      accuracy: Location.Accuracy.High,
      
      // Time interval (10 seconds)
      timeInterval: 10000,
      
      // Distance interval (10 meters)
      distanceInterval: 10,
      
      // Show background indicator on iOS
      showsBackgroundLocationIndicator: true,
      
      // Don't pause updates automatically
      pausesUpdatesAutomatically: false,
      
      // Activity type for navigation
      activityType: Location.ActivityType.AutomotiveNavigation,
      
      // Defer updates settings (Android)
      deferredUpdatesInterval: 30000, // Defer every 30 seconds
      deferredUpdatesDistance: 50, // Defer after 50 meters
    };

    // Platform-specific configurations
    if (Platform.OS === 'android') {
      options.foregroundService = {
        notificationTitle: "FIELD TRACK",
        notificationBody: "Tracking your location for active tickets",
        notificationColor: "#FF0000",
      };
      
      // Android-specific adjustments
      options.deferredUpdatesInterval = 20000; // 20 seconds
      options.deferredUpdatesDistance = 30; // 30 meters
    } else {
      // iOS specific
      options.showsBackgroundLocationIndicator = true;
      options.activityType = Location.ActivityType.OtherNavigation;
    }

    console.log("⚙️ Starting with optimized options:", JSON.stringify(options));

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK, options);
    console.log("✅ Background location tracking started successfully");
    
    // Verify it started
    const verifyRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    console.log("✅ Verification - Task running:", verifyRunning);
    
    // Initial fetch of tickets
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    const csrfToken = await AsyncStorage.getItem("csrfToken");
    
    if (userId && token) {
      console.log("📡 Performing initial ticket fetch...");
      await fetchAndUpdateInProgressTickets(userId, token, csrfToken || "");
    }
    
    return true;
  } catch (err) {
    console.log("❌ Failed to start background tracking:", err);
    if (err instanceof Error) {
      console.log("Error details:", err.message);
      console.log("Stack:", err.stack);
    }
    return false;
  }
};

// Add a function to check if tracking is active in background
export const checkBackgroundTrackingHealth = async () => {
  try {
    const isRunning = await isBackgroundTrackingRunning();
    const status = await getBackgroundTrackingStatus();
    const now = Date.now();
    const timeSinceLastUpdate = lastLocationUpdate ? (now - lastLocationUpdate) / 1000 : 0;
    
    console.log("📊 Background Tracking Health Check:");
    console.log(`- Is Running: ${isRunning}`);
    console.log(`- Last Update: ${lastLocationUpdate ? new Date(lastLocationUpdate).toISOString() : 'Never'}`);
    console.log(`- Time Since Last Update: ${timeSinceLastUpdate} seconds`);
    console.log(`- In-Progress Tickets: ${inProgressTickets.length}`);
    console.log(`- App State: ${AppState.currentState}`);
    
    // If no updates in last 5 minutes and app is in background, try to restart
    if (timeSinceLastUpdate > 300 && AppState.currentState === 'background') {
      console.log("⚠️ No updates in background for 5 minutes, attempting restart...");
      await stopBackgroundTracking();
      await startBackgroundTracking();
    }
    
    return {
      isRunning,
      lastUpdate: lastLocationUpdate,
      timeSinceLastUpdate,
      ticketCount: inProgressTickets.length,
      appState: AppState.currentState
    };
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
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
      canAskBackground: backgroundPerm.canAskAgain,
      inProgressTicketsCount: inProgressTickets.length,
      lastUpdate: lastLocationUpdate ? new Date(lastLocationUpdate).toISOString() : null
    };
  } catch (error) {
    console.error("Error getting background tracking status:", error);
    return null;
  }
};

// Refresh in-progress tickets
export const refreshInProgressTickets = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    const csrfToken = await AsyncStorage.getItem("csrfToken");
    
    if (userId && token) {
      await fetchAndUpdateInProgressTickets(userId, token, csrfToken || "");
      console.log("✅ In-progress tickets refreshed");
    }
  } catch (error) {
    console.error("❌ Failed to refresh in-progress tickets:", error);
  }
};

// Get current in-progress tickets
export const getInProgressTickets = () => {
  return inProgressTickets;
};

// Check if there are any in-progress tickets
export const hasInProgressTickets = () => {
  return inProgressTickets.length > 0;
};

// Start tracking with automatic ticket refresh
export const startTrackingWithTicketMonitoring = async () => {
  const started = await startBackgroundTracking();
  if (started) {
    // Monitor health every 5 minutes
    const healthIntervalId = setInterval(async () => {
      await checkBackgroundTrackingHealth();
    }, 300000);
    
    // Refresh tickets every 5 minutes
    const refreshIntervalId = setInterval(async () => {
      await refreshInProgressTickets();
    }, 300000);
    
    return { started, healthIntervalId, refreshIntervalId };
  }
  return { started, healthIntervalId: null, refreshIntervalId: null };
};

// Register background task
export const registerBackgroundTask = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  if (!isRegistered) {
    console.log("⚠️ Background task not registered, defining...");
    // Task is already defined above, so just log
  }
  return isRegistered;
};