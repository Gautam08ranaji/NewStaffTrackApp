// components/ReusableButton.tsx

import { useTheme } from "@/theme/ThemeContext";
import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ButtonItem {
  title?: string;
  route?: Href;
  onPress?: () => void;
  containerStyle?: any;
  textStyle?: any;
  disabled?: boolean;         // ✅ Added
}

interface ReusableButtonProps {
  title?: string;
  route?: Href;
  onPress?: () => void;
  containerStyle?: any;
  textStyle?: any;

  buttons?: [ButtonItem, ButtonItem];
  type?: "single" | "double";

  disabled?: boolean;         // ✅ Added
}

const ReusableButton: React.FC<ReusableButtonProps> = ({
  title,
  route,
  onPress,
  containerStyle,
  textStyle,
  buttons,
  type = "single",
  disabled = false,           // ✅ Added
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handlePress = (btn: ButtonItem) => {
    if (btn.disabled) return; // prevent press when disabled
    if (btn.route) router.push(btn.route);
    if (btn.onPress) btn.onPress();
  };

  /** ---------------------------------------------------------
   * 🟦 SINGLE BUTTON
   * ---------------------------------------------------------*/
  if (type === "single") {
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={() => handlePress({ route, onPress, disabled })}
        style={[
          styles.button,
          { backgroundColor: theme.colors.btnPrimaryBg },
          containerStyle,
          disabled && { opacity: 0.5 }, // 🔥 disabled style
        ]}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.text,
            theme.typography.fontButtonLarge,
            { color: theme.colors.btnPrimaryText },
            textStyle,
          ]}
        >
          {t(title ?? "")}
        </Text>
      </TouchableOpacity>
    );
  }

  /** ---------------------------------------------------------
   * 🟩 DOUBLE BUTTON MODE
   * ---------------------------------------------------------*/
  return (
    <View style={styles.row}>
      {buttons?.map((btn, index) => (
        <TouchableOpacity
          key={index}
          disabled={btn.disabled}
          onPress={() => handlePress(btn)}
          style={[
            styles.button,
            { backgroundColor: theme.colors.btnPrimaryBg },
            btn.containerStyle,
            btn.disabled && { opacity: 0.5 }, // 🔥 disabled
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.text,
              theme.typography.fontButtonLarge,
              { color: theme.colors.btnPrimaryText },
              btn.textStyle,
            ]}
          >
            {t(btn.title ?? "")}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ReusableButton;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 15,
    marginTop: 0,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 3,
  },
  text: {
    textAlign: "center",
  },
});
