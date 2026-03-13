import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  dateValue: string;
  onDateChange: (text: string) => void;
  statusValue: any;
  onPressStatus: () => void;
  theme: any;
  t: any;
};

const FOSVisitSection = ({
  title,
  dateValue,
  onDateChange,
  statusValue,
  onPressStatus,
  theme,
  t,
}: Props) => {
  return (
    <View style={[styles.container, { borderColor: theme.colors.colorBorder }]}>
      <Text style={[styles.title, { color: theme.colors.colorTextPrimary }]}>
        {title}
      </Text>

      <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
        {t("updateStatus.visitDate")}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.colorBgSurface,
            borderColor: theme.colors.colorBorder,
            color: theme.colors.colorTextPrimary,
          },
        ]}
        value={dateValue}
        onChangeText={onDateChange}
        placeholder="YYYY-MM-DD"
      />

      <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
        {t("updateStatus.visitStatus")}
      </Text>

      <TouchableOpacity
        style={[
          styles.dropdown,
          {
            backgroundColor: theme.colors.colorBgSurface,
            borderColor: theme.colors.colorBorder,
          },
        ]}
        onPress={onPressStatus}
      >
        <Text style={{ color: theme.colors.colorTextPrimary }}>
          {statusValue?.name || t("updateStatus.selectVisitStatus")}
        </Text>

        <Ionicons name="chevron-down" size={18} color="#888" />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(FOSVisitSection);

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});