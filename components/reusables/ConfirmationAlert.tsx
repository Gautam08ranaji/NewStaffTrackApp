import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { IconName } from "react-native-remix-icon";
import RemixIcon from "react-native-remix-icon";

interface Props {
  visible: boolean;
  icon?: IconName;
  title: string;
  description?: string;

  confirmText: string;
  cancelText: string;

  onConfirm: () => void;
  onCancel: () => void;

  confirmColor?: string; // optional override
  cancelColor?: string;
  subtitleColor?: string;
}

export default function ConfirmationAlert({
  visible,
  icon,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmColor,
  cancelColor,
  subtitleColor,
}: Props) {
  const { theme } = useTheme();

  // Default colors from theme if not passed
  const finalConfirmColor = confirmColor || theme.colors.btnSosBg;
  const finalCancelColor = cancelColor || theme.colors.colorBgPage;
  const finalDescriptionColor = subtitleColor || theme.colors.btnSosBg;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.colorBgSurface,
              borderWidth: 2,
              borderColor: finalConfirmColor,
            },
          ]}
        >
          {/* Icon */}
          {icon && (
            <RemixIcon name={icon} size={40} color={finalConfirmColor} />
          )}

          {/* Title */}
          <Text
            style={[
              styles.title,
              theme.typography.fontH5,
              { color: finalConfirmColor },
            ]}
          >
            {title}
          </Text>

          {/* Description */}
          {description && (
            <Text
              style={[
                styles.description,
                theme.typography.fontBody,
                { color: finalDescriptionColor },
              ]}
            >
              {description}
            </Text>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={onConfirm}
            style={[styles.confirmBtn, { backgroundColor: finalConfirmColor }]}
          >
            <Text
              style={[
                styles.confirmText,
                theme.typography.fontH5,
                { color: theme.colors.btnSosText },
              ]}
            >
              {confirmText}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onCancel}
            style={[
              styles.cancelBtn,
              {
                backgroundColor: finalCancelColor,
                borderColor: finalConfirmColor,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.cancelText,
                theme.typography.fontBody,
                { color: finalConfirmColor },
              ]}
            >
              {cancelText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "80%",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 8,
  },

  title: {
    marginTop: 10,
    textAlign: "center",
  },

  description: {
    textAlign: "center",
    marginVertical: 10,
  },

  confirmBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  confirmText: {
    textAlign: "center",
    fontWeight: "700",
  },

  cancelBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },

  cancelText: {
    textAlign: "center",
    fontWeight: "600",
  },
});
