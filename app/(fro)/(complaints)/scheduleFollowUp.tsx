import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function ScheduleFollowUpScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // FIELDS
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [remarks, setRemarks] = useState("");

  // PICKER STATES
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ERRORS
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [remarksError, setRemarksError] = useState("");

  const validateForm = () => {
    let valid = true;

    if (!date) {
      setDateError("Please select a follow-up date.");
      valid = false;
    }

    if (!time) {
      setTimeError("Please select a follow-up time.");
      valid = false;
    }

    if (!remarks.trim()) {
      setRemarksError("Remarks are required.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    console.log("Follow-up Scheduled:", { date, time, remarks });
  };

  return (
    <BodyLayout type="screen" screenName={t("caseDetail.scheduleFollowup")}>
      <View style={[styles.card, { backgroundColor: theme.colors.colorBgPage }]}>

        {/* DATE FIELD */}
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
          Select Follow-up Date *
        </Text>

        {dateError ? (
          <Text style={[styles.errorText, { color: theme.colors.validationErrorText }]}>
            {dateError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.selector, { borderColor: theme.colors.colorPrimary600 }]}
          onPress={() => {
            setShowDatePicker(true);
            setDateError("");
          }}
        >
          <Text style={styles.selectorText}>
            {date ? date.toDateString() : "Choose Date"}
          </Text>

          {/* ICON RIGHT */}
          <RemixIcon
            name="calendar-line"
            size={22}
            color={theme.colors.colorPrimary600}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date ?? new Date()}
            mode="date"
            display="calendar"
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
                setDateError("");
              }
            }}
          />
        )}

        {/* TIME FIELD */}
        <Text
          style={[
            styles.label,
            { marginTop: 16, color: theme.colors.colorTextSecondary },
          ]}
        >
          Select Follow-up Time *
        </Text>

        {timeError ? (
          <Text style={[styles.errorText, { color: theme.colors.validationErrorText }]}>
            {timeError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.selector, { borderColor: theme.colors.colorPrimary600 }]}
          onPress={() => {
            setShowTimePicker(true);
            setTimeError("");
          }}
        >
          <Text style={styles.selectorText}>
            {time
              ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Choose Time"}
          </Text>

          {/* ICON RIGHT */}
          <RemixIcon
            name="time-line"
            size={22}
            color={theme.colors.colorPrimary600}
          />
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time ?? new Date()}
            mode="time"
            display={Platform.OS === "android" ? "spinner" : "default"}
            onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setTime(selectedTime);
                setTimeError("");
              }
            }}
          />
        )}

        {/* REMARKS FIELD */}
        <Text
          style={[
            styles.label,
            { marginTop: 16, color: theme.colors.colorTextSecondary },
          ]}
        >
          Remarks *
        </Text>

        {remarksError ? (
          <Text style={[styles.errorText, { color: theme.colors.validationErrorText }]}>
            {remarksError}
          </Text>
        ) : null}

        <TextInput
          placeholder="Enter remarks"
          placeholderTextColor={theme.colors.colorTextSecondary}
          value={remarks}
          onChangeText={(text) => {
            setRemarks(text);
            setRemarksError("");
          }}
          multiline
          style={[
            styles.input,
            {
              borderColor: theme.colors.colorPrimary600,
              color: theme.colors.colorTextPrimary,
            },
          ]}
        />

        {/* SUBMIT */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: theme.colors.colorPrimary600 },
          ]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitBtnText, { color: theme.colors.colorBgPage }]}>
            Schedule Follow-up
          </Text>
        </TouchableOpacity>
      </View>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 18,
    borderRadius: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
  },

  errorText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
  },

  selector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
  },

  selectorText: {
    fontSize: 15,
    fontWeight: "500",
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginTop: 6,
    fontSize: 15,
  },

  submitBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
