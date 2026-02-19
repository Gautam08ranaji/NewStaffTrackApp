import { useTheme } from "@/theme/ThemeContext";
import React, { ReactNode, useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";

interface StatusModalProps {
  visible: boolean;

  iconName?: IconName;
  iconSize?: number;
  iconColor?: string;
  iconBgColor?: string;

  title?: string | ReactNode;
  description?: string | ReactNode;

  titleColor?: string;
  descriptionColor?: string;

  autoCloseAfter?: number; // ms
  onClose?: () => void;

  stylesOverride?: {
    overlay?: any;
    card?: any;
    iconWrapper?: any;
    title?: any;
    description?: any;
  };
}

export default function StatusModal({
  visible,

  iconName = "check-line",
  iconSize = 36,
  iconColor,
  iconBgColor,

  title = "Case Accepted",
  description,

  titleColor,
  descriptionColor,

  autoCloseAfter,
  onClose,

  stylesOverride = {},
}: StatusModalProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!visible || !autoCloseAfter) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, autoCloseAfter);

    return () => clearTimeout(timer);
  }, [visible, autoCloseAfter]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, stylesOverride.overlay]}>
        <View
          style={[
            styles.card,
            stylesOverride.card,
            { backgroundColor: theme.colors.colorBgPage },
          ]}
        >
          {/* ---------- ICON ---------- */}
          <View
            style={[
              styles.iconWrapper,
              stylesOverride.iconWrapper,
              {
                backgroundColor: iconBgColor ?? theme.colors.colorPrimary100,
              },
            ]}
          >
            <RemixIcon
              name={iconName}
              size={iconSize}
              color={iconColor ?? theme.colors.colorPrimary600}
            />
          </View>

          {/* ---------- TITLE ---------- */}
          {title && (
            <Text
              style={[
                theme.typography.fontH5,
                styles.title,
                stylesOverride.title,
                {
                  color: titleColor ?? theme.colors.colorPrimary600,
                },
              ]}
            >
              {title}
            </Text>
          )}

          {/* ---------- DESCRIPTION ---------- */}
          {description && (
            <Text
              style={[
                theme.typography.fontBodySmall,
                styles.description,
                stylesOverride.description,
                {
                  color: descriptionColor ?? theme.colors.colorTextSecondary,
                },
              ]}
            >
              {description}
            </Text>
          )}

          {/* ---------- TAP TO CLOSE ---------- */}
          {onClose && (
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    marginTop: 6,
    textAlign: "center",
  },
});
