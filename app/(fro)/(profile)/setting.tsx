import BodyLayout from "@/components/layout/BodyLayout";
import { useLocation } from "@/hooks/LocationContext";
import { useTheme } from "@/theme/ThemeContext";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { hasPermission, requestPermission, revokePermission } = useLocation();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState(true);
  const [locationToggle, setLocationToggle] = useState(hasPermission);
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">("medium");

  useEffect(() => {
    setLocationToggle(hasPermission); // sync with context
  }, [hasPermission]);

  const textSizeOptions = [
    { key: "small" as const, label: t("settings.textSizeSmall") },
    { key: "medium" as const, label: t("settings.textSizeMedium") },
    { key: "large" as const, label: t("settings.textSizeLarge") },
  ];

  // 🔥 MAIN LOCATION TOGGLE HANDLER
  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermission();
      setLocationToggle(granted);
    } else {
      revokePermission();
      setLocationToggle(false);

      Alert.alert(
        t("settings.locationAlertTitle"),
        t("settings.locationAlertMessage"),
        [
          { text: t("settings.locationAlertCancel"), style: "cancel" },
          {
            text: t("settings.locationAlertOpenSettings"),
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
    }
  };

  return (
    <BodyLayout type="screen" screenName={t("settings.screenTitle")}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* NOTIFICATION */}
        <View
          style={[
            styles.card, 
            { 
              backgroundColor: theme.colors.colorBgSurface,
              shadowColor: theme.colors.colorShadow,
            }
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={styles.leftRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.colorPrimary50 }]}>
                <RemixIcon
                  name="notification-3-line"
                  size={20}
                  color={theme.colors.colorPrimary600}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {t("settings.notification")}
              </Text>
            </View>

            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{
                true: theme.colors.colorPrimary600,
                false: theme.colors.colorBorder,
              }}
              thumbColor={theme.colors.colorBgSurface}
              ios_backgroundColor={theme.colors.colorBorder}
            />
          </View>
        </View>

        {/* LOCATION PERMISSION */}
        <View
          style={[
            styles.card, 
            { 
              backgroundColor: theme.colors.colorBgSurface,
              shadowColor: theme.colors.colorShadow,
            }
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={styles.leftRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.colorSuccess100 }]}>
                <RemixIcon name="map-pin-line" size={20} color={theme.colors.colorSuccess600} />
              </View>

              <Text
                style={[
                  styles.label,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {t("settings.locationPermission")}
              </Text>
            </View>

            <Switch
              value={locationToggle}
              onValueChange={handleLocationToggle}
              trackColor={{
                true: theme.colors.colorPrimary600,
                false: theme.colors.colorBorder,
              }}
              thumbColor={theme.colors.colorBgSurface}
              ios_backgroundColor={theme.colors.colorBorder}
            />
          </View>
        </View>

        {/* THEME */}
        <View
          style={[
            styles.card, 
            { 
              backgroundColor: theme.colors.colorBgSurface,
              shadowColor: theme.colors.colorShadow,
            }
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={styles.leftRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.colorWarning100 }]}>
                <RemixIcon 
                  name={isDarkMode ? "moon-fill" : "sun-fill"} 
                  size={20} 
                  color={isDarkMode ? theme.colors.colorPrimary600 : theme.colors.colorWarning600} 
                />
              </View>

              <Text
                style={[
                  styles.label,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {t("settings.changeTheme")}
              </Text>
            </View>

            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                true: theme.colors.colorPrimary600,
                false: theme.colors.colorBorder,
              }}
              thumbColor={theme.colors.colorBgSurface}
              ios_backgroundColor={theme.colors.colorBorder}
            />
          </View>
        </View>

        {/* TEXT SIZE */}
        <View
          style={[
            styles.card, 
            { 
              backgroundColor: theme.colors.colorBgSurface,
              shadowColor: theme.colors.colorShadow,
            }
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={styles.leftRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.colorInfoBg || theme.colors.colorPrimary50 }]}>
                <RemixIcon name="text" size={20} color={theme.colors.colorPrimary600} />
              </View>

              <Text
                style={[
                  styles.label,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {t("settings.textSize")}
              </Text>
            </View>
          </View>

          <View style={styles.textSizeRow}>
            {textSizeOptions.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setTextSize(item.key)}
                style={[
                  styles.sizeBox,
                  {
                    backgroundColor:
                      textSize === item.key
                        ? theme.colors.btnPrimaryBg
                        : theme.colors.btnSecondaryBg,
                    borderColor: textSize === item.key 
                      ? theme.colors.btnPrimaryBg 
                      : theme.colors.btnSecondaryBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sizeText,
                    {
                      color:
                        textSize === item.key
                          ? theme.colors.btnPrimaryText
                          : theme.colors.colorTextSecondary,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* HELP */}
        <TouchableOpacity
          style={[
            styles.card, 
            { 
              backgroundColor: theme.colors.colorBgSurface,
              shadowColor: theme.colors.colorShadow,
            }
          ]}
          onPress={() => {
            // Handle help/support navigation
            console.log("Help & Support pressed");
          }}
          activeOpacity={0.7}
        >
          <View style={styles.leftRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.colorError100 }]}>
              <RemixIcon name="question-line" size={20} color={theme.colors.colorError600} />
            </View>

            <Text
              style={[
                styles.label,
                { color: theme.colors.colorTextPrimary, flex: 1 },
              ]}
            >
              {t("settings.helpSupport")}
            </Text>

            <RemixIcon 
              name="arrow-right-s-line" 
              size={20} 
              color={theme.colors.colorTextTertiary} 
            />
          </View>
        </TouchableOpacity>
      </View>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    gap: 16,
  },
  card: { 
    padding: 16, 
    borderRadius: 12, 
    elevation: 2, 
    gap: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  label: { 
    fontSize: 16, 
    fontWeight: "600",
    fontFamily: 'Poppins-Medium',
  },
  textSizeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginLeft: 48,
  },
  sizeBox: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  sizeText: {
    fontWeight: "600",
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
});