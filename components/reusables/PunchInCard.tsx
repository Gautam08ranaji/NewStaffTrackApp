import { useTheme } from "@/theme/ThemeContext";
import * as FaceDetector from "expo-face-detector";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { Camera, useCameraDevice } from "react-native-vision-camera";

export default function PunchInCard() {
  const { theme } = useTheme();
  const device = useCameraDevice("front");
  const cameraRef = useRef<Camera>(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [dutyEnded, setDutyEnded] = useState(false);

  /* ================= CAMERA PERMISSION ================= */

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();

    if (status === "granted") {
      setHasPermission(true);
    } else {
      const newStatus = await Camera.requestCameraPermission();
      setHasPermission(newStatus === "granted");
    }
  };

  /* ================= AUTO FACE SCAN ================= */

  useEffect(() => {
    if (cameraVisible) {
      const timer = setTimeout(() => {
        detectFace();
      }, 1500); // give camera time to initialize

      return () => clearTimeout(timer);
    }
  }, [cameraVisible]);

  const handlePunch = () => {
    if (dutyEnded) return;
    setCameraVisible(true);
  };

  /* ================= FACE DETECTION ================= */

  const detectFace = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePhoto();
      const uri = `file://${photo.path}`;

      const result = await FaceDetector.detectFacesAsync(uri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications:
          FaceDetector.FaceDetectorClassifications.none,
      });

      if (result.faces.length > 0) {
        confirmAttendance();
      } else {
        Toast.show({
          type: "error",
          text1: "Face Not Found",
        });
        setCameraVisible(false);
      }
    } catch (error) {
      console.log("Face detection error:", error);
      Toast.show({
        type: "error",
        text1: "Detection Failed",
      });
      setCameraVisible(false);
    }
  };

  /* ================= CONFIRM ATTENDANCE ================= */

  const confirmAttendance = () => {
    setCameraVisible(false);

    if (!isPunchedIn) {
      setIsPunchedIn(true);
      Toast.show({
        type: "success",
        text1: "Punch In Successful",
      });
    } else {
      setIsPunchedIn(false);
      setDutyEnded(true);
      Toast.show({
        type: "success",
        text1: "Punch Out Successful",
      });
    }
  };

  /* ================= PERMISSION UI ================= */

  if (hasPermission === null) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ textAlign: "center" }}>Checking permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          onPress={checkPermission}
          style={{
            padding: 14,
            backgroundColor: theme.colors.validationWarningText,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Allow Camera Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ textAlign: "center" }}>Preparing camera...</Text>
      </View>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <View style={{ padding: 16 }}>
      <TouchableOpacity
        onPress={handlePunch}
        style={{
          padding: 14,
          backgroundColor: theme.colors.validationWarningText,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {dutyEnded
            ? "Punched Out"
            : isPunchedIn
            ? "Punch Out (Face Scan)"
            : "Punch In (Face Scan)"}
        </Text>
      </TouchableOpacity>

      <Modal visible={cameraVisible} animationType="slide">
        <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          device={device}
          isActive={true}
          photo={true}
        />

        <Text
          style={{
            position: "absolute",
            top: 60,
            alignSelf: "center",
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Scanning Face...
        </Text>
      </Modal>
    </View>
  );
}