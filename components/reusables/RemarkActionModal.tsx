import { useTheme } from "@/theme/ThemeContext";
import React, { ReactNode, useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";

interface RemarkActionModalProps {
  visible: boolean;

  title?: string | ReactNode;
  subtitle?: string | ReactNode;

  titleColor?: string;
  subtitleColor?: string;

  placeholder?: string;
  placeholderTextColor?: string;

  buttonText?: string;
  buttonTextColor?: string;
  buttonIconName?: IconName;
  buttonIconColor?: string;

  onClose: () => void;
  onSubmit: (remark: string) => void;

  stylesOverride?: {
    modalContainer?: any;
    card?: any;
    title?: any;
    subtitle?: any;
    input?: any;
    button?: any;
    buttonText?: any;
  };
}

export default function RemarkActionModal({
  visible,
  title = "Reason for Marking as Incorrect",
  subtitle = "Provide details to help us understand what is wrong.",

  titleColor,
  subtitleColor,

  placeholder = "Explain in Detail...",
  placeholderTextColor,

  buttonText = "Close Case",
  buttonTextColor,
  buttonIconName = "close-circle-line",
  buttonIconColor,

  onClose,
  onSubmit,
  stylesOverride = {},
}: RemarkActionModalProps) {
  const { theme } = useTheme();
  const [remark, setRemark] = useState("");

  const handleSubmit = () => {
    onSubmit(remark);
    setRemark("");
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.modalContainer, stylesOverride.modalContainer]}>
        <View
          style={[
            styles.card,
            stylesOverride.card,
            { backgroundColor: theme.colors.colorBgPage },
          ]}
        >
          {/* ---------- TITLE / SUBTITLE ---------- */}
          {(title || subtitle) && (
            <View style={styles.titleBox}>
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

              {subtitle && (
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.subtitle,
                    stylesOverride.subtitle,
                    {
                      color: subtitleColor ?? theme.colors.colorTextSecondary,
                    },
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* ---------- INPUT ---------- */}
          <TextInput
            multiline
            value={remark}
            onChangeText={setRemark}
            placeholder={placeholder}
            placeholderTextColor={
              placeholderTextColor ?? theme.colors.colorOverlay
            }
            style={[
              styles.input,
              stylesOverride.input,
              {
                borderColor: theme.colors.inputBorder,
                color: theme.colors.colorTextSecondary,
              },
            ]}
          />

          {/* ---------- BUTTON ---------- */}
          <TouchableOpacity
            style={[
              styles.button,
              stylesOverride.button,
              { backgroundColor: theme.colors.colorAccent500 },
            ]}
            onPress={handleSubmit}
          >
            {buttonIconName && (
              <RemixIcon
                name={buttonIconName}
                size={18}
                color={buttonIconColor ?? theme.colors.colorBgPage}
              />
            )}

            <Text
              style={[
                styles.buttonText,
                stylesOverride.buttonText,
                {
                  color: buttonTextColor ?? theme.colors.colorBgPage,
                },
              ]}
            >
              {buttonText}
            </Text>
          </TouchableOpacity>

          {/* ---------- CLOSE OVERLAY ---------- */}
          <TouchableOpacity style={styles.closeOverlay} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "88%",
    borderRadius: 14,
    padding: 16,
  },
  titleBox: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    textAlign: "center",
  },
  input: {
    height: 140,
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  closeOverlay: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 40,
    height: 40,
  },
});
