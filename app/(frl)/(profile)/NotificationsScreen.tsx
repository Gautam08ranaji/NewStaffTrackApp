import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function NotificationsScreen() {
  const { theme } = useTheme();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    sos: true,
    highRisk: true,
    escalated: true,

    newCase: true,
    reassigned: true,
    statusUpdated: true,
    citizenMessage: true,

    leaderMessage: false,
    fieldMessage: true,
    partnerUpdate: true,

    actionRequired: false,
    nearingLimit: true,
    exceeded: true,

    nearby: true,
    shiftStart: false,
    shiftEnd: true,

    systemAnnouncements: true,
    appUpdates: false,
    connectivity: true,

    dailySummary: true,
  });

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const Row = ({ label, value, onToggle }: any) => (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.colorBgAlt,
          marginBottom: 10,
          borderRadius: 10,
          paddingHorizontal: 10,
        },
      ]}
    >
      <Text
        style={[styles.rowText, { color: theme.colors.colorTextPrimary }]}
        numberOfLines={2}
      >
        {label}
      </Text>

      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.colorPrimary600,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
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

  const Section = ({ title, subtitle, danger, children }: any) => (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.colors.colorBgSurface,
          elevation: 2,
        },
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
            {
              color: danger ? "#E53935" : theme.colors.colorTextSecondary,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}

      <View style={styles.group}>{children}</View>
    </View>
  );

  return (
    <BodyLayout type="screen" screenName="Notifications">
      <Section
        title="Critical & Emergency Alerts"
        subtitle="High-priority alerts related to safety & emergencies."
        danger
      >
        <Row
          label="Emergency SOS assigned to me"
          value={toggles.sos}
          onToggle={() => toggle("sos")}
        />
        <Divider />
        <Row
          label="Life-threatening or high-risk Tasks"
          value={toggles.highRisk}
          onToggle={() => toggle("highRisk")}
        />
        <Divider />
        <Row
          label="Emergency case escalated"
          value={toggles.escalated}
          onToggle={() => toggle("escalated")}
        />
      </Section>

      <Section
        title="TaskAssignment & Updates"
        subtitle="Notifications related to Tasks assigned to you."
      >
        <Row
          label="New case assigned"
          value={toggles.newCase}
          onToggle={() => toggle("newCase")}
        />
        <Divider />
        <Row
          label="Taskreassigned or removed"
          value={toggles.reassigned}
          onToggle={() => toggle("reassigned")}
        />
        <Divider />
        <Row
          label="Taskstatus updated"
          value={toggles.statusUpdated}
          onToggle={() => toggle("statusUpdated")}
        />
        <Divider />
        <Row
          label="Citizen added a message or document"
          value={toggles.citizenMessage}
          onToggle={() => toggle("citizenMessage")}
        />
      </Section>

      <Section
        title="Team & Coordination"
        subtitle="Communication and coordination with team members and partners."
      >
        <Row
          label="Message from response leader"
          value={toggles.leaderMessage}
          onToggle={() => toggle("leaderMessage")}
        />
        <Divider />
        <Row
          label="Message from field officer"
          value={toggles.fieldMessage}
          onToggle={() => toggle("fieldMessage")}
        />
        <Divider />
        <Row
          label="Partner or NGO update"
          value={toggles.partnerUpdate}
          onToggle={() => toggle("partnerUpdate")}
        />
      </Section>

      <Section
        title="Action Required & Timelines"
        subtitle="Alerts related to pending actions and response timelines."
      >
        <Row
          label="Action required on a case"
          value={toggles.actionRequired}
          onToggle={() => toggle("actionRequired")}
        />
        <Divider />
        <Row
          label="Response time nearing limit"
          value={toggles.nearingLimit}
          onToggle={() => toggle("nearingLimit")}
        />
        <Divider />
        <Row
          label="Response time exceeded"
          value={toggles.exceeded}
          onToggle={() => toggle("exceeded")}
        />
      </Section>

      <Section
        title="Location & Duty Alerts"
        subtitle="Notifications based on duty status and assigned area."
      >
        <Row
          label="Nearby emergency Tasks"
          value={toggles.nearby}
          onToggle={() => toggle("nearby")}
        />
        <Divider />
        <Row
          label="Duty shift start reminder"
          value={toggles.shiftStart}
          onToggle={() => toggle("shiftStart")}
        />
        <Divider />
        <Row
          label="Duty shift end reminder"
          value={toggles.shiftEnd}
          onToggle={() => toggle("shiftEnd")}
        />
      </Section>

      <Section
        title="System & App Updates"
        subtitle="Important system and application updates."
      >
        <Row
          label="System announcements"
          value={toggles.systemAnnouncements}
          onToggle={() => toggle("systemAnnouncements")}
        />
        <Divider />
        <Row
          label="App updates or maintenance"
          value={toggles.appUpdates}
          onToggle={() => toggle("appUpdates")}
        />
        <Divider />
        <Row
          label="Connectivity or sync issues"
          value={toggles.connectivity}
          onToggle={() => toggle("connectivity")}
        />
      </Section>

      <Section
        title="Daily Summary"
        subtitle="Optional overview of daily work activity."
      >
        <Row
          label="Daily case summary"
          value={toggles.dailySummary}
          onToggle={() => toggle("dailySummary")}
        />
      </Section>

      <View style={{ height: 40 }} />
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },

  section: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  sectionSubtitle: {
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: 10,
  },

  group: {
    borderRadius: 10,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
  },

  rowText: {
    fontSize: 14,
    flex: 1,
    paddingRight: 12,
    lineHeight: 20,
  },
});
