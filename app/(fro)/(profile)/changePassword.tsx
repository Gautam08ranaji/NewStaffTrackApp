import BodyLayout from "@/components/layout/BodyLayout";
import { changePassword } from "@/features/fro/password/changePassword ";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { showApiError } from "@/utils/showApiError";
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
      newErrors.oldPassword = t("changePassword.errors.oldRequired");
      valid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = t("changePassword.errors.newRequired");
      valid = false;
    } else if (oldPassword === newPassword) {
      newErrors.newPassword = t("changePassword.errors.sameAsOld");
      valid = false;
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword = t("changePassword.errors.passwordRequirements");
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("changePassword.errors.confirmRequired");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("changePassword.errors.passwordMismatch");
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
          t("common.success") || "Success",
          res?.data?.message || t("changePassword.successMessage"),
          [
            {
              text: t("common.ok") || "OK",
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
     showApiError(error, dispatch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyLayout type="screen" screenName={t("changePassword.screenTitle")}>
      <View
        style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.colorBgSurface,
            shadowColor: theme.colors.colorShadow,
          }
        ]}
      >
        {/* OLD PASSWORD */}
        {errors.oldPassword ? (
          <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
            {errors.oldPassword}
          </Text>
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
                  ? theme.colors.inputErrorBorder
                  : theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.inputText,
              },
            ]}
            secureTextEntry={!showOld}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder={t("changePassword.enterOldPassword")}
            placeholderTextColor={theme.colors.inputPlaceholder}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowOld(!showOld)}
          >
            <RemixIcon
              name={showOld ? "eye-line" : "eye-off-line"}
              size={22}
              color={theme.colors.colorTextSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* NEW PASSWORD */}
        {errors.newPassword ? (
          <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
            {errors.newPassword}
          </Text>
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
                  ? theme.colors.inputErrorBorder
                  : theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.inputText,
              },
            ]}
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("changePassword.enterNewPassword")}
            placeholderTextColor={theme.colors.inputPlaceholder}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowNew(!showNew)}
          >
            <RemixIcon
              name={showNew ? "eye-line" : "eye-off-line"}
              size={22}
              color={theme.colors.colorTextSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* CONFIRM PASSWORD */}
        {errors.confirmPassword ? (
          <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
            {errors.confirmPassword}
          </Text>
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
                  ? theme.colors.inputErrorBorder
                  : theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.inputText,
              },
            ]}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("changePassword.enterConfirmPassword")}
            placeholderTextColor={theme.colors.inputPlaceholder}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowConfirm(!showConfirm)}
          >
            <RemixIcon
              name={showConfirm ? "eye-line" : "eye-off-line"}
              size={22}
              color={theme.colors.colorTextSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: loading
                ? theme.colors.btnDisabledBg
                : theme.colors.btnPrimaryBg,
              shadowColor: theme.colors.colorShadow,
            },
          ]}
          disabled={loading}
          onPress={handleChangePassword}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.btnPrimaryText} />
          ) : (
            <Text style={[styles.saveText, { color: theme.colors.btnPrimaryText }]}>
              {t("common.save")}
            </Text>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 15,
    fontFamily: 'Poppins-Medium',
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
});