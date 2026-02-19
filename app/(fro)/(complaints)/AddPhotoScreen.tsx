import BodyLayout from "@/components/layout/BodyLayout";
import { addCommonDocument } from "@/features/fro/complaints/addDocument";
import { addInteractionActivityHistory } from "@/features/fro/interaction/ActivityHistory";
import { getUserDataById } from "@/features/fro/profile/getProfile";

import { useAppSelector } from "@/store/hooks";
import type { Theme } from "@/theme/ThemeContext";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ---------- TYPES ---------- */
type SelectedFile = {
  uri: string;
  name: string;
  type: "image" | "pdf";
};

/* ---------- SCREEN ---------- */
export default function UpdateDocumentScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const authState = useAppSelector((state) => state.auth);
  const params = useLocalSearchParams();
  const caseId = params.caseId ? Number(params.caseId) : null;
  const transactionNumber = (params.transactionNumber as string) || "";

  const [description, setDescription] = useState("");
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);

  // console.log("nav case", caseId);

  /* ---------- SAVE ACTIVITY HISTORY ---------- */
  const saveActivity = async ({
    interactionId,
    documentType,
    documentName,
    description: docDescription,
    activityStatus,
    transactionNumber,
  }: {
    interactionId: number;
    documentType: string;
    documentName: string;
    description: string;
    activityStatus: string;
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
      const activityDescription = `${documentType} "${documentName}" uploaded with comment: "${docDescription}"`;

      /* ---------------- ACTIVITY PAYLOAD ---------------- */
      const payload = {
        activityTime: new Date().toISOString(),
        activityInteractionId: interactionId,
        activityActionName: "INSERT",
        activityDescription,
        activityStatus,
        activityById: String(authState?.userId),
        activityByName,
        activityRelatedTo: "CAS",
        activityRelatedToId: interactionId,
        activityRelatedToName: transactionNumber,
      };

      console.log("📤 Document Activity Payload:", payload);

      const response = await addInteractionActivityHistory({
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        body: payload,
      });

      console.log("✅ Document Activity Response:", response);
    } catch (err) {
      console.error("❌ Document Activity save error:", err);
    }
  };

  /* ---------- BASE64 ---------- */
  const fileToBase64 = async (uri: string) => {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
  };

  /* ---------- CAMERA ---------- */
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setFile({
        uri: result.assets[0].uri,
        name: "Camera Image.jpg",
        type: "image",
      });
    }
  };

  /* ---------- GALLERY ---------- */
  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setFile({
        uri: result.assets[0].uri,
        name: "Gallery Image.jpg",
        type: "image",
      });
    }
  };

  /* ---------- PDF ---------- */
  const openPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.assets?.length) {
      setFile({
        uri: result.assets[0].uri,
        name: result.assets[0].name ?? "Document.pdf",
        type: "pdf",
      });
    }
  };

  /* ---------- SUBMIT ---------- */
  const onSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Validation", "Please enter description");
      return;
    }

    if (!file) {
      Alert.alert("Validation", "Please attach a document");
      return;
    }

    if (!caseId) {
      Alert.alert("Error", "Case ID not found");
      return;
    }

    setLoading(true);

    try {
      const base64 = await fileToBase64(file.uri);

      console.log("lndkl", caseId);

      const payload = {
        relatedTo: "CAS",
        relatedToId: Number(caseId),
        documentType: file.type === "pdf" ? "PDF" : "Image",
        documentName: file.name,
        documentDescription: description,
        fileName: file.name,
        fileData: base64,
        createdBy: String(authState?.userId),
      };

      // console.log("FINAL PAYLOAD STRING", JSON.stringify(payload));

      const res = await addCommonDocument(payload);
      // console.log("res", res);

      // Save activity history after successful upload
      await saveActivity({
        interactionId: Number(caseId),
        documentType: file.type === "pdf" ? "PDF Document" : "Image",
        documentName: file.name,
        description: description,
        activityStatus: "Busy",
        transactionNumber: transactionNumber,
      });

      Alert.alert("Success", res.message || "Document uploaded successfully");
      router.push({
        pathname: "/(fro)/(complaints)/DocumentListScreen",
        params: { caseId },
      });
      setDescription("");
      setFile(null);
    } catch (error) {
      console.log("err", error);

      // Save failed activity
      if (caseId && file) {
        await saveActivity({
          interactionId: Number(caseId),
          documentType: file.type === "pdf" ? "PDF Document" : "Image",
          documentName: file.name,
          description: description,
          activityStatus: "FAILED",
          transactionNumber: transactionNumber,
        });
      }

      // ❌ DO NOTHING
      // Global interceptor already shows error alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyLayout
      type="screen"
      screenName={t("addPhoto.screenTitle")}
      scrollContentStyle={{ paddingHorizontal: 20 }}
    >
      {/* ---------- DESCRIPTION ---------- */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Enter document description"
        placeholderTextColor={theme.colors.inputPlaceholder}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* ---------- ATTACH ---------- */}
      <Text style={styles.label}>Attach Document</Text>

      <View style={styles.row}>
        <ActionButton icon="camera" label="Camera" onPress={openCamera} />
        <ActionButton icon="image" label="Gallery" onPress={openGallery} />
        <ActionButton icon="document" label="PDF" onPress={openPdf} />
      </View>

      {/* ---------- PREVIEW ---------- */}
      {file && (
        <View style={styles.previewCard}>
          {file.type === "image" ? (
            <Image source={{ uri: file.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.pdfPreview}>
              <Ionicons
                name="document-text"
                size={40}
                color={theme.colors.colorPrimary500}
              />
              <Text style={styles.pdfName}>{file.name}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => setFile(null)}
          >
            <Ionicons
              name="close"
              size={18}
              color={theme.colors.colorTextInverse}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* ---------- SUBMIT ---------- */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Uploading..." : "Update Document"}
        </Text>
      </TouchableOpacity>
    </BodyLayout>
  );
}

/* ---------- REUSABLE BUTTON ---------- */
const ActionButton = ({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={22} color={theme.colors.colorPrimary500} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
};

/* ---------- STYLES ---------- */
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.colorTextPrimary,
      marginBottom: 6,
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
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },

    actionBtn: {
      flex: 1,
      backgroundColor: theme.colors.btnSecondaryBg,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: theme.colors.btnSecondaryBorder,
    },

    actionText: {
      fontSize: 12,
      color: theme.colors.colorPrimary500,
      marginTop: 4,
      fontWeight: "600",
    },

    previewCard: {
      backgroundColor: theme.colors.colorBgSurface,
      borderRadius: 14,
      padding: 10,
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

    pdfName: {
      marginTop: 8,
      fontSize: 13,
      color: theme.colors.colorTextPrimary,
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
    },

    submitText: {
      color: theme.colors.btnPrimaryText,
      fontSize: 16,
      fontWeight: "700",
    },
  });
