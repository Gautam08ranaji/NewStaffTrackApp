import type { Theme } from './ThemeContext';
import { typography } from './typography';


export const DarkTheme: Theme = {
  dark: true,
  colors: {
    // 🌑 Core React Navigation Theme Colors
    primary: '#80CBC4',
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    border: '#2C2C2C',
    notification: '#FF8A80',

    // 🌙 Primary Shades
    colorPrimary50: '#00332D',
    colorPrimary100: '#004D43',
    colorPrimary200: '#00695C',
    colorPrimary300: '#00796B',
    colorPrimary400: '#009688',
    colorPrimary500: '#00BFA5',
    colorPrimary600: '#26D3C2',
    colorPrimary700: '#4EF1E0',
    colorPrimary800: '#80FFF3',

    // Accent / SOS
    colorAccent50: '#3B0003',
    colorAccent100: '#5E0B0F',
    colorAccent300: '#B71C1C',
    colorAccent500: '#EF5350',
    colorAccent700: '#FF8A80',
    colorAccent900: '#EF5350',

    // Validation & Functional
    colorSuccess100: '#1B3520',
    colorSuccess400: '#2E7D32',
    colorSuccess600: '#4CAF50',
    colorWarning100: '#3A2E00',
    colorWarning400: '#FFC947',
    colorWarning600: '#FFD54F',
    colorError100: '#370A0C',
    colorError400: '#EF5350',
    colorError600: '#E57373',

    // Neutral / Backgrounds
    colorBgPage: '#121212',
    colorBgSurface: '#1E1E1E',
    colorBgAlt: '#2A2A2A',
    colorBorder: '#424242',
    colorShadow: 'rgba(0,0,0,0.5)',
    colorOverlay: 'rgba(255,255,255,0.15)',

    // Text
    colorTextPrimary: '#FFFFFF',
    colorTextSecondary: '#E0E0E0',
    colorTextTertiary: '#BDBDBD',
    colorTextInverse: '#121212',
    colorLink: '#4DD0E1',
    colorHeadingH1: '#E3F2FD',
    colorHeadingH2: '#BBDEFB',

    // Buttons
    btnPrimaryBg: '#00BFA5',
    btnPrimaryHover: '#1DE9B6',
    btnPrimaryText: '#00251F',
    btnSecondaryBg: '#004D43',
    btnSecondaryBorder: '#00BFA5',
    btnDisabledBg: '#333333',
    btnDisabledText: '#777777',
    btnSosBg: '#FF5252',
    btnSosText: '#FFF5F5',

    // Inputs
    inputBg: '#1E1E1E',
    inputBorder: '#616161',
    inputFocusBorder: '#00E5FF',
    inputPlaceholder: '#AAAAAA',
    inputText: '#E0E0E0',
    inputErrorBorder: '#EF5350',

    // Navigation / System UI
    navBg: '#1E1E1E',
    navActive: '#00BFA5',
    navInactive: '#757575',
    navDivider: '#333333',
    toastBgSuccess: '#2E7D32',
    toastBgError: '#B71C1C',
    toastText: '#FFFFFF',

    // Validation Feedback
    validationSuccessBg: '#1B3520',
    validationSuccessText: '#81C784',
    validationWarningBg: '#3A2E00',
    validationWarningText: '#FFD54F',
    validationErrorBg: '#3B0B0E',
    validationErrorText: '#EF9A9A',
    validationInfoBg: '#0D47A1',
    validationInfoText: '#90CAF9',
  },

  // ✅ Add required fonts (same as DefaultTheme)
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },

  // Optional typography (can be merged dynamically)
  typography,
};
