// app/_layout.tsx

import "@/i18n"; // ⭐ VERY IMPORTANT → load translations first

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { useThemedToastConfig } from "@/components/reusables/ThemedToast";
import { AudioRecorderProvider } from "@/hooks/AudioRecorderProvider";
import { CameraPermissionProvider } from "@/hooks/CameraPermissionProvider";
import { LocationProvider } from "@/hooks/LocationContext";
import { persistor, store } from "@/store";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

// Prevent splash auto hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const toastConfig = useThemedToastConfig();

  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        onBeforeLift={() => SplashScreen.hideAsync()}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <LocationProvider>
              <CameraPermissionProvider>
                <ThemeProvider>
                  <AudioRecorderProvider>
                    <>
                      <ThemedStack />

                      <Toast
                        config={toastConfig}
                        position="bottom"
                        bottomOffset={70}
                      />
                    </>
                  </AudioRecorderProvider>
                </ThemeProvider>
              </CameraPermissionProvider>
            </LocationProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

function ThemedStack() {
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor(theme.colors.btnPrimaryBg);
      RNStatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
    }
  }, [theme, isDarkMode]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(fro)" />
        <Stack.Screen name="(frl)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>

      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        translucent={false}
        backgroundColor={theme.colors.colorAccent500}
      />
    </>
  );
}
