import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function LocationDetailsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const stateList = [
    { label: t("locationDetails.states.up"), value: "UP" },
    { label: t("locationDetails.states.br"), value: "BR" },
    { label: t("locationDetails.states.rj"), value: "RJ" },
  ];

  const districtList = [
    { label: t("locationDetails.districts.lucknow"), value: "lucknow" },
    { label: t("locationDetails.districts.kanpur"), value: "kanpur" },
    { label: t("locationDetails.districts.varanasi"), value: "varanasi" },
  ];

  const [state, setState] = useState("UP");
  const [district, setDistrict] = useState("lucknow");
  const [block, setBlock] = useState("");
  const [name, setName] = useState(t("locationDetails.defaultName"));

  return (
    <BodyLayout
      type={"screen"}
      screenName={t("locationDetails.screenTitle")}
    >
      <View
        style={[styles.card, { backgroundColor: theme.colors.colorBgPage }]}
      >
        {/* ---------- State ---------- */}
        <Text
          style={[styles.label, { color: theme.colors.colorTextSecondary }]}
        >
          {t("locationDetails.state")}
        </Text>
        <Dropdown
          style={[styles.dropdown, { borderColor: theme.colors.inputBorder }]}
          selectedTextStyle={[
            styles.dropdownText,
            { color: theme.colors.colorTextSecondary },
          ]}
          placeholderStyle={[
            styles.dropdownText,
            { color: theme.colors.colorTextSecondary },
          ]}
          data={stateList}
          labelField="label"
          valueField="value"
          value={state}
          onChange={(item) => setState(item.value)}
        />

        {/* ---------- District ---------- */}
        <Text
          style={[styles.label, { color: theme.colors.colorTextSecondary }]}
        >
          {t("locationDetails.district")}
        </Text>
        <Dropdown
          style={[styles.dropdown, { borderColor: theme.colors.inputBorder }]}
          selectedTextStyle={[
            styles.dropdownText,
            { color: theme.colors.colorTextSecondary },
          ]}
          placeholderStyle={[
            styles.dropdownText,
            { color: theme.colors.colorTextSecondary },
          ]}
          data={districtList}
          labelField="label"
          valueField="value"
          value={district}
          onChange={(item) => setDistrict(item.value)}
        />

        {/* ---------- Block ---------- */}
        <Text
          style={[styles.label, { color: theme.colors.colorTextSecondary }]}
        >
          {t("locationDetails.block")}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.colors.inputBorder,
              color: theme.colors.colorTextSecondary,
            },
          ]}
          placeholder={t("locationDetails.blockPlaceholder")}
          value={block}
          onChangeText={setBlock}
          placeholderTextColor={theme.colors.colorTextSecondary}
        />

        {/* ---------- Team Lead Name ---------- */}
        <Text
          style={[styles.label, { color: theme.colors.colorTextSecondary }]}
        >
          {t("locationDetails.teamLeadName")}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.colors.inputBorder,
              color: theme.colors.colorTextSecondary,
            },
          ]}
          placeholder={t("locationDetails.teamLeadPlaceholder")}
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme.colors.colorTextSecondary}
        />

        {/* ---------- Save Button ---------- */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: theme.colors.colorPrimary600 },
          ]}
        >
          <Text style={[styles.saveText, { color: theme.colors.colorBgPage }]}>
            {t("locationDetails.save")}
          </Text>
        </TouchableOpacity>
      </View>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 15,
  },

  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: "center",
  },

  dropdownText: {
    fontSize: 14,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
  },

  saveBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
  },

  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
