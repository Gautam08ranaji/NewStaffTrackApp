import BodyLayout from "@/components/layout/BodyLayout";
import { addNotesRecord, AddNotesRecordPayload } from "@/features/fro/complaints/addNoteApi";
import { addInteractionActivityHistory } from "@/features/fro/interaction/ActivityHistory";
import { getUserDataById } from "@/features/fro/profile/getProfile";

import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { showApiError } from "@/utils/showApiError";
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

/* ---------- FOLLOW-UP TYPES ---------- */
const FOLLOW_UP_TYPES = [
  { value: "FIRST", label: "First Follow-up" },
  { value: "SECOND", label: "Second Follow-up" },
  { value: "THIRD", label: "Third Follow-up" },
];

export default function AddNoteScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const authState = useAppSelector((state) => state.auth);

  const [noteType, setNoteType] = useState("PUBLIC");
  const [followUpType, setFollowUpType] = useState("FIRST");
  const [description, setDescription] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);

  const [showNoteTypeSheet, setShowNoteTypeSheet] = useState(false);
  const [showFollowUpTypeSheet, setShowFollowUpTypeSheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useLocalSearchParams();
  const caseId = params.caseId ? Number(params.caseId) : null;
  const transactionNumber = (params.transactionNumber as string) || "";

  /* ---------- DATE HELPER ---------- */
  const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  /* ---------- GET DATE LABEL BASED ON FOLLOW-UP TYPE ---------- */
  const getDateLabel = () => {
    switch (followUpType) {
      case "FIRST":
        return "First Follow-up Date";
      case "SECOND":
        return "Second Follow-up Date";
      case "THIRD":
        return "Third Follow-up Date";
      default:
        return "Follow-up Date";
    }
  };

  /* ---------- SAVE ACTIVITY ---------- */
  const saveActivity = async ({
    interactionId,
    noteType,
    noteDescription,
    followUpDate,
    followUpType,
    activityStatus,
    transactionNumber,
  }: any) => {
    try {
      const userRes = await getUserDataById({
        userId: String(authState?.userId),
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
      });

      const firstName = userRes?.data?.firstName || "";
      const lastName = userRes?.data?.lastName || "";
      const activityByName = `${firstName} ${lastName}`.trim();

      const formattedDate = followUpDate.toLocaleDateString();
      const followUpTypeLabel = FOLLOW_UP_TYPES.find(t => t.value === followUpType)?.label || followUpType;

      const activityDescription = `${noteType} note added: "${noteDescription}" with ${followUpTypeLabel} date: ${formattedDate}`;

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

      await addInteractionActivityHistory({
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        body: payload,
      });
    } catch (err) {
      console.log("Activity error", err);
      showApiError(error, dispatch);
    }
  };

  /* ---------- SUBMIT ---------- */
  const submitNote = async () => {
    if (!description.trim()) {
      Alert.alert("Validation", "Please enter a description");
      return;
    }

    if (!followUpDate) {
      Alert.alert("Validation", "Please select a follow-up date");
      return;
    }

    if (!caseId) {
      Alert.alert("Error", "Case not found");
      return;
    }

    setLoading(true);

    try {
      // Prepare payload based on selected follow-up type
      const basePayload: AddNotesRecordPayload = {
        relatedTo: "CAS",
        relatedToId: caseId,
        relatedToName: transactionNumber,
        noteType: noteType.toLowerCase(),
        noteDesc: description,
        createdBy: String(authState.userId),
        nextFollowupDate: null,
        isNextFollowupStatus: "No",
        secondFollowupDate: null,
        isSecondVisitStatus: "No",
        thirdFollowupDate: null,
        isThirdVisitStatus: "No",
      };

      // Set dates and status based on follow-up type
      switch (followUpType) {
        case "FIRST":
          basePayload.nextFollowupDate = followUpDate.toISOString();
          basePayload.isNextFollowupStatus = "Yes";
          break;
        case "SECOND":
          basePayload.secondFollowupDate = followUpDate.toISOString();
          basePayload.isSecondVisitStatus = "Yes";
          break;
        case "THIRD":
          basePayload.thirdFollowupDate = followUpDate.toISOString();
          basePayload.isThirdVisitStatus = "Yes";
          break;
      }

      // Log the final payload
      console.log("========== FINAL PAYLOAD ==========");
  
      console.log("Complete Payload:", JSON.stringify(basePayload, null, 2));
      console.log("===================================");

    const res =  await addNotesRecord({
        payload: basePayload,
        auth: {
          bearerToken: String(authState.token),
          antiForgeryToken: String(authState.antiforgeryToken),
        },
      });

      console.log("res",res);
      

      await saveActivity({
        interactionId: caseId,
        noteType,
        noteDescription: description,
        followUpDate,
        followUpType,
        activityStatus: "Busy",
        transactionNumber,
      });

      Alert.alert("Success", "Note added successfully");
      router.back();
    } catch (error: any) {
   showApiError(error, dispatch);
    } finally {
      setLoading(false);
    }
  };

  const getFollowUpTypeLabel = (type: string) => {
    switch (type) {
      case "FIRST":
        return "First Follow-up";
      case "SECOND":
        return "Second Follow-up";
      case "THIRD":
        return "Third Follow-up";
      default:
        return type;
    }
  };

  return (
    <BodyLayout type="screen" screenName="Add Note">
      <View style={styles.container}>
        {/* NOTE TYPE */}
        <Text style={styles.label}>Note Type</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowNoteTypeSheet(true)}
        >
          <Text style={styles.textPrimary}>
            {noteType === "PUBLIC" ? "Public Note" : "Private Note"}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* FOLLOW-UP TYPE */}
        <Text style={[styles.label, { marginTop: 16 }]}>Follow-up Type</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowFollowUpTypeSheet(true)}
        >
          <Text style={styles.textPrimary}>
            {getFollowUpTypeLabel(followUpType)}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* DYNAMIC DATE LABEL BASED ON FOLLOW-UP TYPE */}
        <Text style={[styles.label, { marginTop: 16 }]}>
          {getDateLabel()}
        </Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={followUpDate ? styles.textPrimary : styles.textSecondary}
          >
            {followUpDate
              ? followUpDate.toDateString()
              : "Select Date"}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* DESCRIPTION */}
        <Text style={[styles.label, { marginTop: 20 }]}>Description</Text>

        <TextInput
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description..."
          placeholderTextColor={theme.colors.colorTextSecondary}
          style={styles.textArea}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.btnPrimaryBg },
          ]}
          onPress={submitNote}
          disabled={loading}
        >
          <Text
            style={[
              styles.saveText,
              { color: theme.colors.btnPrimaryText },
            ]}
          >
            {loading ? "Adding..." : "Save Note"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={followUpDate ?? getTomorrow()}
          mode="date"
          minimumDate={getTomorrow()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setFollowUpDate(selectedDate);
          }}
        />
      )}

      {/* NOTE TYPE SHEET */}
      <Modal transparent visible={showNoteTypeSheet} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowNoteTypeSheet(false)} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select Note Type</Text>

          {NOTE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.sheetItem}
              onPress={() => {
                setNoteType(type);
                setShowNoteTypeSheet(false);
              }}
            >
              <Text style={styles.textPrimary}>
                {type === "PUBLIC" ? "Public Note" : "Private Note"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* FOLLOW-UP TYPE SHEET */}
      <Modal transparent visible={showFollowUpTypeSheet} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowFollowUpTypeSheet(false)} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select Follow-up Type</Text>

          {FOLLOW_UP_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={styles.sheetItem}
              onPress={() => {
                setFollowUpType(type.value);
                setShowFollowUpTypeSheet(false);
              }}
            >
              <Text style={styles.textPrimary}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </BodyLayout>
  );
}

/* ---------- STYLES ---------- */
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
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
      borderColor: theme.colors.border,
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
      borderColor: theme.colors.border,
      color: theme.colors.colorTextPrimary,
    },

    saveButton: {
      marginTop: 30,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },

    saveText: {
      fontWeight: "600",
    },

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