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

      // Check if background permission is granted
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

      // Start background tracking
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

      console.log("payload fore",payload);
      

      const res = await addAndUpdateFROLocation(
        payload,
        token,
        csrfToken || ""
      );

      console.log("✅ Location update success");
    } catch (error) {
      console.error("❌ Location update error:", error);
    }
  }, [hasPermission, userId, fullName, address, authState?.token, authState?.antiforgeryToken, fetchLocation]);

  // Handle app state changes
  useEffect(() => {
    if (!hasPermission || !userId) return;

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to foreground
        console.log("App came to foreground");
        sendLocation();
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [hasPermission, userId, sendLocation]);

  // Main effect for foreground tracking
  useEffect(() => {
    if (!hasPermission || !userId) return;

    // Send initial location
    sendLocation();
    
    // Set up foreground interval (every 10 seconds)
    intervalRef.current = setInterval(sendLocation, 10000);

    // Cleanup
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasPermission, userId, sendLocation]);

  // Cleanup on unmount or when userId becomes null
  useEffect(() => {
    return () => {
      if (!userId) {
        stopBackgroundTracking();
      }
    };
  }, [userId]);

  return {
    isTracking: hasPermission && !!userId,
    isBackgroundTracking: isBackgroundTrackingActive,
    stopTracking: async () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      await stopBackgroundTracking();
      setIsBackgroundTrackingActive(false);
    },
  };
};