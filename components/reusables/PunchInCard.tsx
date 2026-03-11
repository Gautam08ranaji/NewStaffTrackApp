import { getAttendanceHistory } from "@/features/fro/addAttendance";
import { addAttendance } from "@/features/fro/addAttendanceStatus";
import { useLocation } from "@/hooks/LocationContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideLoader, showLoader } from "@/store/loaderSlice";
import { useTheme } from "@/theme/ThemeContext";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
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
  const { t } = useTranslation();
  const authState = useAppSelector((state) => state.auth);
     const dispatch = useAppDispatch(); 
  

  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
  const [workedMinutes, setWorkedMinutes] = useState(0);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [dutyEnded, setDutyEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasPermission, fetchLocation, address } = useLocation();

  // console.log(address,"jewhfljh");
  


  /* ================= LOAD ATTENDANCE ================= */

  const loadAttendance = async () => {
  try {
    dispatch(showLoader());

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

    const today = new Date().toISOString().split("T")[0];

    const todayAttendance = list.find(
      (item: any) => item.attendancedate === today
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

    if (checkIn) setPunchInTime(new Date(checkIn));
    if (checkOut) setPunchOutTime(new Date(checkOut));

    const hasCheckIn = isValidDate(checkIn);
    const hasCheckOut = isValidDate(checkOut);

    if (hasCheckIn && !hasCheckOut) {
      setIsPunchedIn(true);
      setDutyEnded(false);
      setWorkedMinutes(calculateMinutes(checkIn));
    }

    if (hasCheckIn && hasCheckOut) {
      setIsPunchedIn(false);
      setDutyEnded(true);
      setWorkedMinutes(calculateMinutes(checkIn, checkOut));
    }

  } catch (err: any) {
    const status = err?.status || err?.response?.status;

    if (status === 401) {
      Alert.alert(
        "Session Expired",
        "Please login again",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
      return;
    }

    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Unable to load attendance",
    });

  } finally {
    dispatch(hideLoader());
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

  // setLoading(true);
  dispatch(showLoader()); // ✅ GLOBAL LOADER START

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

    const location = await fetchLocation();
    if (!location) return;

    const { latitude, longitude } = location.coords;

    const res = await addAttendance({
      data: payload,
      token: String(authState.token),
      csrfToken: String(authState.antiforgeryToken),
      checkInLocation: String(action === "start" ? address : ""),
      checkOutLocation: String(action === "end" ? address : ""),
      userId: String(authState?.userId),
    });

    console.log("punch res", res);

    if (action === "start") {
      setPunchInTime(now);
      setWorkedMinutes(0);
      setIsPunchedIn(true);

      Toast.show({
        type: "success",
        text1: t("attendanceCard.punchInSuccess") || "Punch In Successful",
        text2: `${t("attendanceCard.startedAt") || "Started at"} ${formatTimeAMPM(now)}`,
      });
    } else {
      setPunchOutTime(now);
      setIsPunchedIn(false);
      setDutyEnded(true);

      Toast.show({
        type: "success",
        text1: t("attendanceCard.punchOutSuccess") || "Punch Out Successful",
        text2: `${t("attendanceCard.worked") || "Worked"} ${formatMinutesToTime(workedMinutes)}`,
      });
    }

  } catch (error) {
    Toast.show({
      type: "error",
      text1: t("attendanceCard.failed") || "Attendance Failed",
      text2: t("attendanceCard.tryAgain") || "Please try again",
    });
  } finally {
    // setLoading(false);
    dispatch(hideLoader()); // ✅ GLOBAL LOADER STOP
  }
};

  /* ================= UI ================= */

  return (
    <View
      style={{
        padding: 16,
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
          <Text style={[theme.typography.fontBodySmall, { color: theme.colors.colorTextSecondary }]}>
            {t("attendanceCard.punchedIn") || "Punched In"}
          </Text>

          <Text
            style={[
              theme.typography.fontH5,
              { color: theme.colors.validationWarningText, marginTop: 4 }
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
            paddingHorizontal: 24,
            borderRadius: 10,
            backgroundColor:
              loading || dutyEnded
                ? theme.colors.btnDisabledBg
                : theme.colors.validationWarningText,
            minWidth: 120,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.btnPrimaryText} size="small" />
          ) : (
            <Text
              style={[
                theme.typography.fontButton,
                { color: theme.colors.btnPrimaryText }
              ]}
            >
              {dutyEnded
                ? t("attendanceCard.punchedOut") || "Punched Out"
                : isPunchedIn
                  ? t("attendanceCard.punchOut") || "Punch Out"
                  : t("attendanceCard.punchIn") || "Punch In"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <Text style={[theme.typography.fontBody, { color: theme.colors.colorTextSecondary }]}>
          {t("attendanceCard.workingTime") || "Working Time"}: {formatMinutesToTime(workedMinutes)}
        </Text>

        <Text style={[theme.typography.fontBody, { color: theme.colors.colorTextSecondary }]}>
          {t("attendanceCard.target") || "Target"}: {formatMinutesToTime(TARGET_MINUTES)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          marginTop: 12,
          height: 6,
          backgroundColor: theme.colors.colorBgAlt,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.min((workedMinutes / TARGET_MINUTES) * 100, 100)}%`,
            height: "100%",
            backgroundColor:
              workedMinutes >= TARGET_MINUTES
                ? theme.colors.colorSuccess600
                : theme.colors.validationWarningText,
          }}
        />
      </View>
    </View>
  );
}


