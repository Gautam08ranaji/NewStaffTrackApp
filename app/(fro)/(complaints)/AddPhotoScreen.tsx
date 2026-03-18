import BodyLayout from "@/components/layout/BodyLayout";
import { addCommonDocument, AddCommonDocumentPayload } from "@/features/fro/complaints/addDocument";
import { addInteractionActivityHistory } from "@/features/fro/interaction/ActivityHistory";
import { getUserDataById } from "@/features/fro/profile/getProfile";
import { useAppSelector } from "@/store/hooks";
import type { Theme } from "@/theme/ThemeContext";
import { useTheme } from "@/theme/ThemeContext";
import { showApiError } from "@/utils/showApiError";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SelectedFile = {
  uri: string;
  name: string;
  type: "image" | "pdf" | "video";
};

export default function UpdateDocumentScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const authState = useAppSelector((state) => state.auth);
  const params = useLocalSearchParams();
  const caseId = params.caseId ? Number(params.caseId) : null;
  const transactionNumber = (params.transactionNumber as string) || "";

  // Debug logs
  console.log("📦 UpdateDocumentScreen Params:", params);
  console.log("📦 Case ID:", caseId);
  console.log("📦 Transaction Number:", transactionNumber);

  const [description, setDescription] = useState("");
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Live type states
  const [liveType, setLiveType] = useState<string>("");
  const [liveStartTime, setLiveStartTime] = useState<string>("");
  const [liveEndTime, setLiveEndTime] = useState<string>("");
  const [showLiveFields, setShowLiveFields] = useState(false);
  
  // Error states
  const [liveTypeError, setLiveTypeError] = useState<string>("");
  
  // Video recording refs
  const videoStartTimeRef = useRef<Date | null>(null);

  /* ---------- SAVE ACTIVITY HISTORY ---------- */
  const saveActivity = async ({
    interactionId,
    documentName,
    documentDescription,
    documentType,
    transactionNumber,
  }: {
    interactionId: number;
    documentName: string;
    documentDescription: string;
    documentType: string;
    transactionNumber: string;
  }) => {
    try {
      /* ---------------- FETCH USER DATA FIRST ---------------- */
      const userRes = await getUserDataById({
        userId: String(authState?.userId),
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
      });

      const firstName = userRes?.data?.firstName || "";
      const lastName = userRes?.data?.lastName || "";
      const activityByName = `${firstName} ${lastName}`.trim();

      /* ---------------- BUILD ACTIVITY DESCRIPTION ---------------- */
      const activityDescription =
        t("updateDocument.activityDescription", {
          documentName,
          documentDescription,
          documentType,
        }) || `Document uploaded: "${documentName}" - ${documentDescription} (Type: ${documentType})`;

      /* ---------------- USE FALLBACK FOR TRANSACTION NUMBER ---------------- */
      const relatedToName = transactionNumber || `Case-${interactionId}`;

      /* ---------------- ACTIVITY PAYLOAD ---------------- */
      const payload = {
        activityTime: new Date().toISOString(),
        activityInteractionId: interactionId,
        activityActionName: "INSERT",
        activityDescription,
        activityStatus: "Busy",
        activityById: String(authState?.userId),
        activityByName,
        activityRelatedTo: "CAS",
        activityRelatedToId: interactionId,
        activityRelatedToName: relatedToName,
      };

      const response = await addInteractionActivityHistory({
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        body: payload,
      });

      console.log("✅ Document Activity Response:", response);
    } catch (err) {
      console.error("❌ Document Activity save error:", err);
      showApiError(error, dispatch);
    }
  };

  /* BASE64 CLEAN */
  const fileToBase64 = async (uri: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64.replace(/\n/g, "").replace(/\r/g, "").replace(/\s/g, "");
  };

  /* CAMERA */
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("updateDocument.cameraPermission") || "Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.4,
    });

    if (!result.canceled) {
      setFile({
        uri: result.assets[0].uri,
        name: t("updateDocument.cameraImage") || "Camera_Image.jpg",
        type: "image",
      });
      // Hide live fields for images
      setShowLiveFields(false);
      setLiveType("");
      setLiveStartTime("");
      setLiveEndTime("");
      setLiveTypeError("");
    }
  };

  /* GALLERY */
  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.4,
    });

    if (!result.canceled) {
      setFile({
        uri: result.assets[0].uri,
        name: t("updateDocument.galleryImage") || "Gallery_Image.jpg",
        type: "image",
      });
      // Hide live fields for images
      setShowLiveFields(false);
      setLiveType("");
      setLiveStartTime("");
      setLiveEndTime("");
      setLiveTypeError("");
    }
  };

  /* PDF */
  const openPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.assets?.length) {
      setFile({
        uri: result.assets[0].uri,
        name: result.assets[0].name.replace(/\s/g, "_"),
        type: "pdf",
      });
      // Hide live fields for PDFs
      setShowLiveFields(false);
      setLiveType("");
      setLiveStartTime("");
      setLiveEndTime("");
      setLiveTypeError("");
    }
  };

  /* VIDEO RECORDING / LIVE STREAMING */
  const openVideoRecording = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (!cameraPermission.granted) {
      Alert.alert(
        t("updateDocument.permissionRequired") || "Permission Required",
        t("updateDocument.cameraPermission") || "Camera permission is required to record video"
      );
      return;
    }

    // Show live type selection for videos
    setShowLiveFields(true);
    setLiveTypeError("");
    
    // Set start time when beginning video recording
    const now = new Date();
    setLiveStartTime(now.toISOString());
    videoStartTimeRef.current = now;
    
    // Launch video camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // Max 60 seconds video
    });

    if (!result.canceled) {
      const videoUri = result.assets[0].uri;
      const fileName = `Video_${new Date().getTime()}.mp4`;

      setFile({
        uri: videoUri,
        name: fileName,
        type: "video",
      });
      
      // Set end time when video recording is complete
      const endTime = new Date();
      setLiveEndTime(endTime.toISOString());
      
    } else {
      // Clear times if cancelled
      setLiveStartTime("");
      setLiveEndTime("");
      videoStartTimeRef.current = null;
    }
  };

  /* VALIDATE FORM */
  const validateForm = (): boolean => {
    // Reset errors
    setLiveTypeError("");
    
    // Check if it's a video and liveType is required
    if (file?.type === "video" && !liveType.trim()) {
      setLiveTypeError(t("updateDocument.liveTypeRequired") || "Live type is required for videos");
      return false;
    }
    
    return true;
  };

  /* SUBMIT */
  const onSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(
        t("common.validationError") || "Validation Error",
        t("updateDocument.enterDescription") || "Enter description"
      );
      return;
    }

    if (!file || !caseId) {
      Alert.alert(
        t("common.validationError") || "Validation Error",
        t("updateDocument.missingFile") || "Missing file or case ID"
      );
      return;
    }

    // Validate form (shows red error text instead of alert)
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const base64 = await fileToBase64(file.uri);
      console.log("BASE64 SIZE:", base64.length);

      const cleanName = file.name.replace(/\s/g, "_");

      // Determine document type and mime type for API
      let documentType = "IMAGE";
      let mimeType = "image/jpeg";
      
      if (file.type === "pdf") {
        documentType = "PDF";
        mimeType = "application/pdf";
      } else if (file.type === "video") {
        documentType = "VIDEO";
        mimeType = "video/mp4";
      }

      // Get user name for ownerName
      let ownerName = "";
      try {
        const userRes = await getUserDataById({
          userId: String(authState?.userId),
          token: String(authState?.token),
          csrfToken: String(authState?.antiforgeryToken),
        });
        
        const firstName = userRes?.data?.firstName || "";
        const lastName = userRes?.data?.lastName || "";
        ownerName = `${firstName} ${lastName}`.trim() || "Unknown User";
      } catch (error) {
        console.error("Error fetching user name:", error);
        ownerName = "Unknown User";
      }

      // Complete payload with all required fields
      const payload: AddCommonDocumentPayload = {
        relatedTo: "CAS",
        relatedToId: caseId,
        documentType: documentType,
        documentName: cleanName,
        documentDescription: description,
        fileName: cleanName,
        mimeType: mimeType,
        fileData: base64,
        ownerId: String(authState?.userId),
        ownerName: ownerName,
        createdBy: String(authState?.userId),
        // Only send live fields for videos, otherwise send empty strings
        liveType: file.type === "video" ? liveType : "",
        liveStartTime: file.type === "video" ? liveStartTime : "",
        liveEndTime: file.type === "video" ? liveEndTime : "",
      };

      // Log payload without base64 for debugging
      const { fileData, ...payloadWithoutBase64 } = payload;
      console.log("API PAYLOAD:", JSON.stringify(payloadWithoutBase64, null, 2));

      const res = await addCommonDocument(
        payload,
        String(authState?.token),
        String(authState?.antiforgeryToken)
      );

      // Save activity history after successful document upload
      await saveActivity({
        interactionId: caseId,
        documentName: cleanName,
        documentDescription: description,
        documentType: file.type === "pdf" ? "PDF" : file.type === "video" ? "Video" : "Image",
        transactionNumber: transactionNumber,
      });

      Alert.alert(
        t("common.success") || "Success",
        res?.message || t("updateDocument.uploadSuccess") || "Uploaded successfully"
      );

      router.push({
        pathname: "/(fro)/(complaints)/DocumentListScreen",
        params: { caseId },
      });

      // Reset form
      setDescription("");
      setFile(null);
      setLiveType("");
      setLiveStartTime("");
      setLiveEndTime("");
      setShowLiveFields(false);
      setLiveTypeError("");
      videoStartTimeRef.current = null;
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
     showApiError(error, dispatch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyLayout
      type="screen"
      screenName={t("updateDocument.screenTitle") || "Upload Document"}
      scrollContentStyle={{ paddingHorizontal: 20 }}
      enableScroll={true}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* DESCRIPTION */}
        <Text style={[styles.label, theme.typography.fontBodySmall]}>
          {t("updateDocument.description") || "Description"}
        </Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder={t("updateDocument.enterDescription") || "Enter document description"}
          placeholderTextColor={theme.colors.inputPlaceholder}
          multiline
        />

        {/* ATTACH DOCUMENT - FIRST ROW */}
        <Text style={[styles.label, theme.typography.fontBodySmall]}>
          {t("updateDocument.attachDocument") || "Attach Document"}
        </Text>

        {/* Row 1: Camera & Gallery */}
        <View style={styles.row}>
          <ActionButton
            icon="camera"
            label={t("updateDocument.camera") || "Camera"}
            onPress={openCamera}
            backgroundColor="#E8F5E9"
            iconColor="#2E7D32"
            textColor="#2E7D32"
          />
          <ActionButton
            icon="image"
            label={t("updateDocument.gallery") || "Gallery"}
            onPress={openGallery}
            backgroundColor="#E3F2FD"
            iconColor="#1565C0"
            textColor="#1565C0"
          />
        </View>

        {/* Row 2: PDF & Video */}
        <View style={styles.row}>
          <ActionButton
            icon="document"
            label={t("updateDocument.pdf") || "PDF"}
            onPress={openPdf}
            backgroundColor="#FFF3E0"
            iconColor="#E65100"
            textColor="#E65100"
          />
          <ActionButton
            icon="videocam"
            label={t("updateDocument.video") || "Video"}
            onPress={openVideoRecording}
            backgroundColor="#FCE4EC"
            iconColor="#C2185B"
            textColor="#C2185B"
          />
        </View>

        {/* LIVE TYPE TEXT INPUT - Only show for videos */}
        {showLiveFields && file?.type === "video" && (
          <View style={styles.liveFieldsContainer}>
            <Text style={[styles.label, theme.typography.fontBodySmall]}>
              {t("updateDocument.liveType") || "Live Type"} <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.liveTypeInput, liveTypeError ? styles.inputError : null]}
              value={liveType}
              onChangeText={(text) => {
                setLiveType(text);
                if (liveTypeError) setLiveTypeError("");
              }}
              placeholder={t("updateDocument.enterLiveType") || "Enter live type (e.g., LIVE, RECORDING, SCHEDULED)"}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />
            {liveTypeError ? (
              <Text style={styles.errorText}>{liveTypeError}</Text>
            ) : null}

            {/* Start Time Display */}
            {liveStartTime && (
              <View style={styles.timeDisplayContainer}>
                <Text style={styles.timeLabel}>
                  {t("updateDocument.startTime") || "Start Time:"}
                </Text>
                <Text style={styles.timeValue}>
                  {new Date(liveStartTime).toLocaleString()}
                </Text>
              </View>
            )}

            {/* End Time Display */}
            {liveEndTime && (
              <View style={styles.timeDisplayContainer}>
                <Text style={styles.timeLabel}>
                  {t("updateDocument.endTime") || "End Time:"}
                </Text>
                <Text style={styles.timeValue}>
                  {new Date(liveEndTime).toLocaleString()}
                </Text>
              </View>
            )}

            {/* Duration Display if both times exist */}
            {liveStartTime && liveEndTime && (
              <View style={styles.timeDisplayContainer}>
                <Text style={styles.timeLabel}>
                  {t("updateDocument.duration") || "Duration:"}
                </Text>
                <Text style={styles.timeValue}>
                  {calculateDuration(liveStartTime, liveEndTime)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* PREVIEW */}
        {file && (
          <View style={styles.previewCard}>
            {file.type === "image" ? (
              <Image source={{ uri: file.uri }} style={styles.previewImage} />
            ) : file.type === "video" ? (
              <View style={styles.videoPreview}>
                <Ionicons
                  name="videocam"
                  size={50}
                  color={theme.colors.colorPrimary500}
                />
                <Ionicons
                  name="play-circle"
                  size={40}
                  color={theme.colors.colorPrimary500}
                  style={styles.playIcon}
                />
                <Text style={[styles.videoName, theme.typography.fontBodySmall]}>
                  {file.name}
                </Text>
                {liveType && (
                  <View style={styles.liveTypeBadge}>
                    <Text style={styles.liveTypeBadgeText}>{liveType}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.pdfPreview}>
                <Ionicons
                  name="document-text"
                  size={40}
                  color={theme.colors.colorPrimary500}
                />
                <Text style={[styles.pdfName, theme.typography.fontBodySmall]}>
                  {file.name}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => {
                setFile(null);
                setLiveType("");
                setLiveStartTime("");
                setLiveEndTime("");
                setShowLiveFields(false);
                setLiveTypeError("");
                videoStartTimeRef.current = null;
              }}
            >
              <Ionicons
                name="close"
                size={18}
                color={theme.colors.btnPrimaryText}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={[styles.submitText, theme.typography.fontButton]}>
            {loading
              ? t("common.uploading") || "Uploading..."
              : t("updateDocument.uploadButton") || "Upload Document"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </BodyLayout>
  );
}

// Helper function to calculate duration
const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/* REUSABLE BUTTON WITH CUSTOM COLORS */
const ActionButton = ({
  icon,
  label,
  onPress,
  backgroundColor,
  iconColor,
  textColor,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  backgroundColor: string;
  iconColor: string;
  textColor: string;
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={iconColor} />
      <Text style={[styles.actionText, { color: textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/* STYLES */
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.colorTextPrimary,
      marginBottom: 6,
    },
    requiredStar: {
      color: theme.colors.btnSosBg || "#FF3B30",
      fontSize: 14,
      fontWeight: "600",
    },
    textArea: {
      backgroundColor: theme.colors.inputBg,
      borderRadius: 12,
      padding: 12,
      minHeight: 100,
      textAlignVertical: "top",
      marginBottom: 16,
      color: theme.colors.inputText,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      fontSize: 14,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 12,
    },
    actionBtn: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    actionText: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: "600",
    },
    liveFieldsContainer: {
      backgroundColor: theme.colors.colorBgSurface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.colorBorder,
    },
    liveTypeInput: {
      backgroundColor: theme.colors.inputBg,
      borderRadius: 8,
      padding: 12,
      marginBottom: 4,
      color: theme.colors.inputText,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      fontSize: 14,
    },
    inputError: {
      borderColor: theme.colors.btnSosBg || "#FF3B30",
      borderWidth: 1,
    },
    errorText: {
      color: theme.colors.btnSosBg || "#FF3B30",
      fontSize: 12,
      marginBottom: 12,
      marginTop: 0,
    },
    timeDisplayContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.colorBorder,
    },
    timeLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.colorTextSecondary,
    },
    timeValue: {
      fontSize: 13,
      color: theme.colors.colorTextPrimary,
    },
    previewCard: {
      backgroundColor: theme.colors.colorBgSurface,
      borderRadius: 14,
      padding: 10,
      marginTop: 8,
      marginBottom: 20,
      position: "relative",
      borderWidth: 1,
      borderColor: theme.colors.colorBorder,
    },
    previewImage: {
      width: "100%",
      height: 200,
      borderRadius: 10,
    },
    pdfPreview: {
      alignItems: "center",
      paddingVertical: 30,
    },
    videoPreview: {
      alignItems: "center",
      paddingVertical: 30,
      position: "relative",
    },
    playIcon: {
      marginTop: 10,
    },
    pdfName: {
      marginTop: 8,
      fontSize: 13,
      color: theme.colors.colorTextPrimary,
    },
    videoName: {
      marginTop: 8,
      fontSize: 13,
      color: theme.colors.colorTextPrimary,
    },
    liveTypeBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: theme.colors.btnPrimaryBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    liveTypeBadgeText: {
      color: theme.colors.btnPrimaryText,
      fontSize: 10,
      fontWeight: "600",
    },
    removeBtn: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: theme.colors.btnSosBg,
      borderRadius: 14,
      padding: 4,
    },
    submitBtn: {
      backgroundColor: theme.colors.btnPrimaryBg,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 20,
    },
    submitText: {
      color: theme.colors.btnPrimaryText,
      fontSize: 16,
      fontWeight: "700",
    },
  });