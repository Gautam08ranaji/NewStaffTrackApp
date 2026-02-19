import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export function useThemedToastConfig() {
  const { theme } = useTheme();

  return {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.colors.colorAccent500,
          backgroundColor: theme.colors.colorBgSurface,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        text1Style={{
          color: theme.colors.colorTextPrimary,
          fontWeight: "700",
        }}
        text2Style={{
          color: theme.colors.colorTextSecondary,
        }}
      />
    ),

    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.colors.colorAccent500,
          backgroundColor: theme.colors.colorBgSurface,
        }}
        text1Style={{
          color: theme.colors.colorTextPrimary,
          fontWeight: "700",
        }}
        text2Style={{
          color: theme.colors.colorTextSecondary,
        }}
      />
    ),

    info: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.colors.colorAccent500,
          backgroundColor: theme.colors.colorBgSurface,
        }}
        text1Style={{
          color: theme.colors.colorTextPrimary,
          fontWeight: "700",
        }}
        text2Style={{
          color: theme.colors.colorTextSecondary,
        }}
      />
    ),
  };
}
