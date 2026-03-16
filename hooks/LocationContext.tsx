// hooks/LocationProvider.tsx (rename from LocationContext.tsx)
import { startBackgroundTracking } from "@/services/backgroundLocation";
import { useTheme } from "@/theme/ThemeContext";
import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const [isBackgroundTrackingRunning, setIsBackgroundTrackingRunning] = useState(false);
  
  // UI State
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStep, setPermissionStep] = useState<'initial' | 'background'>('initial');

  /* ---------- CHECK PERMISSIONS ON MOUNT ---------- */
  useEffect(() => {
    checkPermissions();
  }, []);

  /* ---------- CHECK BACKGROUND TRACKING STATUS ---------- */
  useEffect(() => {
    const checkTrackingStatus = async () => {
      if (hasPermission && hasBackgroundPermission) {
        const isRunning = await Location.hasStartedLocationUpdatesAsync("fro-background-location");
        setIsBackgroundTrackingRunning(isRunning);
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
        setIsBackgroundTrackingRunning(started);
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
                      const started = await startBackgroundTracking();
                      setIsBackgroundTrackingRunning(started);
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
          setIsBackgroundTrackingRunning(started);
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
    setIsBackgroundTrackingRunning(started);
    return started;
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

  const revokePermission = () => {
    setHasPermission(false);
    setHasBackgroundPermission(false);
    setLocation(null);
    setAddress(null);
    setIsBackgroundTrackingRunning(false);
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
        isBackgroundTrackingRunning,
        startBackgroundTrackingManually,
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