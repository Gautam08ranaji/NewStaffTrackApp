import { getAttendanceHistory } from "@/features/fro/addAttendance";
import { addAttendance } from "@/features/fro/addAttendanceStatus";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

/* ================= CONSTANTS ================= */

const TARGET_MINUTES = 8 * 60;

/* ================= HELPERS ================= */

function formatMinutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatTimeAMPM(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(date: Date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function isValidDate(value?: string | null) {
  return value && value.trim().length > 0;
}

/* ================= COMPONENT ================= */

export default function PunchInCard() {
  const { theme } = useTheme();
  const authState = useAppSelector((state) => state.auth);

  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [workedMinutes, setWorkedMinutes] = useState(0);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [dutyEnded, setDutyEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ATTENDANCE ================= */

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const res = await getAttendanceHistory({
        userId: String(authState.userId),
        pageNumber: 1,
        pageSize: 30,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      const list = Array.isArray(res?.data?.attendanceList)
        ? res.data.attendanceList
        : [];

      const today = formatDateOnly(new Date());

      // 🔍 Find today's attendance
      const todayAttendance = list.find(
        (item: any) => item.attendancedate === today,
      );

      if (!todayAttendance) {
        setIsPunchedIn(false);
        setPunchInTime(null);
        setWorkedMinutes(0);
        setDutyEnded(false);
        return;
      }

      const hasCheckIn = isValidDate(todayAttendance.checkintime);
      const hasCheckOut = isValidDate(todayAttendance.checkouttime);

      if (hasCheckIn && !hasCheckOut) {
        const checkInDate = new Date(todayAttendance.checkintime);

        setPunchInTime(checkInDate);
        setIsPunchedIn(true);
        setDutyEnded(false);

        const diffMs = Date.now() - checkInDate.getTime();
        setWorkedMinutes(Math.floor(diffMs / 60000));
      } else if (hasCheckIn && hasCheckOut) {
        setIsPunchedIn(false);
        setDutyEnded(true);
        setPunchInTime(null);
        setWorkedMinutes(0);
      }
    } catch (err: any) {
      console.error("Attendance API error:", err);

      const status = err?.status || err?.response?.status;

      if (status === 401) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: () => {
                // Optional: clear auth state / redux
                // dispatch(logout());

                router.replace("/login");
              },
            },
          ],
        );
        return;
      }

      Alert.alert(
        "Error",
        err?.message || "Unable to load attendance. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  /* ================= TIMER ================= */

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isPunchedIn && punchInTime) {
      interval = setInterval(() => {
        const diffMs = Date.now() - punchInTime.getTime();
        setWorkedMinutes(Math.floor(diffMs / 60000));
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPunchedIn, punchInTime]);

  /* ================= PUNCH HANDLER ================= */

  const punchAttendance = async () => {
    if (loading || dutyEnded) return;

    setLoading(true);

    try {
      const now = new Date();
      const currentDateTime = now.toISOString();
      const action: "start" | "end" = isPunchedIn ? "end" : "start";

      await addAttendance({
        data: {
          attendancedate: formatDateOnly(now),
          checkintime: action === "start" ? currentDateTime : "",
          checkouttime: action === "end" ? currentDateTime : "",
          status: "Present",
          totalworkinghours:
            action === "end" ? formatMinutesToTime(workedMinutes) : "0h 0m",
          userId: String(authState.userId),
        },
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      if (action === "start") {
        setPunchInTime(now);
        setWorkedMinutes(0);
        setIsPunchedIn(true);

        Toast.show({
          type: "success",
          text1: "Punch In Successful",
          text2: `Started at ${formatTimeAMPM(now)}`,
        });
      } else {
        setIsPunchedIn(false);
        setDutyEnded(true);

        Toast.show({
          type: "success",
          text1: "Punch Out Successful",
          text2: `Worked ${formatMinutesToTime(workedMinutes)}`,
        });
      }
    } catch (error: any) {
      const statusCode = error?.response?.data?.statusCode;
      const apiMessage =
        error?.response?.data?.errors?.[0] ?? "Attendance already recorded";

      if (statusCode === 409) {
        setDutyEnded(true);
        setIsPunchedIn(false);

        Toast.show({
          type: "info",
          text1: "Already Recorded",
          text2: apiMessage,
        });
        return;
      }

      Toast.show({
        type: "error",
        text1: "Attendance Failed",
        text2: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <View
      style={{
        padding: 12,
        backgroundColor: theme.colors.validationWarningBg,
        marginTop: 10,
        borderRadius: 12,
        borderColor: theme.colors.validationWarningText,
        borderWidth: 1,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: theme.colors.colorTextSecondary }}>
            Punched-in at
          </Text>

          <Text
            style={[
              theme.typography.fontH4,
              {
                color: theme.colors.validationWarningText,
                marginTop: 5,
              },
            ]}
          >
            {punchInTime ? formatTimeAMPM(punchInTime) : "--:--"}
          </Text>
        </View>

        <TouchableOpacity
          disabled={loading || dutyEnded}
          onPress={punchAttendance}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 22,
            borderRadius: 10,
            backgroundColor:
              loading || dutyEnded
                ? "#999"
                : theme.colors.validationWarningText,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {loading
              ? "Please wait..."
              : dutyEnded
                ? "Punched Out"
                : isPunchedIn
                  ? "Punch Out"
                  : "Punch In"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <Text style={{ color: theme.colors.colorTextSecondary }}>
          Working Time: {formatMinutesToTime(workedMinutes)}
        </Text>

        <Text style={{ color: theme.colors.colorTextSecondary }}>
          Target: {formatMinutesToTime(TARGET_MINUTES)}
        </Text>
      </View>
    </View>
  );
}
