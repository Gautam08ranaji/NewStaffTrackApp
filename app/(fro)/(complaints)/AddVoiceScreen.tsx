// app/(fro)/VoiceNoteScreen.tsx
import BodyLayout from "@/components/layout/BodyLayout";
import { useAudioRecorder } from "@/hooks/AudioRecorderProvider";
import { useTheme } from "@/theme/ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function VoiceNoteScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const colors = theme.colors;

  const {
    recording,
    audioUri,
    isPlaying,
    sec,
    startRecording,
    stopRecording,
    playAudio,
    pauseAudio,
  } = useAudioRecorder();

  const formatTime = () => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <BodyLayout type="screen" screenName={t("voiceNote.screenTitle")}>
      {/* TOP CARD */}
      <View
        style={[
          styles.card,
          { 
            backgroundColor: colors.colorBgSurface,
            ...Platform.select({
              ios: {
                shadowColor: colors.colorShadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
              android: {
                elevation: 3,
              },
            }),
          },
        ]}
      >
        <View
          style={[
            styles.micCircle,
            {
              backgroundColor: recording
                ? colors.colorAccent100
                : colors.colorPrimary50,
            },
          ]}
        >
          <RemixIcon
            name="mic-line"
            size={48}
            color={recording ? colors.colorAccent500 : colors.colorPrimary600}
          />
        </View>

        <Text style={[styles.timer, { color: colors.colorTextPrimary }]}>
          {formatTime()}
        </Text>

        <Text style={[styles.subtitle, { color: colors.colorTextSecondary }]}>
          {recording ? t("voiceNote.recording") : t("voiceNote.ready")}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.recordBtn,
          {
            backgroundColor: recording
              ? colors.btnSosBg
              : colors.btnPrimaryBg,
          },
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <RemixIcon
          name={recording ? "stop-line" : "mic-line"}
          size={22}
          color={colors.btnPrimaryText}
        />
        <Text style={[styles.recordBtnText, { color: colors.btnPrimaryText }]}>
          {recording ? t("voiceNote.stop") : t("voiceNote.start")}
        </Text>
      </TouchableOpacity>

      {audioUri && (
        <View style={styles.playBox}>
          <Text style={[styles.recordedLabel, { color: colors.colorTextSecondary }]}>
            {t("voiceNote.recordedVoiceNote")}
          </Text>

          <TouchableOpacity
            style={[
              styles.playBtn, 
              { 
                borderColor: colors.colorAccent500,
                backgroundColor: colors.colorAccent50,
              }
            ]}
            onPress={isPlaying ? pauseAudio : playAudio}
          >
            <RemixIcon
              name={isPlaying ? "pause-circle-line" : "play-circle-line"}
              size={30}
              color={colors.colorAccent500}
            />
            <Text
              style={[styles.playText, { color: colors.colorAccent500 }]}
            >
              {isPlaying ? t("voiceNote.pause") : t("voiceNote.play")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  micCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    fontSize: 34,
    fontWeight: "700",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
    fontWeight: "500",
  },
  recordBtn: {
    height: 52,
    borderRadius: 12,
    marginTop: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recordBtnText: {
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },
  playBox: {
    marginTop: 40,
    alignItems: "center",
  },
  recordedLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
  },
  playBtn: {
    marginTop: 8,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  playText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});