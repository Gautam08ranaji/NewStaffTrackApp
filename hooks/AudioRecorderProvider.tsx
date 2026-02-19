// hooks/AudioRecorderProvider.tsx
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

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Reset state
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
  };

  const stopRecording = async () => {
    if (!recording) return;

    clearTimer();

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) setAudioUri(uri);

    setRecording(null);
  };

  const playAudio = async () => {
    if (!audioUri) return;

    // If we already have a sound instance
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );

    setSound(newSound);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if ("didJustFinish" in status && status.didJustFinish) {
        setIsPlaying(false);
      }
    });
  };

  const pauseAudio = async () => {
    if (!sound) return;
    await sound.pauseAsync();
    setIsPlaying(false);
  };

  // Cleanup on unmount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also cleanup when sound changes
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync().catch(() => {});
        }
      : undefined;
  }, [sound]);

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
      "useAudioRecorder must be used within an AudioRecorderProvider"
    );
  }
  return ctx;
};
