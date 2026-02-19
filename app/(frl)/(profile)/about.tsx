import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export default function AboutScreen() {
  const { theme } = useTheme();
  const [feedback, setFeedback] = useState("");

  const Divider = () => (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 16,
      }}
    />
  );

  const Bullet = ({ title, desc }: { title: string; desc: string }) => (
    <View style={styles.bulletContainer}>
      <Text style={[styles.bulletDot, { color: theme.colors.colorPrimary600 }]}>
        •
      </Text>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.bulletTitle,
            { color: theme.colors.colorPrimary600 },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.bulletDesc,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {desc}
        </Text>
      </View>
    </View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text
      style={[
        styles.sectionTitle,
        { color: theme.colors.colorPrimary600 },
      ]}
    >
      {title}
    </Text>
  );

  return (
    <BodyLayout type="screen" screenName="About">
  
        {/* INTRO */}
        <Text
          style={[
            styles.pageTitle,
            { color: theme.colors.colorPrimary600 },
          ]}
        >
          About
        </Text>

        <Text
          style={[
            styles.pageSubtitle,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          Get assistance with using this app, troubleshooting issues, and
          understanding the services available to you.
        </Text>

        <Divider />

        {/* FAQ */}
        <SectionTitle title="Frequently Asked Questions (FAQs)" />
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          Find quick answers to common questions
        </Text>

        <Bullet
          title="How do I use the SOS button?"
          desc="Simply tap the SOS button on any screen, confirm if it’s a real emergency, and the app will notify a field officer to assist you. You can also view the officer’s estimated time of arrival."
        />

        <Bullet
          title="How can I register a complaint?"
          desc="Go to the Complaints tab, select the issue type, provide a brief description, and submit. You can track the progress and receive updates."
        />

        <Bullet
          title='What happens when I press the "Emergency" button by mistake?'
          desc="If you accidentally tap the SOS button, you’ll be asked to confirm if it’s a real emergency. If it’s a mistake, simply cancel and no further action will be taken."
        />

        <Bullet
          title="What do I do if I don't get an immediate response?"
          desc="If you don’t receive a response within the expected time, please contact the help center or check the Status tab for case updates."
        />

        <Divider />

        {/* CONTACT SUPPORT */}
        <SectionTitle title="Contact Support" />

        <Bullet
          title="Call Support"
          desc="You can reach our 24/7 support helpline at 14567. Our team is ready to assist you with any urgent or non-urgent queries."
        />

        <Bullet
          title="Chat with Support"
          desc="If you prefer to chat, use the Chat feature in the app to get instant help from our support team."
        />

        <Bullet
          title="Email Support"
          desc="For non-urgent queries, you can email us at support@sasathi.com. We aim to respond within 24 hours."
        />

        <Divider />

        {/* TECH ISSUES */}
        <SectionTitle title="Reporting Technical Issues" />

        <Bullet
          title="Submit a Bug Report"
          desc="If you encounter any issues while using the app (e.g., crashes, slow performance), please go to Settings > Report a Bug, fill in the details, and submit."
        />

        <Bullet
          title="App not working offline"
          desc="If you experience connectivity issues while offline, please check your internet connection, and ensure you have set up your emergency location in Profile. If the issue persists, report it under Settings > Report an Issue."
        />

        <Divider />

        {/* FEEDBACK */}
        <SectionTitle title="Give Feedback" />

        <TextInput
          value={feedback}
          onChangeText={setFeedback}
          placeholder="Write your feedback here..."
          placeholderTextColor={theme.colors.colorTextSecondary}
          multiline
          style={[
            styles.feedbackInput,
            {
              backgroundColor: theme.colors.colorBgSurface,
              color: theme.colors.colorTextPrimary,
              borderColor: theme.colors.border,
            },
          ]}
        />

        <View style={{ height: 40 }} />
    </BodyLayout>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({

  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },

  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 10,
  },

  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  bulletDot: {
    fontSize: 22,
    marginRight: 8,
    lineHeight: 22,
  },

  bulletTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },

  bulletDesc: {
    fontSize: 13.5,
    lineHeight: 20,
  },

  feedbackInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
});
