import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme as NavigationTheme } from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DefaultTheme } from './Colors';
import { DarkTheme } from './DarkTheme';
import type { Typography } from './typography';

/**
 * 🧩 Sahara Extended Color Tokens
 */
export type SaharaColors = NavigationTheme['colors'] & {
  // 🌿 Primary Palette
  colorPrimary50: string;
  colorPrimary100: string;
  colorPrimary200: string;
  colorPrimary300: string;
  colorPrimary400: string;
  colorPrimary500: string;
  colorPrimary600: string;
  colorPrimary700: string;
  colorPrimary800: string;

  // 💠 Accent Palette
  colorAccent50: string;
  colorAccent100: string;
  colorAccent300: string;
  colorAccent500: string;
  colorAccent700: string;
  colorAccent900: string;

  // ✅ Status Colors
  colorSuccess100: string;
  colorSuccess400: string;
  colorSuccess600: string;
  colorWarning100: string;
  colorWarning400: string;
  colorWarning600: string;
  colorError100: string;
  colorError400: string;
  colorError600: string;

  // 🎨 Backgrounds & Borders
  colorBgPage: string;
  colorBgSurface: string;
  colorBgAlt: string;
  colorBorder: string;
  colorShadow: string;
  colorOverlay: string;

  // 📝 Text Colors
  colorTextPrimary: string;
  colorTextSecondary: string;
  colorTextTertiary: string;
  colorTextInverse: string;
  colorLink: string;
  colorHeadingH1: string;
  colorHeadingH2: string;

  // 🔘 Buttons
  btnPrimaryBg: string;
  btnPrimaryHover: string;
  btnPrimaryText: string;
  btnSecondaryBg: string;
  btnSecondaryBorder: string;
  btnDisabledBg: string;
  btnDisabledText: string;
  btnSosBg: string;
  btnSosText: string;

  // 🔤 Inputs
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputPlaceholder: string;
  inputText: string;
  inputErrorBorder: string;

  // 🧭 Navigation
  navBg: string;
  navActive: string;
  navInactive: string;
  navDivider: string;

  // 🔔 Toasts
  toastBgSuccess: string;
  toastBgError: string;
  toastText: string;

  // ✅ Validation Messages
  validationSuccessBg: string;
  validationSuccessText: string;
  validationWarningBg: string;
  validationWarningText: string;
  validationErrorBg: string;
  validationErrorText: string;
  validationInfoBg: string;
  validationInfoText: string;
};

/**
 * 🧠 Extended Sahara Theme Type
 */
export type Theme = NavigationTheme & {
  colors: SaharaColors;
  typography: Typography;
};

/**
 * 🌗 Context Type
 */
type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

/**
 * 🟢 Create Context
 */
const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

/**
 * 🌍 Theme Provider Component
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved preference
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('theme');
        if (saved === 'dark') setIsDarkMode(true);
      } catch (e) {
        console.warn('Error loading theme preference', e);
      }
    })();
  }, []);

  // Toggle and persist
  const toggleTheme = async () => {
    try {
      const next = !isDarkMode;
      setIsDarkMode(next);
      await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
    } catch (e) {
      console.warn('Error toggling theme', e);
    }
  };

  // Select correct theme
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  // ✅ Explicit JSX return
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 🧩 Custom Hook to use Theme anywhere
 */
export const useTheme = () => useContext(ThemeContext);
