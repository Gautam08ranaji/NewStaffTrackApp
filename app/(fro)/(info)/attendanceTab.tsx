import ReusableButton from "@/components/reusables/ReusableButton";
import { useTheme } from "@/theme/ThemeContext";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getAttendanceHistory } from "@/features/fro/addAttendance";
import { addAttendance } from "@/features/fro/addAttendanceStatus";
import { useLocation } from "@/hooks/LocationContext";
import { useAppSelector } from "@/store/hooks";
import { showApiError } from "@/utils/showApiError";
import { useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";

/* ================= TYPES ================= */

type AttendanceStatus = "Present" | "Absent" | "Leave" | "Late";

type AttendanceItem = {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  totalMinutes: number;
  status: AttendanceStatus;
  rawData: any; // Store original API data
};

/* ================= STATUS COLORS ================= */

const getStatusTheme = (theme: any, status: AttendanceStatus) => {
  switch (status) {
    case "Present":
      return { 
        bg: theme.colors.validationSuccessBg, 
        text: theme.colors.validationSuccessText, 
        border: theme.colors.validationSuccessText 
      };
    case "Absent":
      return { 
        bg: theme.colors.validationErrorBg, 
        text: theme.colors.validationErrorText, 
        border: theme.colors.validationErrorText 
      };
    case "Leave":
      return { 
        bg: theme.colors.validationInfoBg, 
        text: theme.colors.validationInfoText, 
        border: theme.colors.validationInfoText 
      };
    case "Late":
      return { 
        bg: theme.colors.colorWarning100, 
        text: theme.colors.colorWarning600, 
        border: theme.colors.colorWarning600 
      };
    default:
      return { 
        bg: theme.colors.colorBgAlt, 
        text: theme.colors.colorTextSecondary, 
        border: theme.colors.border 
      };
  }
};

/* ================= HELPERS ================= */

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
};

const formatDate = (dateStr: string, locale: string = 'en') => {
  const date = new Date(dateStr);
  return isNaN(date.getTime())
    ? "--"
    : date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
};

const formatTimeAMPM = (date: Date | null, locale: string = 'en') =>
  date
    ? date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "--:--";

const formatMinutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/* ================= STATUS NORMALIZER ================= */

const normalizeStatus = (status?: string): AttendanceStatus => {
  switch (status?.trim().toLowerCase()) {
    case "present":
      return "Present";
    case "leave":
      return "Leave";
    case "late":
      return "Late";
    default:
      return "Absent";
  }
};

/* ================= API MAPPER ================= */

const mapAttendanceFromApi = (item: any, locale: string = 'en'): AttendanceItem => {
  const checkInDate = item.checkintime ? new Date(item.checkintime) : null;
  const checkOutDate = item.checkouttime ? new Date(item.checkouttime) : null;

  const totalMinutes =
    checkInDate && checkOutDate
      ? Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / 60000)
      : 0;

  return {
    id: item.id,
    date: item.attendancedate ?? item.createddate,
    checkIn: formatTimeAMPM(checkInDate, locale),
    checkOut: formatTimeAMPM(checkOutDate, locale),
    totalMinutes,
    status: normalizeStatus(item.status),
    rawData: item, // Store original data for reference
  };
};

/* ================= COMPONENT ================= */

export default function AttendanceTab() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const authState = useAppSelector((state) => state.auth);
  const { hasPermission, fetchLocation, address } = useLocation();

  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [currentDateAttendance, setCurrentDateAttendance] = useState<any>(null);

  /* ===== Punch States ===== */
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [workedMinutes, setWorkedMinutes] = useState(0);
  const [dutyEnded, setDutyEnded] = useState(false);

  const [activeTab, setActiveTab] = useState<"all" | AttendanceStatus>("all");

  /* ================= FIND CURRENT DATE ATTENDANCE ================= */

  const findCurrentDateAttendance = (data: any[]) => {
    const today = getTodayDateString();
    return data.find((item) => {
      const itemDate = item.attendancedate || item.createddate?.split("T")[0];
      return itemDate === today;
    });
  };

  /* ================= INITIALIZE PUNCH STATUS ================= */

  const initializePunchStatus = (currentData: any) => {
    if (!currentData) {
      // No attendance record for today
      setIsPunchedIn(false);
      setPunchInTime(null);
      setWorkedMinutes(0);
      setDutyEnded(false);
      return;
    }

    const hasCheckIn = currentData.checkintime;
    const hasCheckOut = currentData.checkouttime;

    if (hasCheckIn && !hasCheckOut) {
      // User punched in but not out
      const checkInTime = new Date(currentData.checkintime);
      setIsPunchedIn(true);
      setPunchInTime(checkInTime);
      setDutyEnded(false);

      // Calculate worked minutes
      const diff = Date.now() - checkInTime.getTime();
      setWorkedMinutes(Math.floor(diff / 60000));
    } else if (hasCheckIn && hasCheckOut) {
      // User already completed duty today
      const checkInTime = new Date(currentData.checkintime);
      const checkOutTime = new Date(currentData.checkouttime);

      setIsPunchedIn(false);
      setPunchInTime(checkInTime);
      setDutyEnded(true);

      const diff = checkOutTime.getTime() - checkInTime.getTime();
      setWorkedMinutes(Math.floor(diff / 60000));
    } else {
      // User hasn't punched in today
      setIsPunchedIn(false);
      setPunchInTime(null);
      setWorkedMinutes(0);
      setDutyEnded(false);
    }
  };

  /* ================= FETCH HISTORY ================= */

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

      // Find today's attendance
      const todayAttendance = findCurrentDateAttendance(list);
      setCurrentDateAttendance(todayAttendance);

      console.log("todayAttendance", res?.data);

      // Initialize punch status
      initializePunchStatus(todayAttendance);

      // Map history
      setAttendanceHistory(list.map(item => mapAttendanceFromApi(item, i18n.language)));
    } catch (err: any) {
      console.error("Attendance API error:", err);

      const status = err?.status || err?.response?.status;

     showApiError(err)
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [])
  );

  /* ================= LIVE TIMER ================= */

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isPunchedIn && punchInTime) {
      timer = setInterval(() => {
        const diff = Date.now() - punchInTime.getTime();
        setWorkedMinutes(Math.floor(diff / 60000));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPunchedIn, punchInTime]);

  const filteredData =
    activeTab === "all"
      ? attendanceHistory
      : attendanceHistory.filter((item) => item.status === activeTab);

  const submitAttendanceStatus = async (action: "start" | "end") => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentDateTime = now.toISOString();

      const location = await fetchLocation();
      
      if (!location) {
        Toast.show({
          type: "error",
          text1: t("attendance.locationNotAvailable") || "Location not available",
        });
        return;
      }

      const { latitude, longitude } = location.coords;
      const locationString = `${latitude},${longitude}`;

      console.log(location.coords, "attendance location");

      const res = await addAttendance({
        data: {
          attendancedate: currentDate,
          checkintime: action === "start" ? currentDateTime : "",
          checkouttime: action === "end" ? currentDateTime : "",
          status: "Present",
          userId: String(authState.userId),
        },
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
        checkInLocation: String(action === "start" ? address : ""),
        checkOutLocation: String(action === "end" ? address : ""),
        userId: String(authState.userId),
      });

      console.log("attendance response", res);

      Toast.show({
        type: "success",
        text1:
          action === "start"
            ? t("attendance.dutyStarted") || "Duty Started"
            : t("attendance.dutyEnded") || "Duty Ended Successfully",
      });

      await loadAttendance();
    } catch (error) {
      console.error("Attendance submit failed", error);

      showApiError(error)
    }
  };

  const handleDutyAction = async () => {
    if (loading) return;

    if (!isPunchedIn) {
      // ▶ START DUTY
      const now = new Date();
      setPunchInTime(now);
      setWorkedMinutes(0);
      setIsPunchedIn(true);
      setDutyEnded(false);

      await submitAttendanceStatus("start");
    } else {
      // ⏹ END DUTY
      setIsPunchedIn(false);
      setPunchInTime(null);
      setDutyEnded(true);

      await submitAttendanceStatus("end");
    }
  };

  /* ================= UI ================= */

  return (
    <ScrollView style={{ padding: 16, backgroundColor: theme.colors.background }}>
      <View
        style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.colorBgSurface,
            shadowColor: theme.colors.colorShadow,
          }
        ]}
      >
        <Text
          style={[styles.cardTitle, { color: theme.colors.colorPrimary600 }]}
        >
          {t("attendance.todayAttendanceTitle")}
        </Text>

        <View
          style={[
            styles.row,
            { backgroundColor: theme.colors.validationSuccessBg },
          ]}
        >
          <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
            {t("attendance.startTimeLabel")}
          </Text>
          <Text style={[styles.value, { color: theme.colors.validationSuccessText }]}>
            {formatTimeAMPM(punchInTime, i18n.language)}
          </Text>
        </View>

        <View style={[styles.row, { backgroundColor: theme.colors.inputBg }]}>
          <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
            {t("attendance.endTimeLabel")}
          </Text>
          <Text style={[styles.value, { color: theme.colors.colorTextPrimary }]}>
            {dutyEnded
              ? (t("attendance.dutyEnded") || "Duty Ended")
              : !isPunchedIn && punchInTime
                ? formatTimeAMPM(new Date(), i18n.language)
                : "--:--"}
          </Text>
        </View>

        <View style={[styles.row, { backgroundColor: theme.colors.inputBg }]}>
          <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
            {t("attendance.totalTimeLabel")}
          </Text>
          <Text style={[styles.value, { color: theme.colors.colorTextSecondary }]}>
            {formatMinutesToTime(workedMinutes)}
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <ReusableButton
            title={
              dutyEnded
                ? (t("attendance.dutyEnded") || "Duty Ended")
                : isPunchedIn
                  ? t("attendance.endDutyButton")
                  : t("attendance.startDutyButton")
            }
            disabled={dutyEnded}
            containerStyle={{
              backgroundColor: dutyEnded
                ? theme.colors.btnDisabledBg
                : isPunchedIn
                  ? theme.colors.btnSosBg
                  : theme.colors.btnPrimaryBg,
            }}
            textStyle={{ color: theme.colors.btnPrimaryText }}
            onPress={handleDutyAction}
          />
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["all", "Present", "Absent", "Leave", "Late"] as const).map((tab) => (
          <Text
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabText,
              { 
                borderColor: activeTab === tab 
                  ? theme.colors.colorPrimary600 
                  : theme.colors.border,
                color: activeTab === tab 
                  ? theme.colors.colorPrimary600 
                  : theme.colors.colorTextSecondary,
                backgroundColor: activeTab === tab 
                  ? theme.colors.colorPrimary50 
                  : 'transparent',
              },
            ]}
          >
            {t(`attendance.tabs.${tab.toLowerCase()}`)}
          </Text>
        ))}
      </View>

      {filteredData.map((item) => {
        const themeColor = getStatusTheme(theme, item.status);
        const hours = Math.floor(item.totalMinutes / 60);
        const minutes = item.totalMinutes % 60;

        return (
          <View
            key={item.id}
            style={[
              styles.historyCard,
              {
                backgroundColor: themeColor.bg,
                borderColor: themeColor.border,
                shadowColor: theme.colors.colorShadow,
              },
            ]}
          >
            <Text style={[styles.historyStatus, { color: themeColor.text, fontWeight: "700" }]}>
              {formatDate(item.date, i18n.language)} — {t(`attendance.status.${item.status.toLowerCase()}`)}
            </Text>

            <Text style={[styles.historyTime, { color: themeColor.text }]}>
              {item.checkIn} → {item.checkOut}
            </Text>

            <Text style={[styles.historyHours, { color: themeColor.text }]}>
              {hours}:{String(minutes).padStart(2, "0")} {t("attendance.hours")}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  row: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { 
    fontSize: 14, 
    fontFamily: 'Poppins-Regular',
  },
  value: { 
    fontSize: 15, 
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tabText: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    fontWeight: "600",
    borderWidth: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  historyCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyStatus: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  historyTime: {
    fontSize: 13,
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  historyHours: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
});