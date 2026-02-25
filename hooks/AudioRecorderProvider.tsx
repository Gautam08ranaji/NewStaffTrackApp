import { Audio } from "expo-av";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type AudioRecorderContextType = {
  recording: Audio.Recording | null;
  audioUri: string | null;
  isPlaying: boolean;
  sec: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playAudio: () => Promise<void>;
  pauseAudio: () => Promise<void>;
};

const AudioRecorderContext = createContext<AudioRecorderContextType | undefined>(
  undefined
);

export const AudioRecorderProvider = ({ children }: { children: ReactNode }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sec, setSec] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* ================= START RECORDING ================= */

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      // Stop any playing audio before recording again
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      // Updated safe audio mode (no invalid Android interruptionMode)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      setAudioUri(null);
      setSec(0);
      clearTimer();

      timerRef.current = setInterval(() => {
        setSec((prev) => prev + 1);
      }, 1000);

      const created = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(created.recording);
    } catch (err) {
      console.log("Recording start error:", err);
    }
  };

  /* ================= STOP RECORDING ================= */

  const stopRecording = async () => {
    try {
      if (!recording) return;

      clearTimer();

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) setAudioUri(uri);

      setRecording(null);
      setIsPlaying(false);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (err) {
      console.log("Recording stop error:", err);
    }
  };

  /* ================= PLAY AUDIO ================= */

  const playAudio = async () => {
    try {
      if (!audioUri) return;

      // Always unload previous sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) setIsPlaying(false);
      });
    } catch (err) {
      console.log("Playback error:", err);
    }
  };

  /* ================= PAUSE AUDIO ================= */

  const pauseAudio = async () => {
    try {
      if (!sound) return;
      await sound.pauseAsync();
      setIsPlaying(false);
    } catch (err) {
      console.log("Pause error:", err);
    }
  };

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      clearTimer();

      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }

      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const value: AudioRecorderContextType = {
    recording,
    audioUri,
    isPlaying,
    sec,
    startRecording,
    stopRecording,
    playAudio,
    pauseAudio,
  };

  return (
    <AudioRecorderContext.Provider value={value}>
      {children}
    </AudioRecorderContext.Provider>
  );
};

export const useAudioRecorder = () => {
  const ctx = useContext(AudioRecorderContext);
  if (!ctx) {
    throw new Error(
      "useAudioRecorder must be used within AudioRecorderProvider"
    );
  }
  return ctx;
};