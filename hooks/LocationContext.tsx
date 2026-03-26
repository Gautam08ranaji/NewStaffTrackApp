import {
  checkAutoRevokeStatus,
  shouldShowAutoRevokeGuide,
  showAutoRevokeGuide
} from "@/services/autoRevokePermission";

import {
  requestDisableBatteryOptimizations,
  shouldShowBatteryGuide,
  showBatteryOptimizationGuide
} from "@/services/batteryOptimization";

import { useTheme } from "@/theme/ThemeContext";
import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

/* ================= CONTEXT ================= */

const LocationContext = createContext<any>({});

/* ================= PROVIDER ================= */

export const LocationProvider = ({ children }: any) => {
  const { theme } = useTheme();

  const [location, setLocation] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);
  const [autoRevokeEnabled, setAutoRevokeEnabled] = useState(false);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStep, setPermissionStep] = useState<'initial' | 'background'>('initial');

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      setShowPermissionModal(true);
      setPermissionStep('initial');
    } else if (!hasBackgroundPermission) {
      setShowPermissionModal(true);
      setPermissionStep('background');
    } else {
      setShowPermissionModal(false);
    }
  }, [hasPermission, hasBackgroundPermission]);

  const checkPermissions = async () => {
    const fg = await Location.getForegroundPermissionsAsync();
    const bg = await Location.getBackgroundPermissionsAsync();

    setHasPermission(fg.status === "granted");
    setHasBackgroundPermission(bg.status === "granted");

    console.log("Permission check:", {
      foreground: fg.status,
      background: bg.status
    });

    if (fg.status === "granted" && bg.status === "granted" && Platform.OS === "android") {
      const shouldShowBattery = await shouldShowBatteryGuide();

      if (shouldShowBattery) {
        setTimeout(() => requestDisableBatteryOptimizations(), 2000);
      } else {
        setTimeout(async () => {
          const shouldShowAuto = await shouldShowAutoRevokeGuide();
          if (shouldShowAuto) {
            const status = await checkAutoRevokeStatus();
            setAutoRevokeEnabled(status.isEnabled);
            showAutoRevokeGuide();
          }
        }, 4000);
      }
    }
  };

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setHasPermission(status === "granted");
    return status === "granted";
  };

  const requestBackgroundPermission = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    setHasBackgroundPermission(status === "granted");
    return status === "granted";
  };

  const fetchLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    return loc;
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
        fetchLocation,
        showBatteryOptimizationGuide
      }}
    >
      {children}

      <Modal visible={showPermissionModal} transparent>
        <View style={styles.overlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text>Location permission required</Text>

            <TouchableOpacity onPress={requestPermission}>
              <Text>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { padding: 20, borderRadius: 10 }
});