import { useLoginMutation } from "@/features/auth/authApi";
import { setAuth } from "@/features/auth/authSlice";
import { fetchAntiForgeryToken } from "@/features/security/antiForgeryService";
import { setAntiForgeryToken } from "@/features/security/antiForgerySlice";
import { useLocation } from "@/hooks/LocationContext";
import { useAppDispatch } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import { SafeAreaView } from "react-native-safe-area-context";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX =
  /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{7,}$/;

console.log("LOGIN SCREEN LOADED");

export default function LoginScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { location } = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { hasPermission, fetchLocation, address } = useLocation();

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loadAntiForgeryToken = async (bearerToken: string) => {
    try {
      const res = await fetchAntiForgeryToken(bearerToken);

      dispatch(setAntiForgeryToken(res.token));

      return res; // ✅ IMPORTANT
    } catch (e) {
      console.log("❌ Anti-forgery fetch failed", e);
      throw e;
    }
  };

  const validate = () => {
    let valid = true;
    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError(t("login.errors.invalidEmail"));
      valid = false;
    } else {
      setEmailError("");
    }

    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError(t("login.errors.invalidPassword"));
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async () => {
    if (isLoading) return;
    if (!validate()) return;

    try {
      const res = await login({
        userName: email.trim(),
        password,
        latitude: location?.coords.latitude.toString() || "",
        longitude: location?.coords?.longitude.toString() || "",
      }).unwrap();

      if (!res.success || !res.data) {
        Alert.alert(
          t("login.errorTitle"),
          res.errors?.[0] ?? t("login.errors.loginFailed"),
        );
        return;
      }
      const user = res.data;
      console.log("login res", res);

      console.log("login res", res?.data?.userRoles[0]);

      const role = user.userType == "FRO" ? "FRO" : "FRL";

      console.log("role", role);

      const antiRes = await loadAntiForgeryToken(user.bearerToken);

      // 3️⃣ STORE AUTH + ANTIFORGERY TOGETHER ✅
      dispatch(
        setAuth({
          id: user.id,
          bearerToken: user.bearerToken,
          role,
          antiforgeryToken: antiRes.token,
        }),
      );

      console.log("role", res);

      // 4️⃣ NAVIGATE
      router.replace(
        role === "FRO" ? "/(fro)/(dashboard)" : "/(frl)/(dashboard)",
      );
    } catch (err: any) {
      Alert.alert(
        t("login.errorTitle"),
        err?.data?.errors?.[0] ?? t("login.errors.generic"),
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.iconWrapper}>
          <RemixIcon
            name="contract-right-line"
            size={28}
            color={theme.colors.btnPrimaryBg}
          />
        </View>

        <Text
          style={[
            theme.typography.fontH1,
            styles.title,
            { color: theme.colors.primary },
          ]}
        >
          {t("login.title")}
        </Text>

        <Text
          style={[
            theme.typography.fontBodySmall,
            styles.subtitle,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {t("login.subtitle")}
        </Text>

        {/* EMAIL */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t("login.email")}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                borderColor: emailError
                  ? theme.colors.colorError400
                  : theme.colors.border,
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
              },
            ]}
            placeholder="example@email.com"
            placeholderTextColor={theme.colors.inputPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => setEmail(t.trimStart())}
          />
          {emailError ? (
            <Text
              style={[styles.errorText, { color: theme.colors.colorError400 }]}
            >
              {emailError}
            </Text>
          ) : null}
        </View>

        {/* PASSWORD */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t("login.password")}
          </Text>

          <View
            style={[
              styles.passwordContainer,
              {
                borderColor: passwordError
                  ? theme.colors.colorError400
                  : theme.colors.border,
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: theme.colors.text }]}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.inputPlaceholder}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => setPassword(t.replace(/\s/g, ""))}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <RemixIcon
                name={showPassword ? "eye-off-line" : "eye-line"}
                size={20}
                color={theme.colors.colorTextSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text
              style={[styles.errorText, { color: theme.colors.colorError400 }]}
            >
              {passwordError}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.forgotWrapper}>
          <Text style={{ color: theme.colors.primary }}>
            {t("login.forgotPassword")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.btnPrimaryBg,
              opacity: isLoading ? 0.85 : 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.btnPrimaryText}
            />
          ) : (
            <Text
              style={[
                styles.buttonText,
                { color: theme.colors.btnPrimaryText },
              ]}
            >
              {t("login.login")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20 },

  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#E5F4EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: { marginTop: 10 },
  subtitle: { marginTop: 10 },

  inputWrapper: { marginTop: 30 },
  label: { marginBottom: 8 },

  input: {
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },

  forgotWrapper: {
    alignSelf: "flex-end",
    marginTop: 15,
  },

  button: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 35,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
});
