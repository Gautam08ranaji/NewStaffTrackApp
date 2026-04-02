// import {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// const audioRecorderPlayer = AudioRecorderPlayer;

// type AudioRecorderContextType = {
//   audioUri: string | null;
//   isPlaying: boolean;
//   sec: number;
//   startRecording: () => Promise<void>;
//   stopRecording: () => Promise<void>;
//   playAudio: () => Promise<void>;
//   pauseAudio: () => Promise<void>;
// };

// const AudioRecorderContext = createContext<AudioRecorderContextType | undefined>(
//   undefined
// );

// export const AudioRecorderProvider = ({ children }: { children: ReactNode }) => {
//   const [audioUri, setAudioUri] = useState<string | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sec, setSec] = useState(0);

//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const clearTimer = () => {
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }
//   };

//   /* ================= START RECORDING ================= */

//   const startRecording = async () => {
//     try {
//       setAudioUri(null);
//       setSec(0);
//       clearTimer();

//       timerRef.current = setInterval(() => {
//         setSec((prev) => prev + 1);
//       }, 1000);

//       const uri = await audioRecorderPlayer.startRecorder();
//       console.log("Recording started:", uri);
//     } catch (err) {
//       console.log("Recording start error:", err);
//     }
//   };

//   /* ================= STOP RECORDING ================= */

//   const stopRecording = async () => {
//     try {
//       clearTimer();

//       const uri = await audioRecorderPlayer.stopRecorder();
//       setAudioUri(uri);
//       setIsPlaying(false);

//       console.log("Recording stopped:", uri);
//     } catch (err) {
//       console.log("Recording stop error:", err);
//     }
//   };

//   /* ================= PLAY AUDIO ================= */

//   const playAudio = async () => {
//     try {
//       if (!audioUri) return;

//       await audioRecorderPlayer.startPlayer(audioUri);
//       setIsPlaying(true);

//       audioRecorderPlayer.addPlayBackListener((e: any) => {
//         if (e.currentPosition >= e.duration) {
//           setIsPlaying(false);
//           audioRecorderPlayer.stopPlayer();
//           audioRecorderPlayer.removePlayBackListener();
//         }
//       });
//     } catch (err) {
//       console.log("Playback error:", err);
//     }
//   };

//   /* ================= PAUSE AUDIO ================= */

//   const pauseAudio = async () => {
//     try {
//       await audioRecorderPlayer.pausePlayer();
//       setIsPlaying(false);
//     } catch (err) {
//       console.log("Pause error:", err);
//     }
//   };

//   /* ================= CLEANUP ================= */

//   useEffect(() => {
//     return () => {
//       clearTimer();
//       audioRecorderPlayer.stopRecorder().catch(() => {});
//       audioRecorderPlayer.stopPlayer().catch(() => {});
//       audioRecorderPlayer.removePlayBackListener();
//     };
//   }, []);

//   return (
//     <AudioRecorderContext.Provider
//       value={{
//         audioUri,
//         isPlaying,
//         sec,
//         startRecording,
//         stopRecording,
//         playAudio,
//         pauseAudio,
//       }}
//     >
//       {children}
//     </AudioRecorderContext.Provider>
//   );
// };

// export const useAudioRecorder = () => {
//   const ctx = useContext(AudioRecorderContext);
//   if (!ctx) {
//     throw new Error("useAudioRecorder must be used within provider");
//   }
//   return ctx;
// };