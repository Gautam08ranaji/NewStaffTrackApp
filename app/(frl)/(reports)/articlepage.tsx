import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import { ResizeMode, Video } from "expo-av";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next"; // <-- Added
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ArticleScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation(); // <-- Added
  const videoRef = useRef<Video>(null);

  return (
    <BodyLayout scrollContentStyle={{paddingHorizontal:5}} type="screen" screenName="Read Article">

      {/* ---------- TITLE + TAG ---------- */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.colors.colorPrimary600 }]}>
          {t("article.title")}
        </Text>

        <View
          style={[
            styles.tagWrapper,
            { backgroundColor: theme.colors.validationWarningBg },
          ]}
        >
          <Text style={[styles.tagText, { color: theme.colors.validationWarningText }]}>
            {t("article.tag")}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.colorBorder }]} />

      {/* ---------- SECTION HEADER ---------- */}
      <Text style={[styles.sectionTitle, { color: theme.colors.colorPrimary600 }]}>
        {t("article.watchVideo")}
      </Text>

      {/* ---------- VIDEO PLAYER ---------- */}
      <Video
        ref={videoRef}
        style={styles.videoPlayer}
        source={{ uri: "https://www.w3schools.com/html/mov_bbb.mp4" }}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
      />

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.colorBorder }]} />

      {/* ---------- DETAILS SECTION ---------- */}
      <Text style={[styles.sectionTitle, { color: theme.colors.colorPrimary600 }]}>
        {t("article.features")}
      </Text>

      <Text style={[styles.bulletPoint, { color: theme.colors.colorTextSecondary }]}>
        • {t("article.point1")}
      </Text>

      <Text style={[styles.bulletPoint, { color: theme.colors.colorTextSecondary }]}>
        • {t("article.point2")}
      </Text>

      <Text style={[styles.bulletPoint, { color: theme.colors.colorTextSecondary }]}>
        • {t("article.point3")}
      </Text>

      <Text style={[styles.bulletPoint, { color: theme.colors.colorTextSecondary }]}>
        • {t("article.point4")}
      </Text>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.colorBorder }]} />

      {/* ---------- HOW TO USE SECTION ---------- */}
      <Text style={[styles.sectionTitle, { color: theme.colors.colorPrimary600 }]}>
        {t("article.howToUse")}
      </Text>

      <Text style={[styles.bulletPoint, { color: theme.colors.colorTextSecondary }]}>
        • {t("article.step1")}
      </Text>

      <Text style={[styles.bulletPoint, { color: theme.colors.colorTextSecondary }]}>
        • {t("article.step2")}
      </Text>

      <Text style={[styles.bulletPoint, { color: theme.colors.colorTextSecondary }]}>
        • {t("article.step3")}
      </Text>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.colorBorder }]} />

      {/* ---------- CONCLUSION ---------- */}
      <Text style={[styles.sectionTitle, { color: theme.colors.colorPrimary600 }]}>
        {t("article.conclusionTitle")}
      </Text>

      <Text style={[styles.paragraph, { color: theme.colors.colorTextSecondary }]}>
        {t("article.conclusionText")}
      </Text>

    </BodyLayout>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
    marginRight: 10,
  },

  tagWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },

  divider: {
    height: 1,
    width: "100%",
    marginVertical: 16,
  },

  videoPlayer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#000",
    marginBottom: 10,
  },

  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
});
