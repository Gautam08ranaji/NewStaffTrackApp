import BodyLayout from "@/components/layout/BodyLayout";
import ReusableButton from "@/components/reusables/ReusableButton";
import StatusModal from "@/components/reusables/StatusModal";
import { useTheme } from "@/theme/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import RemixIcon from "react-native-remix-icon";

export default function EscalationScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState("");
  const [focusField, setFocusField] = useState("");
    const [showDeclinedStatusModal, setShowDeclinedStatusModal] = useState(false);
  

  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const reasons = [
    t("escalation.reason1"),
    t("escalation.reason2"),
    t("escalation.reason3"),
    t("escalation.reason4"),
  ];

  const isFormValid = selectedReason !== "" && notes.trim() !== "";

  const openUploadPicker = async () => {
    Alert.alert(t("escalation.uploadLabel"), t("escalation.uploadText"), [
      {
        text: t("escalation.camera"),
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });

          if (!result.canceled) setFile(result.assets[0]);
        },
      },
      {
        text: t("escalation.gallery"),
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });

          if (!result.canceled) setFile(result.assets[0]);
        },
      },
      { text: t("escalation.cancel"), style: "cancel" },
    ]);
  };

  return (
    <BodyLayout type="screen" screenName={t("escalation.screenTitle")}>

      {/* Warning */}
      <Card
        mode="contained"
        style={[
          styles.warningCard,
          {
            backgroundColor: theme.colors.colorWarning100,
            borderColor: theme.colors.colorWarning100,
          },
        ]}
      >
        <Text style={[theme.typography.fontBody, styles.warningText]}>
          {t("escalation.warningText")}
        </Text>
      </Card>

      {/* Main Card */}
      <Card
        style={[styles.mainCard, { backgroundColor: theme.colors.colorBgPage }]}
      >
        {/* Dropdown Label */}
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
          {t("escalation.chooseReason")}
        </Text>

        {/* Dropdown Trigger */}
        <TouchableOpacity
          onPress={() => {
            setDropdownOpen(!dropdownOpen);
            setFocusField("dropdown");
          }}
          style={[
            styles.dropdown,
            {
              borderColor:
                focusField === "dropdown"
                  ? theme.colors.colorPrimary600
                  : theme.colors.colorOverlay,
            },
          ]}
        >
          <Text
            style={{
              color: selectedReason
                ? theme.colors.colorTextSecondary
                : theme.colors.colorOverlay,
            }}
          >
            {selectedReason || t("escalation.reasonPlaceholder")}
          </Text>

          <RemixIcon
            name={dropdownOpen ? "arrow-up-s-line" : "arrow-down-s-line"}
            size={20}
            color={theme.colors.colorOverlay}
          />
        </TouchableOpacity>

        {/* Dropdown List */}
        {dropdownOpen && (
          <View
            style={[
              styles.dropdownList,
              {
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.colorOverlay,
              },
            ]}
          >
            {reasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedReason(reason);
                  setDropdownOpen(false);
                  setFocusField("");
                }}
                style={[
                  styles.dropdownItem,
                  { borderColor: theme.colors.colorOverlay },
                ]}
              >
                <Text style={{ color: theme.colors.colorTextSecondary }}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Divider style={{ marginVertical: 14 }} />

        {/* Notes */}
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
          {t("escalation.notesLabel")}
        </Text>

        <TextInput
          multiline
          placeholder={t("escalation.notesPlaceholder")}
          placeholderTextColor={theme.colors.colorOverlay}
          value={notes}
          onChangeText={setNotes}
          onFocus={() => setFocusField("notes")}
          onBlur={() => setFocusField("")}
          style={[
            styles.notesBox,
            {
              borderColor:
                focusField === "notes"
                  ? theme.colors.colorPrimary600
                  : theme.colors.colorOverlay,
              backgroundColor: theme.colors.colorBgSurface,
              color: theme.colors.colorTextSecondary,
            },
          ]}
        />

        <Divider style={{ marginVertical: 14 }} />

        {/* Upload */}
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
          {t("escalation.uploadLabel")}
        </Text>

        <TouchableOpacity
          onPress={openUploadPicker}
          style={[
            styles.uploadBox,
            {
              backgroundColor: theme.colors.colorBgSurface,
              borderColor: theme.colors.colorOverlay,
            },
          ]}
        >
          <RemixIcon
            name="upload-2-line"
            size={40}
            color={theme.colors.colorOverlay}
          />
          <Text
            style={[styles.uploadText, { color: theme.colors.colorOverlay }]}
          >
            {file ? t("escalation.fileSelected") : t("escalation.uploadText")}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Submit Button */}
      <ReusableButton
        title={t("escalation.submitEscalation")}
        containerStyle={{
          backgroundColor: isFormValid
            ? theme.colors.colorPrimary600
            : theme.colors.colorOverlay,
        }}
        textStyle={{
          color: isFormValid
            ? theme.colors.btnPrimaryText
            : theme.colors.colorOverlay,
        }}
        disabled={!isFormValid}
        onPress={()=>{
          setShowDeclinedStatusModal(true)
        }}
      />

       <StatusModal
              visible={showDeclinedStatusModal}
              title="Report Submitted"
              iconName="check-line"
              iconColor={theme.colors.colorPrimary600}
              iconBgColor={theme.colors.colorPrimary600 +22}
              autoCloseAfter={2000}
              onClose={() => {
                setShowDeclinedStatusModal(false)
                router.push('/(fro)/(dashboard)')
              }}
              titleColor={theme.colors.colorPrimary600}
            />
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  warningText: {
    color: "#92400E",
    lineHeight: 20,
  },
  mainCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },

  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
  },

  notesBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },

  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: "center",
  },
  uploadText: {
    marginTop: 8,
  },
});
