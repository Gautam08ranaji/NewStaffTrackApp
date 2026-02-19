import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { MotiImage, MotiText, MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);
  const authState = useAppSelector((state) => state.auth);
  const antiforgeryToken = useAppSelector(
    (state: RootState) => state.antiForgery.antiforgeryToken,
  );

  // console.log("REDUX AUTH STATE 👉", authState);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
      } finally {
        setAppReady(true);
      }
    };
    prepare();
  }, []);

  const onLayout = useCallback(async () => {
    if (appReady) {
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 100);

      setTimeout(() => {
        router.push("/(onboarding)/languageSelect");
      }, 2500);
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      onLayout={onLayout}
    >
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}
        style={{ alignItems: "center" }}
      >
        {/* Animated Logo */}
        <MotiImage
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 1000 }}
          source={require("../../assets/images/welcomeAppIcon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Animated Titles */}
        <MotiText
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, duration: 800 }}
          style={[
            theme.typography.fontH1,
            {
              color: theme.colors.colorSuccess600,
              textAlign: "center",
              marginBottom: 6,
            },
          ]}
        >
          {"National Senior Citizen"}
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 700, duration: 800 }}
          style={[
            theme.typography.fontH5,
            {
              color: theme.colors.colorSuccess600,
              textAlign: "center",
            },
          ]}
        >
          {"Help Desk"}
        </MotiText>
      </MotiView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 140, height: 140, marginBottom: 30 },
});
