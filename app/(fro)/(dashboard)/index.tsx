import BodyLayout from "@/components/layout/BodyLayout";
import CircularKPIChart from "@/components/reusables/CircularKPIChart";
import PunchInCard from "@/components/reusables/PunchInCard";
import ReusableCard from "@/components/reusables/ReusableCard";
import { getFROCasePerformanceDayWise } from "@/features/fro/dashboard/dayWisePerformance";
import { getFROMonthCasePerformanceDayWise } from "@/features/fro/dashboard/monthWisePerformance";
import { getDashCount } from "@/features/fro/interaction/countApi";
import { getUserDataById } from "@/features/fro/profile/getProfile";
import { useInteractionPopupPoller } from "@/hooks/InteractionPopupProvider";
import { useFROLocationUpdater } from "@/hooks/useFROLocationUpdater";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Toast from "react-native-toast-message";

/* ================= TYPES ================= */

type DashCount = {
  closed: number;
  open: number;
  inProgress: number;
  tickets: number;
};

type DayWisePerformance = {
  date: string;
  open: number;
  inProgress: number;
  closed: number;
  total: number;
  formattedDate?: string;
  day?: number;
};

type MonthWisePerformance = {
  month: number;
  monthName: string;
  open: number;
  inProgress: number;
  closed: number;
  total: number;
};

type MonthPerformanceResponse = {
  year: number;
  data: MonthWisePerformance[];
};

type DayCasePerformanceResponse = {
  data: DayWisePerformance[];
  month: number;
  year: number;
};

/* ================= SCREEN ================= */

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const authState = useAppSelector((state) => state.auth);
  const { Popup } = useInteractionPopupPoller();
  const scrollViewRef = useRef<ScrollView>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [count, setCount] = useState<DashCount>({
    closed: 0,
    open: 0,
    inProgress: 0,
    tickets: 0,
  });

  const [dayPerformanceData, setDayPerformanceData] = useState<DayCasePerformanceResponse | null>(null);
  const [monthPerformanceData, setMonthPerformanceData] = useState<MonthPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    presentDays: 20,
    absentDays: 6
  });

  const [dayChartData, setDayChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        color: () => '#00C950',
        strokeWidth: 2
      },
      {
        data: [] as number[],
        color: () => '#FFA500',
        strokeWidth: 2
      },
      {
        data: [] as number[],
        color: () => '#6A7282',
        strokeWidth: 2
      }
    ]
  });

  const [monthChartData, setMonthChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        color: () => '#00C950',
        strokeWidth: 2
      },
      {
        data: [] as number[],
        color: () => '#FFA500',
        strokeWidth: 2
      },
      {
        data: [] as number[],
        color: () => '#6A7282',
        strokeWidth: 2
      }
    ]
  });

  /* ================= ATTENDANCE CALCULATIONS ================= */
  // TODO: Replace with actual API data
  const totalDays = useMemo(() => {
    return new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate();
  }, []);

  const attendanceRateNum = useMemo(() => {
    return totalDays > 0 ? (attendanceData.presentDays / totalDays) * 100 : 0;
  }, [attendanceData.presentDays, totalDays]);

  /* ================= KPI CALCULATIONS ================= */
  // Dynamic completion rate calculation based on actual data
  const completionRate = useMemo(() => {
    if (count.tickets === 0) return 0;
    // Round to nearest integer for better display
    return Math.round((count.closed / count.tickets) * 100);
  }, [count.closed, count.tickets]);

  useFROLocationUpdater(authState?.userId);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        fetchUserData(),
        fetchCountData(),
        handleGetDayCasePerformance(),
        handleGetMonthCasePerformance()
      ]);
    }, []),
  );

  /* ================= API ================= */

  const fetchUserData = async () => {
    console.log("authState.userId", authState.antiforgeryToken);
    console.log("authState.token", authState.userId);

    try {
      const response = await getUserDataById({
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      setFirstName(response?.data?.firstName || "User");
      setLastName(response?.data?.lastName || "");
    } catch (error) {
      console.error("User fetch error:", error);
      alert(
        "Failed to fetch user data. " +
        (error instanceof Error ? error?.message : "Unknown error"),
      );
    }
  };

  const fetchCountData = async () => {
    try {
      const response = await getDashCount({
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("getDashCount", response);

      if (response?.success) {
        setCount(response.data);
      }
    } catch (error) {
      console.error("Count fetch error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch dashboard counts",
      });
    }
  };

  const handleGetDayCasePerformance = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const response = await getFROCasePerformanceDayWise({
        year: currentYear,
        month: currentMonth,
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken)
      });

      console.log("daily per",response?.data);
      

      if (response?.data) {
        const processedData = processDayPerformanceData(response.data, currentYear, currentMonth);
        setDayPerformanceData(processedData);
        prepareDayChartData(processedData);
      }

    } catch (error: any) {
      console.error("Error fetching day performance:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch daily performance data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetMonthCasePerformance = async () => {
    try {
      const response = await getFROMonthCasePerformanceDayWise({
        year: 2026,
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken)
      });

      if (response?.data) {
        setMonthPerformanceData(response.data);
        prepareMonthChartData(response.data);
      }


      console.log("month perf",response?.data);
      

    } catch (error: any) {
      console.error("Error fetching month performance:", error);
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Failed to fetch month performance",
      });
    }
  };

  // Process daily performance data
  const processDayPerformanceData = (data: DayCasePerformanceResponse, year: number, month: number) => {
    return {
      ...data,
      data: data.data.map((item: DayWisePerformance) => {
        const date = new Date(item.date);
        const day = date.getUTCDate();
        return {
          ...item,
          day: day,
          formattedDate: `${day} ${new Date(year, month - 1).toLocaleString('default', { month: 'short' })}`
        };
      }).sort((a, b) => (a.day || 0) - (b.day || 0))
    };
  };

  // Prepare daily chart data
  const prepareDayChartData = (data: DayCasePerformanceResponse) => {
    if (!data?.data || data.data.length === 0) {
      setDayChartData({
        labels: ['No Data'],
        datasets: [
          { data: [0], color: () => '#00C950', strokeWidth: 2 },
          { data: [0], color: () => '#FFA500', strokeWidth: 2 },
          { data: [0], color: () => '#6A7282', strokeWidth: 2 }
        ]
      });
      return;
    }

    const daysToShow = Math.min(data.data.length, 10);
    const interval = Math.ceil(data.data.length / daysToShow);

    const labels: string[] = [];
    const openData: number[] = [];
    const inProgressData: number[] = [];
    const closedData: number[] = [];

    data.data.forEach((item, index) => {
      // Always show the first and last day's label
      if (index === 0 || index === data.data.length - 1) {
        labels.push(item.day?.toString() || '');
      }
      // Show label at intervals
      else if (index % interval === 0) {
        labels.push(item.day?.toString() || '');
      } else {
        labels.push('');
      }

      openData.push(item.open || 0);
      inProgressData.push(item.inProgress || 0);
      closedData.push(item.closed || 0);
    });

    setDayChartData({
      labels,
      datasets: [
        { data: openData, color: () => '#00C950', strokeWidth: 2 },
        { data: inProgressData, color: () => '#FFA500', strokeWidth: 2 },      
        { data: closedData, color: () => '#6A7282', strokeWidth: 2 }
      ]
    });
  };

  // Prepare monthly chart data - FIXED FOR THREE SEPARATE LINES
  const prepareMonthChartData = (data: MonthPerformanceResponse) => {
    if (!data?.data || data.data.length === 0) {
      setMonthChartData({
        labels: ['No Data'],
        datasets: [
          { data: [0], color: () => '#00C950', strokeWidth: 2 },
          { data: [0], color: () => '#FFA500', strokeWidth: 2 },
          { data: [0], color: () => '#6A7282', strokeWidth: 2 }
        ]
      });
      return;
    }

    const labels: string[] = [];
    const openData: number[] = [];
    const inProgressData: number[] = [];
    const closedData: number[] = [];

    data.data.forEach((item) => {
      labels.push(item.monthName.substring(0, 3)); // Show first 3 letters of month
      openData.push(item.open || 0);
      inProgressData.push(item.inProgress || 0);
      closedData.push(item.closed || 0);
    });

    // Log to verify data
    console.log('Monthly Chart Data:', {
      labels,
      open: openData,
      inProgress: inProgressData,
      closed: closedData
    });

    setMonthChartData({
      labels,
      datasets: [
        { 
          data: openData, 
          color: () => '#00C950', 
          strokeWidth: 2 
        },
        { 
          data: inProgressData, 
          color: () => '#FFA500', 
          strokeWidth: 2 
        },
        { 
          data: closedData, 
          color: () => '#6A7282', 
          strokeWidth: 2 
        }
      ]
    });
  };

  // Calculate yearly totals
  const calculateYearlyTotals = () => {
    if (!monthPerformanceData?.data) return null;

    return monthPerformanceData.data.reduce(
      (acc, month) => ({
        total: acc.total + month.total,
        open: acc.open + month.open,
        inProgress: acc.inProgress + month.inProgress,
        closed: acc.closed + month.closed,
      }),
      { total: 0, open: 0, inProgress: 0, closed: 0 }
    );
  };

  const yearlyTotals = calculateYearlyTotals();

  /* ================= CARD CONFIG ================= */

  const caseCardConfig = {
    open: {
      title: "Open",
      icon: "folder-check-line",
      iconBg: "#00C950",
      cardBg: theme.colors.validationSuccessBg,
      countColor: theme.colors.colorPrimary600,
      filter: "Open",
    },
    InProgress: {
      title: "In-Progress",
      icon: "time-line",
      iconBg: theme.colors.validationWarningText,
      cardBg: theme.colors.validationWarningBg,
      countColor: theme.colors.validationWarningText,
      filter: "inProgress",
    },
    Total: {
      title: "Total",
      icon: "arrow-right-box-line",
      iconBg: theme.colors.colorHeadingH1,
      cardBg: theme.colors.validationInfoBg,
      countColor: theme.colors.colorHeadingH1,
      filter: "tickets",
    },
    closed: {
      title: "Closed",
      icon: "close-circle-line",
      iconBg: "#6A7282",
      cardBg: theme.colors.navDivider,
      countColor: theme.colors.colorTextSecondary,
      filter: "Closed",
    },
  };

  const screenWidth = Dimensions.get("window").width - 40;
  // Calculate chart width based on data length for horizontal scrolling
  const getChartWidth = (dataLength: number, baseWidth: number) => {
    const minWidth = baseWidth;
    const itemWidth = 60; // Approximate width per data point
    const calculatedWidth = dataLength * itemWidth;
    return Math.max(minWidth, calculatedWidth);
  };

  const dayChartWidth = useMemo(() =>
    getChartWidth(dayChartData.labels.length, screenWidth),
    [dayChartData.labels.length, screenWidth]
  );

  const monthChartWidth = useMemo(() =>
    getChartWidth(monthChartData.labels.length, screenWidth),
    [monthChartData.labels.length, screenWidth]
  );

  /* ================= UI ================= */

  return (
    <>
      {/* {Popup} */}

      <BodyLayout
        type="dashboard"
        userName={`${firstName} ${lastName}`}
        userId=""
        // todaysDutyCount={count.tickets}
        // totalCases={count.tickets}
        // notificationCount={3}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          {/* Attendance */}
          <Text
            style={[
              theme.typography.fontH5,
              { color: theme.colors.colorPrimary600 },
            ]}
          >
            Attendance
          </Text>

          <PunchInCard />

          {/* KPI Circular Charts */}
          <View style={styles.kpiRow}>
            <CircularKPIChart
              percentage={attendanceRateNum}
              label="Attendance"
            />
            <CircularKPIChart
              percentage={completionRate}
              label="Completion Rate"
            />
          </View>

          {/* Case Overview */}
          <Text
            style={[
              theme.typography.fontH6,
              { color: theme.colors.colorPrimary600, marginTop: 20 },
            ]}
          >
            Overview
          </Text>

          {/* Case Cards */}
          <View style={styles.row}>
            <ReusableCard
              icon={caseCardConfig.Total.icon}
              count={String(count.tickets)}
              title={caseCardConfig.Total.title}
              iconBg={caseCardConfig.Total.iconBg}
              cardBg={caseCardConfig.Total.cardBg}
              countColor={caseCardConfig.Total.countColor}
              titleColor={theme.colors.colorTextSecondary}
              onPress={() =>
                router.push({
                  pathname: "/(fro)/(complaints)",
                  params: { filter: caseCardConfig.Total.filter },
                })
              }
            />
            <ReusableCard
              icon={caseCardConfig.open.icon}
              count={String(count.open)}
              title={caseCardConfig.open.title}
              iconBg={caseCardConfig.open.iconBg}
              cardBg={caseCardConfig.open.cardBg}
              countColor={caseCardConfig.open.countColor}
              titleColor={theme.colors.colorTextSecondary}
              onPress={() =>
                router.push({
                  pathname: "/(fro)/(complaints)",
                  params: { filter: caseCardConfig.open.filter },
                })
              }
            />
          </View>

          <View style={styles.row}>
            <ReusableCard
              icon={caseCardConfig.InProgress.icon}
              count={String(count.inProgress)}
              title={caseCardConfig.InProgress.title}
              iconBg={caseCardConfig.InProgress.iconBg}
              cardBg={caseCardConfig.InProgress.cardBg}
              countColor={caseCardConfig.InProgress.countColor}
              titleColor={theme.colors.colorTextSecondary}
              onPress={() =>
                router.push({
                  pathname: "/(fro)/(complaints)",
                  params: { filter: caseCardConfig.InProgress.filter },
                })
              }
            />
            <ReusableCard
              icon={caseCardConfig.closed.icon}
              count={String(count.closed)}
              title={caseCardConfig.closed.title}
              iconBg={caseCardConfig.closed.iconBg}
              cardBg={caseCardConfig.closed.cardBg}
              countColor={caseCardConfig.closed.countColor}
              titleColor={theme.colors.colorTextSecondary}
              onPress={() =>
                router.push({
                  pathname: "/(fro)/(complaints)",
                  params: { filter: caseCardConfig.closed.filter },
                })
              }
            />
          </View>

          {/* Daily Performance Chart */}
          <View style={styles.chartContainer}>
            <Text style={[theme.typography.fontH6, { color: theme.colors.colorPrimary600 }]}>
              Daily Performance - {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text>Loading chart...</Text>
              </View>
            ) : dayPerformanceData && dayPerformanceData.data && dayPerformanceData.data.length > 0 ? (
              <>
                {/* Legend for daily chart */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#00C950' }]} />
                    <Text style={styles.legendText}>Open</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                    <Text style={styles.legendText}>In Progress</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#6A7282' }]} />
                    <Text style={styles.legendText}>Closed</Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  style={styles.horizontalScrollView}
                >
                  <View style={{ width: dayChartWidth }}>
                    <LineChart
                      data={dayChartData}
                      width={dayChartWidth}
                      height={220}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: '4',
                          strokeWidth: '2',
                          stroke: '#fff'
                        },
                        formatYLabel: (yValue) => Math.round(Number(yValue)).toString(),
                      }}
                      bezier
                      style={styles.chart}
                      withVerticalLines={true}
                      withHorizontalLines={true}
                      withDots={true}
                      withShadow={false}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      fromZero={true}
                      yAxisInterval={1}
                      segments={5}
                      transparent={false}
                    />
                  </View>
                </ScrollView>
                
                {dayChartWidth > screenWidth && (
                  <Text style={styles.scrollHint}>← Swipe to see more →</Text>
                )}
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No daily performance data available</Text>
              </View>
            )}
          </View>

          {/* Monthly Performance Chart - THREE SEPARATE LINES */}
          <View style={styles.chartContainer}>
            <Text style={[theme.typography.fontH6, { color: theme.colors.colorPrimary600 }]}>
              Monthly Performance - {monthPerformanceData?.year || new Date().getFullYear()}
            </Text>

            {monthPerformanceData && monthPerformanceData.data && monthPerformanceData.data.length > 0 ? (
              <>
                {/* Legend for monthly chart */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#00C950' }]} />
                    <Text style={styles.legendText}>Open</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                    <Text style={styles.legendText}>In Progress</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#6A7282' }]} />
                    <Text style={styles.legendText}>Closed</Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  style={styles.horizontalScrollView}
                >
                  <View style={{ width: monthChartWidth }}>
                    <LineChart
                      data={monthChartData}
                      width={monthChartWidth}
                      height={220}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: '4',
                          strokeWidth: '2',
                          stroke: '#fff'
                        },
                        formatYLabel: (yValue) => Math.round(Number(yValue)).toString(),
                      }}
                      bezier
                      style={styles.chart}
                      withVerticalLines={true}
                      withHorizontalLines={true}
                      withDots={true}
                      withShadow={false}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      fromZero={true}
                      yAxisInterval={1}
                      segments={5}
                      transparent={false}
                    />
                  </View>
                </ScrollView>
                
                {monthChartWidth > screenWidth && (
                  <Text style={styles.scrollHint}>← Swipe to see more →</Text>
                )}

                {/* Yearly Summary Stats */}
                {yearlyTotals && (
                  <View style={styles.chartStats}>
                    <View style={styles.statCard}>
                      <Text style={theme.typography.fontBodySmall}>Total Open</Text>
                      <Text style={[theme.typography.fontH6, { color: '#00C950' }]}>
                        {yearlyTotals.open}
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={theme.typography.fontBodySmall}>Total In Progress</Text>
                      <Text style={[theme.typography.fontH6, { color: '#FFA500' }]}>
                        {yearlyTotals.inProgress}
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={theme.typography.fontBodySmall}>Total Closed</Text>
                      <Text style={[theme.typography.fontH6, { color: '#6A7282' }]}>
                        {yearlyTotals.closed}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No monthly performance data available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </BodyLayout>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },
  chartContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  horizontalScrollView: {
    flexGrow: 0,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  statCard: {
    alignItems: 'center'
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
    flexWrap: 'wrap',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  scrollHint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 10,
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});