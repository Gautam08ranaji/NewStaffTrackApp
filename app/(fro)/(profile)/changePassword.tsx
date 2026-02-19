import BodyLayout from "@/components/layout/BodyLayout";
import { changePassword } from "@/features/fro/password/changePassword ";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const authState = useAppSelector((state) => state.auth);
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validate = () => {
    let valid = true;
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!oldPassword) {
      newErrors.oldPassword = "Old password is required";
      valid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (oldPassword === newPassword) {
      newErrors.newPassword = "New password cannot be same as old password";
      valid = false;
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters, include 1 uppercase, 1 number and 1 special character";
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      valid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await changePassword({
        userId: String(authState.userId),
        oldPassword,
        newPassword,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      // ✅ Dynamic success message from API
      if (res?.success) {
        Alert.alert(
          "Success",
          res?.data?.message || "Password changed successfully",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack(); // ⬅️ Navigate back after success
              },
            },
          ],
          { cancelable: false },
        );

        // Optional: clear fields
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Change password failed", error);
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyLayout type="screen" screenName={t("changePassword.screenTitle")}>
      <View
        style={[styles.card, { backgroundColor: theme.colors.colorBgPage }]}
      >
        {/* OLD PASSWORD */}
        {errors.oldPassword ? (
          <Text style={styles.errorText}>{errors.oldPassword}</Text>
        ) : null}
        <Text
          style={[styles.label, { color: theme.colors.colorTextSecondary }]}
        >
          {t("changePassword.oldPassword")}
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: errors.oldPassword
                  ? "#ff4d4f"
                  : theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.colorTextSecondary,
              },
            ]}
            secureTextEntry={!showOld}
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowOld(!showOld)}
          >
            <RemixIcon
              name={showOld ? "eye-line" : "eye-off-line"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* NEW PASSWORD */}
        {errors.newPassword ? (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        ) : null}
        <Text
          style={[styles.label, { color: theme.colors.colorTextSecondary }]}
        >
          {t("changePassword.newPassword")}
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: errors.newPassword
                  ? "#ff4d4f"
                  : theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.colorTextSecondary,
              },
            ]}
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowNew(!showNew)}
          >
            <RemixIcon
              name={showNew ? "eye-line" : "eye-off-line"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* CONFIRM PASSWORD */}
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}
        <Text
          style={[styles.label, { color: theme.colors.colorTextSecondary }]}
        >
          {t("changePassword.confirmPassword")}
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: errors.confirmPassword
                  ? "#ff4d4f"
                  : theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.colorTextSecondary,
              },
            ]}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowConfirm(!showConfirm)}
          >
            <RemixIcon
              name={showConfirm ? "eye-line" : "eye-off-line"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: loading
                ? theme.colors.colorPrimary300
                : theme.colors.colorPrimary600,
            },
          ]}
          disabled={loading}
          onPress={handleChangePassword}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>{t("changePassword.save")}</Text>
          )}
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 8,
  },
});
