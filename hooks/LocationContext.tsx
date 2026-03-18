// hooks/LocationProvider.tsx
import {
  checkAutoRevokeStatus,
  getAutoRevokeGuideStatus,
  openAutoRevokeSettings as openAutoRevoke,
  resetAutoRevokeGuide,
  shouldShowAutoRevokeGuide,
  showAutoRevokeGuide
} from "@/services/autoRevokePermission";
import {
  checkBackgroundTrackingHealth,
  isBackgroundTrackingRunning as checkIsBackgroundTrackingRunning,
  getBackgroundTrackingStatus,
  getInProgressTickets,
  hasInProgressTickets,
  refreshInProgressTickets,
  registerBackgroundTask,
  startBackgroundTracking,
  stopBackgroundTracking
} from "@/services/backgroundLocation";
import {
  requestDisableBatteryOptimizations,
  shouldShowBatteryGuide,
  showBatteryOptimizationGuide
} from "@/services/batteryOptimization";
import { useTheme } from "@/theme/ThemeContext";
import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, AppStateStatus, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  isBackgroundTrackingRunning: boolean;
  startBackgroundTrackingManually: () => Promise<boolean>;
  stopBackgroundTrackingManually: () => Promise<boolean>;
  inProgressTicketsCount: number;
  refreshTickets: () => Promise<void>;
  checkTrackingHealth: () => Promise<any>;
  getTrackingStatus: () => Promise<any>;
  debugBackgroundTracking: () => Promise<any>;
  showBatteryOptimizationGuide: () => void;
  // Auto-revoke functions
  checkAutoRevoke: () => Promise<void>;
  openAutoRevokeSettings: () => Promise<void>;
  resetAutoRevokeGuide: () => Promise<void>;
  getAutoRevokeStatus: () => Promise<any>;
  autoRevokeEnabled: boolean;
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
  isBackgroundTrackingRunning: false,
  startBackgroundTrackingManually: async () => false,
  stopBackgroundTrackingManually: async () => false,
  inProgressTicketsCount: 0,
  refreshTickets: async () => {},
  checkTrackingHealth: async () => null,
  getTrackingStatus: async () => null,
  debugBackgroundTracking: async () => null,
  showBatteryOptimizationGuide: () => {},
  // Auto-revoke defaults
  checkAutoRevoke: async () => {},
  openAutoRevokeSettings: async () => {},
  resetAutoRevokeGuide: async () => {},
  getAutoRevokeStatus: async () => ({}),
  autoRevokeEnabled: false,
});

/* ================= PROVIDER WITH UI ================= */

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { theme } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);
  const [isBackgroundTrackingRunningState, setIsBackgroundTrackingRunningState] = useState(false);
  const [inProgressTicketsCount, setInProgressTicketsCount] = useState(0);
  const [autoRevokeEnabled, setAutoRevokeEnabled] = useState(false);
  
  // UI State
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStep, setPermissionStep] = useState<'initial' | 'background'>('initial');
  
  // Refs for intervals
  const healthInterval = useRef<NodeJS.Timeout | null>(null);
  const ticketRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  /* ---------- CHECK PERMISSIONS ON MOUNT ---------- */
  useEffect(() => {
    checkPermissions();
    registerBackgroundTask();
  }, []);

  /* ---------- CHECK BACKGROUND TRACKING STATUS ---------- */
  useEffect(() => {
    const checkTrackingStatus = async () => {
      if (hasPermission && hasBackgroundPermission) {
        const isRunning = await checkIsBackgroundTrackingRunning();
        setIsBackgroundTrackingRunningState(isRunning);
        
        // Get initial ticket count
        const tickets = getInProgressTickets();
        setInProgressTicketsCount(tickets.length);
      }
    };
    
    checkTrackingStatus();
  }, [hasPermission, hasBackgroundPermission]);

  /* ---------- SHOW/HIDE MODAL BASED ON PERMISSIONS ---------- */
  useEffect(() => {
    if (!hasPermission) {
      setShowPermissionModal(true);
      setPermissionStep('initial');
    } else if (hasPermission && !hasBackgroundPermission) {
      setShowPermissionModal(true);
      setPermissionStep('background');
    } else {
      setShowPermissionModal(false);
    }
  }, [hasPermission, hasBackgroundPermission]);

  /* ---------- SETUP BACKGROUND MONITORING WHEN TRACKING IS ACTIVE ---------- */
  useEffect(() => {
    if (isBackgroundTrackingRunningState) {
      // Set up health check every 5 minutes
      healthInterval.current = setInterval(async () => {
        const health = await checkBackgroundTrackingHealth();
        console.log("Background tracking health:", health);
        
        // Update ticket count
        const tickets = getInProgressTickets();
        setInProgressTicketsCount(tickets.length);
      }, 300000); // 5 minutes

      // Set up ticket refresh every 5 minutes
      ticketRefreshInterval.current = setInterval(async () => {
        await refreshInProgressTickets();
        const tickets = getInProgressTickets();
        setInProgressTicketsCount(tickets.length);
        console.log(`📊 Updated ticket count: ${tickets.length}`);
      }, 300000); // 5 minutes

      // Monitor app state changes
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        subscription.remove();
        if (healthInterval.current) {
          clearInterval(healthInterval.current);
          healthInterval.current = null;
        }
        if (ticketRefreshInterval.current) {
          clearInterval(ticketRefreshInterval.current);
          ticketRefreshInterval.current = null;
        }
      };
    }
  }, [isBackgroundTrackingRunningState]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      console.log("📱 App came to foreground - checking tracking health");
      await checkTrackingHealth();
      await refreshTickets();
    } else if (nextAppState === 'background') {
      // App went to background
      console.log("📱 App went to background - tracking continues");
      
      // Log current status
      const status = await getTrackingStatus();
      console.log("Background tracking status:", status);
    }
    
    appState.current = nextAppState;
  };

  /* ---------- AUTO-REVOKE FUNCTIONS ---------- */
  // Fixed: Now returns Promise<void> to match type
  const checkAutoRevoke = async (): Promise<void> => {
    const status = await checkAutoRevokeStatus();
    setAutoRevokeEnabled(status.isEnabled);
  };

  // Fixed: Now returns Promise<void> to match type
  const openAutoRevokeSettings = async (): Promise<void> => {
    await openAutoRevoke();
  };

  const getAutoRevokeStatus = async () => {
    return await getAutoRevokeGuideStatus();
  };

  const checkPermissions = async () => {
    try {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      const foreground = foregroundStatus === "granted";
      setHasPermission(foreground);

      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      const background = backgroundStatus === "granted";
      setHasBackgroundPermission(background);
      
      console.log("Permission check:", { foreground, background });

      if (foreground && background) {
        const started = await startBackgroundTracking();
        setIsBackgroundTrackingRunningState(started);
        
        // Initial ticket fetch
        await refreshInProgressTickets();
        const tickets = getInProgressTickets();
        setInProgressTicketsCount(tickets.length);
        
        // Check battery optimization and auto-revoke on Android
        if (Platform.OS === 'android') {
          // First check battery optimization
          const shouldShowBattery = await shouldShowBatteryGuide();
          if (shouldShowBattery) {
            setTimeout(() => {
              requestDisableBatteryOptimizations();
            }, 2000);
          } else {
            // Then check auto-revoke after a delay
            setTimeout(async () => {
              const shouldShowAutoRevoke = await shouldShowAutoRevokeGuide();
              if (shouldShowAutoRevoke) {
                await checkAutoRevoke();
                showAutoRevokeGuide();
              }
            }, 4000);
          }
        }
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      await fetchLocation();
      await checkPermissions();
      
      return true;
    } catch (error) {
      console.error("Location permission error:", error);
      return false;
    }
  };

  const requestBackgroundPermission = async (): Promise<boolean> => {
    try {
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

      if (Platform.OS === 'android') {
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
                    
                    if (granted) {
                      // Show battery optimization guide after a short delay
                      setTimeout(async () => {
                        const shouldShowBattery = await shouldShowBatteryGuide();
                        if (shouldShowBattery) {
                          await requestDisableBatteryOptimizations();
                        } else {
                          // If battery guide already shown, check auto-revoke
                          const shouldShowAutoRevoke = await shouldShowAutoRevokeGuide();
                          if (shouldShowAutoRevoke) {
                            await checkAutoRevoke();
                            showAutoRevokeGuide();
                          }
                        }
                      }, 2000);
                      
                      const started = await startBackgroundTracking();
                      setIsBackgroundTrackingRunningState(started);
                      
                      // Initial ticket fetch
                      await refreshInProgressTickets();
                      const tickets = getInProgressTickets();
                      setInProgressTicketsCount(tickets.length);
                    } else {
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
        const { status } = await Location.requestBackgroundPermissionsAsync();
        const granted = status === "granted";
        setHasBackgroundPermission(granted);
        
        if (granted) {
          const started = await startBackgroundTracking();
          setIsBackgroundTrackingRunningState(started);
          
          // Initial ticket fetch
          await refreshInProgressTickets();
          const tickets = getInProgressTickets();
          setInProgressTicketsCount(tickets.length);
        }
        
        return granted;
      }
    } catch (error) {
      console.error("Background permission error:", error);
      return false;
    }
  };

  const startBackgroundTrackingManually = async (): Promise<boolean> => {
    if (!hasPermission || !hasBackgroundPermission) {
      console.log("Cannot start: missing permissions");
      return false;
    }

    const started = await startBackgroundTracking();
    setIsBackgroundTrackingRunningState(started);
    
    if (started) {
      await refreshInProgressTickets();
      const tickets = getInProgressTickets();
      setInProgressTicketsCount(tickets.length);
    }
    
    return started;
  };

  const stopBackgroundTrackingManually = async (): Promise<boolean> => {
    try {
      await stopBackgroundTracking();
      setIsBackgroundTrackingRunningState(false);
      setInProgressTicketsCount(0);
      return true;
    } catch (error) {
      console.error("Error stopping background tracking:", error);
      return false;
    }
  };

  const refreshTickets = async () => {
    await refreshInProgressTickets();
    const tickets = getInProgressTickets();
    setInProgressTicketsCount(tickets.length);
    console.log(`✅ Tickets refreshed: ${tickets.length} in-progress`);
  };

  const checkTrackingHealth = async () => {
    const health = await checkBackgroundTrackingHealth();
    const tickets = getInProgressTickets();
    setInProgressTicketsCount(tickets.length);
    return health;
  };

  const getTrackingStatus = async () => {
    return await getBackgroundTrackingStatus();
  };

  const checkBackgroundPermission = async (): Promise<boolean> => {
    const { status } = await Location.getBackgroundPermissionsAsync();
    return status === "granted";
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const fetchLocation = async () => {
    try {
      if (!hasPermission) {
        console.log("Cannot fetch location: no permission");
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);

      const { latitude, longitude } = currentLocation.coords;

      try {
        const places = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (places && places.length > 0) {
          const p = places[0];

          const readableAddress = [
            p.name,
            p.street,
            p.city,
            p.region,
            p.country,
          ]
            .filter(Boolean)
            .join(", ");

          setAddress(readableAddress);
        }
      } catch (err) {
        console.log("Reverse geocode failed:", err);
        setAddress("Unknown location");
      }

      return currentLocation;
    } catch (error) {
      console.error("Fetch location error:", error);
      return null;
    }
  };

  const revokePermission = () => {
    setHasPermission(false);
    setHasBackgroundPermission(false);
    setLocation(null);
    setAddress(null);
    setIsBackgroundTrackingRunningState(false);
    setInProgressTicketsCount(0);
    stopBackgroundTrackingManually();
  };

  /* ---------- DEBUG FUNCTION ---------- */
  const debugBackgroundTracking = async () => {
    console.log("🔍 Debug Background Tracking:");
    console.log("=================================");
    
    const isRunning = await checkIsBackgroundTrackingRunning();
    console.log("✅ Is task running:", isRunning);
    
    const status = await getBackgroundTrackingStatus();
    console.log("📊 Full status:", JSON.stringify(status, null, 2));
    
    const hasTickets = hasInProgressTickets();
    console.log("🎫 Has in-progress tickets:", hasTickets);
    
    const tickets = getInProgressTickets();
    console.log("📋 In-progress tickets:", tickets.map(t => ({
      id: t.id,
      transactionNumber: t.transactionNumber,
      status: t.statusName,
      subject: t.subject
    })));
    
    console.log("=================================");
    
    return { 
      isRunning, 
      status, 
      hasTickets, 
      tickets: tickets.map(t => ({
        id: t.id,
        transactionNumber: t.transactionNumber,
        status: t.statusName
      }))
    };
  };

  /* ---------- UI RENDERING ---------- */
  const renderInitialPermission = () => (
    <>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📍</Text>
      </View>
      <Text style={styles.title}>Location Access Required</Text>
      <Text style={styles.message}>
        FIELD TRACK needs access to your location to track your field activities and report your position to supervisors.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.btnPrimaryBg }]}
        onPress={async () => {
          setIsRequesting(true);
          await requestPermission();
          setIsRequesting(false);
        }}
        disabled={isRequesting}
      >
        {isRequesting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, { color: theme.colors.btnPrimaryText }]}>
            Grant Location Access
          </Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderBackgroundPermission = () => (
    <>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔄</Text>
      </View>
      <Text style={styles.title}>Background Tracking</Text>
      <Text style={styles.message}>
        To track your location even when the app is closed, please enable background location permission.
        {'\n\n'}
        On the next screen, select "Allow all the time" for continuous tracking.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.btnPrimaryBg }]}
        onPress={async () => {
          setIsRequesting(true);
          await requestBackgroundPermission();
          setIsRequesting(false);
        }}
        disabled={isRequesting}
      >
        {isRequesting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, { color: theme.colors.btnPrimaryText }]}>
            Enable Background Tracking
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.secondaryButton]}
        onPress={() => setShowPermissionModal(false)}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
          Maybe Later
        </Text>
      </TouchableOpacity>
    </>
  );

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
        isBackgroundTrackingRunning: isBackgroundTrackingRunningState,
        startBackgroundTrackingManually,
        stopBackgroundTrackingManually,
        inProgressTicketsCount,
        refreshTickets,
        checkTrackingHealth,
        getTrackingStatus,
        debugBackgroundTracking,
        showBatteryOptimizationGuide,
        // Auto-revoke values - now properly typed
        checkAutoRevoke,
        openAutoRevokeSettings,
        resetAutoRevokeGuide,
        getAutoRevokeStatus,
        autoRevokeEnabled,
      }}
    >
      {children}
      
      {/* Permission Modal */}
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            {permissionStep === 'initial' && renderInitialPermission()}
            {permissionStep === 'background' && renderBackgroundPermission()}
          </View>
        </View>
      </Modal>
    </LocationContext.Provider>
  );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    color: '#666',
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
  },
});

/* ================= HOOK ================= */
export const useLocation = () => useContext(LocationContext);