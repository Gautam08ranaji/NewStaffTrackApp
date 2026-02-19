import { useTheme } from "@/theme/ThemeContext";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

interface CaseDetailItem {
  label: string;
  value: string;
  valueColor?: string;
}

interface NewCasePopupModalProps {
  visible: boolean;

  title?: string;
  message?: string;

  timerSeconds?: number;
  urgentLabel?: string;

  name: string;
  age?: number | string;

  details: CaseDetailItem[];

  onAccept: () => void;
  onDeny: () => void;
  onTimeout?: () => void;

  stylesOverride?: {
    container?: any;
    card?: any;
    title?: any;
    message?: any;
    timer?: any;
    name?: any;
    detailLabel?: any;
    detailValue?: any;
    acceptButton?: any;
    denyButton?: any;
  };
}

export default function NewCasePopupModal({
  visible,
  title = "New Case",
  message = "You’ve been assigned a new case near you.\nPlease review and approve or decline within",
  timerSeconds = 30,
  urgentLabel = "Urgent",

  name,
  age,
  details,

  onAccept,
  onDeny,
  onTimeout,

  stylesOverride = {},
}: NewCasePopupModalProps) {
  const { theme } = useTheme();
  const [secondsLeft, setSecondsLeft] = useState(timerSeconds);

  useEffect(() => {
    if (!visible) return;

    setSecondsLeft(timerSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, timerSeconds]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.colorBgPage },
            stylesOverride.card,
          ]}
        >
          {/* ---------- HEADER ---------- */}
          <Text
            style={[
              theme.typography.fontH1,
              styles.title,
              { color: theme.colors.colorPrimary600 },
              stylesOverride.title,
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              theme.typography.fontBody,
              styles.message,
              { color: theme.colors.colorTextSecondary },
              stylesOverride.message,
            ]}
          >
            {message}
          </Text>

          <Text
            style={[
              theme.typography.fontH5,
              styles.timer,
              { color: theme.colors.colorError400 },
              stylesOverride.timer,
            ]}
          >
            {secondsLeft} seconds
          </Text>

          {/* ---------- CASE CARD ---------- */}
          <View
            style={[styles.caseCard, { borderColor: theme.colors.inputBorder }]}
          >
            <View style={styles.caseHeader}>
              <Text
                style={[
                  theme.typography.fontH5,
                  stylesOverride.name,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {name}
              </Text>

              {urgentLabel && (
                <View
                  style={[
                    styles.urgentBadge,
                    { backgroundColor: theme.colors.colorPrimary500 },
                  ]}
                >
                  <Text style={styles.urgentText}>{urgentLabel}</Text>
                </View>
              )}
            </View>

            {age !== undefined && (
              <Text style={{ color: theme.colors.colorTextSecondary }}>
                Age: {age}
              </Text>
            )}

            {details.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    stylesOverride.detailLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    stylesOverride.detailValue,
                    {
                      color: item.valueColor ?? theme.colors.colorPrimary600,
                    },
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* ---------- ACTIONS ---------- */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.denyButton,
                stylesOverride.denyButton,
                { borderColor: theme.colors.colorError400 },
              ]}
              onPress={onDeny}
            >
              <RemixIcon
                name="close-circle-line"
                size={18}
                color={theme.colors.colorError400}
              />
              <Text style={{ color: theme.colors.colorError400 }}>Deny</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                stylesOverride.acceptButton,
                { backgroundColor: theme.colors.colorPrimary600 },
              ]}
              onPress={onAccept}
            >
              <RemixIcon
                name="checkbox-circle-line"
                size={18}
                color={theme.colors.colorBgPage}
              />
              <Text style={{ color: "#fff" }}>Accept</Text>
            </TouchableOpacity>
          </View>
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
    width: "90%",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
  },
  message: {
    textAlign: "center",
    marginTop: 8,
  },
  timer: {
    textAlign: "center",
    marginVertical: 8,
    fontWeight: "700",
  },
  caseCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  urgentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  denyButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
});
