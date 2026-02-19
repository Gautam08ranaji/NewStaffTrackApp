// app/(fro)/VoiceNoteScreen.tsx  (path as per your project)
import BodyLayout from "@/components/layout/BodyLayout";
import { useAudioRecorder } from "@/hooks/AudioRecorderProvider";
import { useTheme } from "@/theme/ThemeContext";
import { t } from "i18next";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function VoiceNoteScreen() {
  const { theme } = useTheme();
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
          { backgroundColor: colors.colorBgPage, elevation: 1 },
        ]}
      >
        <View
          style={[
            styles.micCircle,
            {
              backgroundColor: recording
                ? colors.colorAccent500 + 22
                : colors.btnPrimaryBg + 22,
            },
          ]}
        >
          <RemixIcon
            name="mic-line"
            size={48}
            color={recording ? colors.colorAccent500 : colors.btnPrimaryBg}
          />
        </View>

        <Text style={styles.timer}>{formatTime()}</Text>

        <Text style={styles.subtitle}>
          {recording ? t("voiceNote.recording") : t("voiceNote.ready")}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.recordBtn,
          {
            backgroundColor: recording
              ? colors.colorAccent500
              : colors.btnPrimaryBg,
          },
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <RemixIcon
          name={recording ? "stop-line" : "mic-line"}
          size={22}
          color="#fff"
        />
        <Text style={styles.recordBtnText}>
          {recording ? t("voiceNote.stop") : t("voiceNote.start")}
        </Text>
      </TouchableOpacity>

      {audioUri && (
        <View style={styles.playBox}>
          <Text style={styles.subtitle}>रिकॉर्ड किया गया वॉइस नोट</Text>

          <TouchableOpacity
            style={[styles.playBtn, { borderColor: colors.colorAccent500 }]}
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
    opacity: 0.6,
  },
  recordBtn: {
    height: 52,
    borderRadius: 12,
    marginTop: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  recordBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },
  playBox: {
    marginTop: 40,
    alignItems: "center",
  },
  playBtn: {
    marginTop: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  playText: {
    fontSize: 16,
    marginLeft: 8,
  },
});
