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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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

  /* ---------- DATE HELPER ---------- */
  const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  /* ---------- SAVE ACTIVITY ---------- */
  const saveActivity = async ({
    interactionId,
    noteType,
    noteDescription,
    followUpDate,
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

      const activityDescription = `${noteType} note added: "${noteDescription}" with follow-up date: ${formattedDate}`;

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
    }
  };

  /* ---------- SUBMIT ---------- */
  const submitNote = async () => {
    if (!description.trim()) {
      Alert.alert(
        t("common.validation"),
        t("notes.enterDescription")
      );
      return;
    }

    if (!followUpDate) {
      Alert.alert(
        t("common.validation"),
        t("notes.selectFollowUpDate")
      );
      return;
    }

    if (!caseId) {
      Alert.alert(t("common.error"), t("notes.caseNotFound"));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        relatedTo: "CAS",
        relatedToId: caseId,
        relatedToName: transactionNumber,
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

      await saveActivity({
        interactionId: caseId,
        noteType,
        noteDescription: description,
        followUpDate,
        activityStatus: "Busy",
        transactionNumber,
      });

      Alert.alert(t("common.success"), t("notes.noteAdded"));
      router.back();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("common.somethingWentWrong");

      Alert.alert(t("common.error"), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyLayout type="screen" screenName={t("notes.addNote") || "Add Note"}>
      <View style={styles.container}>
        {/* FOLLOW UP DATE */}
        <Text style={styles.label}>
          {t("notes.followUpDate") || "Next Follow-up Date"}
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
              : t("notes.selectDate")}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* NOTE TYPE */}
        <Text style={[styles.label, { marginTop: 16 }]}>
          {t("notes.noteType")}
        </Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowSheet(true)}
        >
          <Text style={styles.textPrimary}>
            {noteType === "PUBLIC"
              ? t("notes.publicNote")
              : t("notes.privateNote")}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* DESCRIPTION */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          {t("notes.description")}
        </Text>

        <TextInput
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder={t("notes.descriptionPlaceholder")}
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
        >
          <Text
            style={[
              styles.saveText,
              { color: theme.colors.btnPrimaryText },
            ]}
          >
            {loading ? t("notes.addingNote") : t("notes.saveNote")}
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
      <Modal transparent visible={showSheet} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowSheet(false)} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>
            {t("notes.selectNoteType")}
          </Text>

          {NOTE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.sheetItem}
              onPress={() => {
                setNoteType(type);
                setShowSheet(false);
              }}
            >
              <Text style={styles.textPrimary}>
                {type === "PUBLIC"
                  ? t("notes.publicNote")
                  : t("notes.privateNote")}
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