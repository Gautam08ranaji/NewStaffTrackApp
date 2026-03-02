import { getAttendanceHistory } from "@/features/fro/addAttendance";
import { addAttendance } from "@/features/fro/addAttendanceStatus";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

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
  return date.toLocaleDateString("en-CA");
}

function isValidDate(value?: string | null) {
  return value && value.trim().length > 0;
}

function calculateMinutes(start: string, end?: string | null) {
  const startDate = new Date(start).getTime();
  const endDate = end ? new Date(end).getTime() : Date.now();

  const diff = endDate - startDate;
  return Math.floor(diff / 60000);
}

/* ================= COMPONENT ================= */

export default function PunchInCard() {
  const { theme } = useTheme();
  const authState = useAppSelector((state) => state.auth);

  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
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

      const todayAttendance = list.find(
        (item: any) => item.attendancedate === today,
      );

      if (!todayAttendance) {
        setIsPunchedIn(false);
        setPunchInTime(null);
        setPunchOutTime(null);
        setWorkedMinutes(0);
        setDutyEnded(false);
        return;
      }

      const checkIn = todayAttendance.checkintime;
      const checkOut = todayAttendance.checkouttime;

      if (checkIn) {
        const checkInDate = new Date(checkIn);
        setPunchInTime(checkInDate);
      }

      if (checkOut) {
        const checkOutDate = new Date(checkOut);
        setPunchOutTime(checkOutDate);
      }

      const hasCheckIn = isValidDate(checkIn);
      const hasCheckOut = isValidDate(checkOut);

      if (hasCheckIn && !hasCheckOut) {
        setIsPunchedIn(true);
        setDutyEnded(false);

        const minutes = calculateMinutes(checkIn);
        setWorkedMinutes(minutes);
      }

      if (hasCheckIn && hasCheckOut) {
        setIsPunchedIn(false);
        setDutyEnded(true);

        const minutes = calculateMinutes(checkIn, checkOut);
        setWorkedMinutes(minutes);
      }
    } catch (err: any) {
      const status = err?.status || err?.response?.status;

      if (status === 401) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
        return;
      }

      Alert.alert("Error", "Unable to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, []),
  );

  /* ================= TIMER ================= */

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

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

  /* ================= PUNCH ACTION ================= */

  const punchAttendance = async () => {
    if (loading || dutyEnded) return;

    setLoading(true);

    try {
      const now = new Date();
      const currentDateTime = now.toISOString();
      const action: "start" | "end" = isPunchedIn ? "end" : "start";

      const payload = {
        attendancedate: formatDateOnly(now),
        checkintime: action === "start" ? currentDateTime : "",
        checkouttime: action === "end" ? currentDateTime : "",
        status: "Present" as const,
        userId: String(authState.userId),
      };

      await addAttendance({
        data: payload,
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
        setPunchOutTime(now);
        setIsPunchedIn(false);
        setDutyEnded(true);

        Toast.show({
          type: "success",
          text1: "Punch Out Successful",
          text2: `Worked ${formatMinutesToTime(workedMinutes)}`,
        });
      }
    } catch {
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
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ color: theme.colors.colorTextSecondary }}>
            Punched In
          </Text>

          <Text
            style={{
              color: theme.colors.validationWarningText,
              fontSize: 18,
              marginTop: 4,
            }}
          >
            {punchInTime ? formatTimeAMPM(punchInTime) : "--:--"}
          </Text>

          {/* {punchOutTime && (
            <>
              <Text
                style={{
                  color: theme.colors.colorTextSecondary,
                  marginTop: 6,
                }}
              >
                Punched Out
              </Text>

              <Text
                style={{
                  color: theme.colors.validationWarningText,
                  fontSize: 16,
                }}
              >
                {formatTimeAMPM(punchOutTime)}
              </Text>
            </>
          )} */}
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