import BodyLayout from "@/components/layout/BodyLayout";
import { addNotesRecord } from "@/features/fro/complaints/addNoteApi";
import { addInteractionActivityHistory } from "@/features/fro/interaction/ActivityHistory";
import { getUserDataById } from "@/features/fro/profile/getProfile";

import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ---------- NOTE TYPES ---------- */
const NOTE_TYPES = ["PUBLIC", "PRIVATE"];

export default function AddNoteScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const authState = useAppSelector((state) => state.auth);

  const [noteType, setNoteType] = useState("PUBLIC");
  const [description, setDescription] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);

  const [showSheet, setShowSheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useLocalSearchParams();
  const caseId = params.caseId ? Number(params.caseId) : null;
  const transactionNumber = (params.transactionNumber as string) || "";

  /* ---------- SAVE ACTIVITY HISTORY ---------- */
  const saveActivity = async ({
    interactionId,
    noteType,
    noteDescription,
    followUpDate,
    activityStatus,
    transactionNumber,
  }: {
    interactionId: number;
    noteType: string;
    noteDescription: string;
    followUpDate: Date;
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
      const formattedDate = followUpDate.toLocaleDateString();
      const activityDescription = `${noteType} note added: "${noteDescription}" with follow-up date: ${formattedDate}`;

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

      console.log("📤 Note Activity Payload:", payload);

      const response = await addInteractionActivityHistory({
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        body: payload,
      });

      console.log("✅ Note Activity Response:", response);
    } catch (err) {
      console.error("❌ Note Activity save error:", err);
    }
  };

  /* ---------- TOMORROW ONLY ---------- */
  const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  /* ---------- SUBMIT ---------- */
  const submitNote = async () => {
    if (!noteType) {
      Alert.alert("Validation", "Please select note type");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Validation", "Please enter description");
      return;
    }

    if (!followUpDate) {
      Alert.alert("Validation", "Please select follow-up date");
      return;
    }

    if (!caseId) {
      Alert.alert("Error", "Case ID not found");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        relatedTo: "CAS",
        relatedToId: caseId ?? 0,
        relatedToName: transactionNumber ?? "",
        noteType: noteType.toLowerCase(),
        noteDesc: description,
        createdBy: String(authState.userId),
        nextFollowUpDate: followUpDate.toISOString(),
      };

      await addNotesRecord({
        payload,
        auth: {
          bearerToken: String(authState.token),
          antiForgeryToken: String(authState.antiforgeryToken),
        },
      });

      // Save activity history after successful note addition
      await saveActivity({
        interactionId: Number(caseId),
        noteType: noteType,
        noteDescription: description,
        followUpDate: followUpDate,
        activityStatus: "Busy",
        transactionNumber: transactionNumber,
      });

      Alert.alert("Success", "Note added successfully");
      router.back();
    } catch (error: any) {
      console.log("❌ Note addition error:", error);

      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to add note. Please try again.";

      if (status === 401) {
        Alert.alert("Session Expired", "Please login again.", [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]);
        return;
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyLayout type="screen">
      <View style={styles.container}>
        {/* ---------- FOLLOW UP DATE ---------- */}
        <Text style={styles.label}>Next Follow-up Date</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={followUpDate ? styles.textPrimary : styles.textSecondary}
          >
            {followUpDate
              ? followUpDate.toDateString()
              : "Select follow-up date"}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* ---------- NOTE TYPE ---------- */}
        <Text style={[styles.label, { marginTop: 16 }]}>Note Type</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowSheet(true)}
        >
          <Text style={noteType ? styles.textPrimary : styles.textSecondary}>
            {noteType || "Select note type"}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* ---------- DESCRIPTION ---------- */}
        <Text style={[styles.label, { marginTop: 20 }]}>Description</Text>

        <TextInput
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Write note description..."
          placeholderTextColor={theme.colors.colorTextSecondary}
          style={styles.textArea}
        />

        {/* ---------- SAVE BUTTON ---------- */}
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={submitNote}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Adding Note..." : "Save Note"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- DATE PICKER ---------- */}
      {showDatePicker && (
        <DateTimePicker
          value={followUpDate ?? getTomorrow()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={getTomorrow()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setFollowUpDate(selectedDate);
          }}
        />
      )}

      {/* ---------- NOTE TYPE BOTTOM SHEET ---------- */}
      <Modal transparent visible={showSheet} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowSheet(false)} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select Note Type</Text>

          {NOTE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.sheetItem}
              onPress={() => {
                setNoteType(type);
                setShowSheet(false);
              }}
            >
              <Text style={styles.textPrimary}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </BodyLayout>
  );
}

/* ---------- THEMED STYLES ---------- */
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.colorBgPage,
    },

    label: {
      fontSize: 13,
      marginBottom: 6,
      color: theme.colors.colorTextSecondary,
    },

    dropdown: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.colorBgSurface,
      borderColor: theme.colors.navDivider,
    },

    textPrimary: {
      color: theme.colors.colorTextPrimary,
      fontSize: 14,
    },

    textSecondary: {
      color: theme.colors.colorTextSecondary,
      fontSize: 14,
    },

    textArea: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      minHeight: 120,
      textAlignVertical: "top",
      fontSize: 14,
      backgroundColor: theme.colors.colorBgSurface,
      borderColor: theme.colors.navDivider,
      color: theme.colors.colorTextPrimary,
    },

    saveButton: {
      marginTop: 30,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: theme.colors.colorPrimary600,
    },

    saveText: {
      color: theme.colors.colorBgSurface,
      fontWeight: "600",
    },

    /* Bottom Sheet */
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },

    sheet: {
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.colors.colorBgSurface,
      marginBottom: 80,
    },

    sheetTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 16,
      color: theme.colors.colorHeadingH1,
    },

    sheetItem: {
      paddingVertical: 14,
    },
  });
