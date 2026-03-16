// hooks/useFROLocationUpdater.ts
import { addAndUpdateFROLocation } from "@/features/fro/froLocationApi";
import { startBackgroundTracking, stopBackgroundTracking } from "@/services/backgroundLocation";
import { useAppSelector } from "@/store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import { useLocation } from "./LocationContext";

export const useFROLocationUpdater = (userId?: string | null) => {
  const { hasPermission, hasBackgroundPermission, fetchLocation, address, requestBackgroundPermission } = useLocation();
  const intervalRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const authState = useAppSelector((state) => state.auth);
  const fullName = `${authState?.firstName ?? ""} ${authState?.lastName ?? ""}`.trim();
  const [isBackgroundTrackingActive, setIsBackgroundTrackingActive] = useState(false);
  
  // Add a ref to track if interval is already set up
  const isIntervalSet = useRef(false);
  const intervalCounter = useRef(0);

  // Store auth data in AsyncStorage for background task
  useEffect(() => {
    if (userId && authState?.token) {
      const storeAuthData = async () => {
        try {
          await AsyncStorage.setItem("userId", userId);
          await AsyncStorage.setItem("token", String(authState.token));
          await AsyncStorage.setItem("csrfToken", authState.antiforgeryToken || "");
          await AsyncStorage.setItem("fullName", fullName);
          console.log("✅ Auth data stored for background tracking");
        } catch (error) {
          console.error("Failed to store auth data:", error);
        }
      };
      storeAuthData();
    }
  }, [userId, authState?.token, authState?.antiforgeryToken, fullName]);

  // Request background permission and start tracking
  useEffect(() => {
    const setupBackgroundTracking = async () => {
      if (!hasPermission || !userId) return;

      console.log("Setting up background tracking...");
      console.log("Has background permission:", hasBackgroundPermission);

      if (!hasBackgroundPermission) {
        console.log("Requesting background permission...");
        const granted = await requestBackgroundPermission();
        if (!granted) {
          Alert.alert(
            "Limited Tracking",
            "Background location permission not granted. Location will only be tracked while the app is open.",
            [{ text: "OK" }]
          );
          return;
        }
      }

      const started = await startBackgroundTracking();
      setIsBackgroundTrackingActive(started);
      
      if (started) {
        console.log("✅ Background tracking started successfully");
      } else {
        console.log("❌ Failed to start background tracking");
      }
    };

    setupBackgroundTracking();
  }, [hasPermission, hasBackgroundPermission, userId]);

  // Foreground location update function
  const sendLocation = useCallback(async () => {
    if (!hasPermission || !userId) return;

    try {
      intervalCounter.current += 1;
      // console.log(`📍 Foreground update #${intervalCounter.current} at ${new Date().toLocaleTimeString()}`);
      
      const location = await fetchLocation();
      if (!location) return;

      const { latitude, longitude } = location.coords;

      const token = authState?.token;
      const csrfToken = authState?.antiforgeryToken;

      if (!token) {
        console.log("❌ Token missing");
        return;
      }

      const payload = {
        name: fullName ?? "User",
        latitute: latitude.toString(),
        longititute: longitude.toString(),
        discriptions: address ?? "",
        froPinLocation: address ?? "Unknown location",
        userId,
      };

      // console.log("📤 Payload sent at:", new Date().toLocaleTimeString());
      // console.log("📍 Coordinates:", latitude, longitude);

      const res = await addAndUpdateFROLocation(
        payload,
        token,
        csrfToken || ""
      );

      // console.log("✅ Location update success at:", new Date().toLocaleTimeString());
        // console.log("✅ Location update res:", payload);
    } catch (error) {
      console.error("❌ Location update error:", error);
    }
  }, [hasPermission, userId, fullName, address, authState?.token, authState?.antiforgeryToken, fetchLocation]);

  // Handle app state changes
  useEffect(() => {
    if (!hasPermission || !userId) return;

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      console.log(`App state changed from ${appStateRef.current} to ${nextAppState}`);
      
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App came to foreground - sending location immediately");
        sendLocation();
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [hasPermission, userId, sendLocation]);

  // Main effect for foreground tracking - FIXED VERSION
  useEffect(() => {
    if (!hasPermission || !userId) {
      // Clear interval if no permission or user
      if (intervalRef.current !== null) {
        console.log("Clearing interval due to no permission/user");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isIntervalSet.current = false;
      }
      return;
    }

    // Clear any existing interval first
    if (intervalRef.current !== null) {
      console.log("Clearing existing interval before setting new one");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isIntervalSet.current = false;
    }

    // Send initial locationß
    console.log("Sending initial location");
    sendLocation();
    
    // Set up foreground interval (20 minutes = 1200000 ms)
    const INTERVAL_TIME = 12000; // 20 minutes
    console.log(`Setting up foreground interval for ${INTERVAL_TIME/60000} minutes`);
    
    intervalRef.current = setInterval(() => {
      // console.log(`⏰ Interval triggered at ${new Date().toLocaleTimeString()}`);
      sendLocation();
    }, INTERVAL_TIME);
    
    isIntervalSet.current = true;

    // Cleanup function
    return () => {
      console.log("Cleaning up foreground interval");
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isIntervalSet.current = false;
      }
    };
  }, [hasPermission, userId]); // Remove sendLocation from dependencies to prevent recreating interval

  // Cleanup on unmount or when userId becomes null
  useEffect(() => {
    return () => {
      if (!userId) {
        console.log("User logged out, stopping background tracking");
        stopBackgroundTracking();
      }
    };
  }, [userId]);

  return {
    isTracking: hasPermission && !!userId,
    isBackgroundTracking: isBackgroundTrackingActive,
    stopTracking: async () => {
      console.log("Manually stopping tracking");
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isIntervalSet.current = false;
      }
      await stopBackgroundTracking();
      setIsBackgroundTrackingActive(false);
    },
  };
};