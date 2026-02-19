import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function AppSettingsScreen() {
  const { theme } = useTheme();

  const [textSize, setTextSize] = useState<"small" | "medium" | "large">(
    "medium"
  );

  const [toggles, setToggles] = useState({
    highContrast: true,
    rtl: false,

    saveDutyLocation: true,
    onDuty: false,
    locationPermission: true,
    cameraPermission: true,
    microphonePermission: true,

    offlineMode: true,
    syncNow: false,

    biometricLogin: false,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles((p) => ({ ...p, [key]: !p[key] }));

  /* ---------- REUSABLE ROWS ---------- */

  const Row = ({ label, value, onToggle }: any) => (
    <View style={[styles.row, { backgroundColor: theme.colors.colorBgAlt ,marginBottom:10}]}>
      <Text style={[styles.rowText, { color: theme.colors.colorTextPrimary }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.colorPrimary600,
        }}
        thumbColor="#fff"
      />
    </View>
  );

  const LinkRow = ({ label }: { label: string }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.row, { backgroundColor: theme.colors.colorBgAlt }]}
    >
      <Text style={[styles.rowText, { color: theme.colors.colorTextPrimary }]}>
        {label}
      </Text>
      <RemixIcon
        name="arrow-right-s-line"
        size={22}
        color={theme.colors.colorTextSecondary}
      />
    </TouchableOpacity>
  );

  const Divider = () => (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.border,
        opacity: 0.5,
      }}
    />
  );

  const Section = ({ title, subtitle, children }: any) => (
    <View
      style={[
        styles.section,
        { backgroundColor: theme.colors.colorBgPage,elevation:2 },
      ]}
    >
      <Text
        style={[styles.sectionTitle, { color: theme.colors.colorTextPrimary }]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {subtitle}
        </Text>
      )}

      <View style={styles.group}>{children}</View>
    </View>
  );

  return (
    <BodyLayout type="screen" screenName="App Settings"
    
    >
    
        {/* LANGUAGE & ACCESSIBILITY */}
        <Section
          title="Language & Accessibility"
          subtitle="Adjust the app for easier use."
        >
          <LinkRow label="App Language" />
          <Divider />

          {/* TEXT SIZE */}
          <View
            style={[
              styles.textSizeContainer,
              { backgroundColor: theme.colors.colorBgAlt },
            ]}
          >
            <View style={styles.textSizeHeader}>
              <View
                style={[
                  styles.textIcon,
                  { backgroundColor: theme.colors.colorPrimary100 },
                ]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.colors.colorPrimary600,
                  }}
                >
                  T
                </Text>
              </View>
              <Text
                style={[
                  styles.rowText,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                Text Size
              </Text>
            </View>

            <View style={styles.textSizeButtons}>
              {(["small", "medium", "large"] as const).map((size) => {
                const active = textSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setTextSize(size)}
                    style={[
                      styles.textSizeBtn,
                      {
                        backgroundColor: active
                          ? theme.colors.colorPrimary600
                          : theme.colors.colorPrimary100,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active
                          ? "#fff"
                          : theme.colors.colorPrimary600,
                        fontWeight: "600",
                      }}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Divider />
          <Row
            label="High Contrast Mode"
            value={toggles.highContrast}
            onToggle={() => toggle("highContrast")}
          />
          <Divider />
          <Row
            label="Right-to-Left Layout"
            value={toggles.rtl}
            onToggle={() => toggle("rtl")}
          />
        </Section>

        {/* LOCATION & DUTY */}
        <Section
          title="Location & Duty Settings"
          subtitle="Manage"
        >
          <LinkRow label="App Language" />
          <Divider />
          <Row
            label="Save Duty Locations"
            value={toggles.saveDutyLocation}
            onToggle={() => toggle("saveDutyLocation")}
          />
          <Divider />
          <Row
            label="On-Duty / Off-Duty Status"
            value={toggles.onDuty}
            onToggle={() => toggle("onDuty")}
          />
          <Divider />
          <Row
            label="Location Permission"
            value={toggles.locationPermission}
            onToggle={() => toggle("locationPermission")}
          />
          <Divider />
          <Row
            label="Camera Permission"
            value={toggles.cameraPermission}
            onToggle={() => toggle("cameraPermission")}
          />
          <Divider />
          <Row
            label="Microphone Permission"
            value={toggles.microphonePermission}
            onToggle={() => toggle("microphonePermission")}
          />
        </Section>

        {/* DATA */}
        <Section
          title="Data & Connectivity"
          subtitle="Control data usage and offline behavior"
        >
          <Row
            label="Offline Mode"
            value={toggles.offlineMode}
            onToggle={() => toggle("offlineMode")}
          />
          <Divider />
          <Row
            label="Sync Data Now"
            value={toggles.syncNow}
            onToggle={() => toggle("syncNow")}
          />
          <Divider />
          <LinkRow label="Clear Cached Data" />
        </Section>

        {/* SECURITY */}
        <Section
          title="Security & Privacy"
          subtitle="Keep your account and data secure"
        >
          <Row
            label="Biometric Login"
            value={toggles.biometricLogin}
            onToggle={() => toggle("biometricLogin")}
          />
          <Divider />
          <LinkRow label="Session History" />
        </Section>

        <View style={{ height: 40 }} />
      
    </BodyLayout>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },

  section: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  sectionSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },

  group: {
    borderRadius: 12,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius:10
  },

  rowText: {
    fontSize: 14,
    flex: 1,
  },

  /* TEXT SIZE */
  textSizeContainer: {
    borderRadius: 12,
    padding: 12,
  },

  textSizeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  textIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  textSizeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  textSizeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
