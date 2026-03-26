import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AppState,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  requestDisableBatteryOptimizations,
  shouldShowBatteryGuide,
} from "@/services/batteryOptimization";

import { openAutoRevokeSettings } from "@/services/autoRevokePermission";

const LocationContext = createContext<any>({});

type Step = "fg" | "bg" | "battery" | "autoRevoke" | "done";

export const LocationProvider = ({ children }: any) => {
  const [step, setStep] = useState<Step>("fg");
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(1);
  const [isChecking, setIsChecking] = useState(false);

  /* ================= INIT ================= */

  useEffect(() => {
    evaluate();
  }, []);

  /* ================= APP RETURN ================= */

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        evaluate();
      }
    });
    return () => sub.remove();
  }, []);

  /* ================= CORE ENGINE ================= */

  const evaluate = async () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      const fg = await Location.getForegroundPermissionsAsync();
      const bg = await Location.getBackgroundPermissionsAsync();

      // ❌ Foreground not granted
      if (fg.status !== "granted") {
        setStep("fg");
        setProgress(1);
        setVisible(true);
        return;
      }

      // ❌ Background not granted
      if (bg.status !== "granted") {
        setStep("bg");
        setProgress(2);
        setVisible(true);
        return;
      }

      // ANDROID ONLY CHECKS
      if (Platform.OS === "android") {
        const battery = await shouldShowBatteryGuide();

        if (battery) {
          setStep("battery");
          setProgress(3);
          setVisible(true);
          return;
        }

        // ✅ Auto revoke confirmation (IMPORTANT FIX)
        const confirmed = await AsyncStorage.getItem("autoRevokeConfirmed");

        if (!confirmed) {
          setStep("autoRevoke");
          setProgress(4);
          setVisible(true);
          return;
        }
      }

      // ✅ ALL GOOD
      setStep("done");
      setVisible(false);

    } catch (e) {
      console.log("Permission flow error:", e);
    } finally {
      setIsChecking(false);
    }
  };

  /* ================= ACTIONS ================= */

  const requestFG = async () => {
    await Location.requestForegroundPermissionsAsync();
    evaluate();
  };

  const requestBG = async () => {
    await Location.requestBackgroundPermissionsAsync();
    evaluate();
  };

  const openBattery = () => {
    requestDisableBatteryOptimizations();
  };

  const openAutoRevoke = async () => {
    await openAutoRevokeSettings();

    // ✅ Assume user disables → store confirmation
    await AsyncStorage.setItem("autoRevokeConfirmed", "true");
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  /* ================= UI ================= */

  const renderStep = () => {
    switch (step) {
      case "fg":
        return {
          title: "Enable Location Access",
          desc: "We require your location to track field activity accurately.",
          btn: "Allow Location",
          action: requestFG,
        };

      case "bg":
        return {
          title: "Enable Background Tracking",
          desc: "Allow location access even when the app is closed.",
          btn: "Allow Always",
          action: requestBG,
        };

      case "battery":
        return {
          title: "Disable Battery Restrictions",
          desc: "Ensure uninterrupted tracking by disabling battery optimization.",
          btn: "Open Settings",
          action: openBattery,
        };

      case "autoRevoke":
        return {
          title: "Keep Permissions Active",
          desc:
            "Turn OFF 'Remove permissions if app is unused' to ensure continuous tracking.",
          btn: "Open Settings",
          action: openAutoRevoke,
        };

      default:
        return null;
    }
  };

  const data = renderStep();

  return (
    <LocationContext.Provider value={{}}>
      {/* ❌ HARD BLOCK UNTIL DONE */}
      {step === "done" && children}

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.progress}>
              Step {progress} of 4
            </Text>

            <Text style={styles.title}>{data?.title}</Text>

            <Text style={styles.desc}>{data?.desc}</Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={data?.action}>
              <Text style={styles.primaryText}>{data?.btn}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={openSettings}>
              <Text style={styles.link}>Open App Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    elevation: 5,
  },
  progress: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
  },
  primaryText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    marginTop: 12,
    color: "#007AFF",
    fontSize: 13,
  },
});