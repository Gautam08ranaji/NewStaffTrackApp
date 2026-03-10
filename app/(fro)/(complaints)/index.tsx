import BodyLayout from "@/components/layout/BodyLayout";
import NewCasePopupModal from "@/components/reusables/NewCasePopupModal";
import StatusModal from "@/components/reusables/StatusModal";
import { getInteractionsListByAssignToId } from "@/features/fro/interactionApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const { width, height } = Dimensions.get("window");

/* ================= RESPONSIVE SCALING ================= */
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/* ================= STATUS MAPPING ================= */
// Define the mapping between backend statuses and display statuses
const STATUS_DISPLAY_MAP: Record<string, string> = {
  Open: "Open",
  "In-Progress": "In Progress", // Map backend "In-Progress" to display "In Progress"
  Closed: "Closed",
};

// Helper function to safely get status from your actual data structure
const getSafeStatus = (item: any): string => {
  // Check all possible status field names
  return item?.statusName || item?.TaskstatusName || item?.caseStatusName || "";
};

// Helper function to get display status
const getDisplayStatus = (statusName: string): string => {
  if (!statusName) return "Unknown";
  return STATUS_DISPLAY_MAP[statusName] || statusName;
};

// Helper function to get status color from theme
const getStatusColor = (theme: any, statusName: string): string => {
  if (!statusName) return theme.colors.colorTextTertiary;

  const statusLower = statusName.toLowerCase();
  
  if (statusLower.includes("open")) {
    return theme.colors.colorSuccess600; // Green for Open
  } else if (statusLower.includes("progress")) {
    return theme.colors.colorWarning600; // Orange for In-Progress
  } else if (statusLower.includes("closed")) {
    return theme.colors.colorTextTertiary; // Gray for Closed
  }
  
  return theme.colors.colorTextTertiary;
};

export default function TasksScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const authState = useAppSelector((state) => state.auth);

  /* ---------------- MODAL STATES ---------------- */
  const [showPopUp, setShowPopUp] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeclinedStatusModal, setShowDeclinedStatusModal] = useState(false);

  /* ---------------- DATA STATE ---------------- */
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------- 4 TABS ---------------- */
  const tabs = [
    { label: t("tasks.tabs.all") || "All", key: "all", displayKey: "all" },
    { label: t("tasks.tabs.open") || "Open", key: "open", displayKey: "Open" },
    {
      label: t("tasks.tabs.inProgress") || "In-progress",
      key: "inProgress",
      displayKey: "In-Progress",
    },
    { label: t("tasks.tabs.closed") || "Closed", key: "closed", displayKey: "Closed" },
  ];

  const initialTabIndex = tabs.findIndex((t) => t.key === params.filter);
  const [activeTab, setActiveTab] = useState(
    initialTabIndex !== -1 ? initialTabIndex : 0,
  );

  const scrollRef = useRef<ScrollView>(null);
  const tabRefs = useRef<(View | null)[]>([]);

  /* ---------------- FETCH DATA ---------------- */

  useFocusEffect(
    useCallback(() => {
      fetchInteractions();
    }, []),
  );

  const fetchInteractions = async () => {
    try {
      setLoading(true);

      const res = await getInteractionsListByAssignToId({
        assignToId: String(authState.userId),
        pageNumber: 1,
        pageSize: 100,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("Fetched interactions:", res?.data?.interactions);
      setInteractions(res?.data?.interactions || []);
    } catch (error) {
      console.error("❌ Failed to fetch Tasks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInteractions();
  }, []);

  /* ---------------- SYNC TAB FROM ROUTE ---------------- */

  useEffect(() => {
    const index = tabs.findIndex((t) => t.key === params.filter);
    if (index !== -1) setActiveTab(index);
  }, [params.filter]);

  /* ---------------- AUTO SCROLL TAB ---------------- */

  useEffect(() => {
    const tabEl = tabRefs.current[activeTab];
    const scrollEl = scrollRef.current;

    if (tabEl && scrollEl) {
      (tabEl as any).measureLayout(
        scrollEl as any,
        (x: number) => {
          scrollEl.scrollTo({ x: x - width / 3, animated: true });
        },
        () => {},
      );
    }
  }, [activeTab]);

  /* ---------------- FILTER DATA ---------------- */

  const selectedFilterKey = tabs[activeTab].key;

  const filteredData = useMemo(() => {
    if (selectedFilterKey === "all") {
      return interactions;
    }

    return interactions.filter((item) => {
      const status = getSafeStatus(item);
      
      // Convert to lowercase for case-insensitive comparison
      const statusLower = status.toLowerCase();

      switch (selectedFilterKey) {
        case "open":
          return statusLower === "open";
        case "inProgress":
          return statusLower === "in-progress" || 
                 statusLower === "inprogress" || 
                 statusLower === "in progress";
        case "closed":
          return statusLower === "closed";
        default:
          return false;
      }
    });
  }, [interactions, selectedFilterKey]);

  /* ================= UI ================= */

  const renderTaskCard = (item: any, index: number) => {
    const statusName = getSafeStatus(item);
    const displayStatus = getDisplayStatus(statusName);
    const statusColor = getStatusColor(theme, statusName);

    return (
      <View
        key={index}
        style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.colorBgSurface,
            ...Platform.select({
              ios: {
                shadowColor: theme.colors.colorShadow,
              },
            }),
          }
        ]}
      >
        <View style={styles.rowBetween}>
          <Text
            style={[
              theme.typography.fontH6,
              styles.cardTitle, 
              { color: theme.colors.colorPrimary600 }
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {t("tasks.taskNo") || "Task No"}: {item.transactionNumber || "-"}
          </Text>

          <View style={[styles.tagBadge, { backgroundColor: statusColor }]}>
            <Text style={[theme.typography.fontBodySmall, styles.tagText]}>
              {displayStatus}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[theme.typography.fontBodyRegular, styles.cardText, { color: theme.colors.colorTextSecondary }]}>
            {item.name || t("tasks.unnamedCase")}
          </Text>
          <Text style={[theme.typography.fontBodyRegular, styles.cardText, styles.infoText, { color: theme.colors.colorTextSecondary }]}>
            {t("tasks.category")}: {item.categoryName || "-"}
          </Text>
          <Text style={[theme.typography.fontBodyRegular, styles.cardText, styles.infoText, { color: theme.colors.colorTextSecondary }]}>
            {t("tasks.priority")}: {item.priority || "-"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <RemixIcon
              name="map-pin-line"
              size={moderateScale(16)}
              color={theme.colors.colorTextSecondary}
            />
            <Text style={[theme.typography.fontBodySmall, styles.metaText, { color: theme.colors.colorTextSecondary }]} numberOfLines={1}>
              {item.districtName || "-"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <RemixIcon 
              name="time-line" 
              size={moderateScale(16)} 
              color={theme.colors.colorTextSecondary} 
            />
            <Text style={[theme.typography.fontBodySmall, styles.metaText, { color: theme.colors.colorTextSecondary }]} numberOfLines={1}>
              {item.createdDate
                ? new Date(item.createdDate).toLocaleString(t('common.locale') || 'default')
                : "-"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: theme.colors.colorPrimary600 },
          ]}
          onPress={() =>
            router.push({
              pathname: "/CaseDetailScreen",
              params: { item: JSON.stringify(item) },
            })
          }
        >
          <Text style={[theme.typography.fontButton, styles.actionBtnText]}>
            {t("tasks.viewTask") || "View Task"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <RemixIcon
        name="inbox-line"
        size={moderateScale(48)}
        color={theme.colors.colorTextTertiary}
      />
      <Text
        style={[
          theme.typography.fontBodyRegular,
          styles.emptyText, 
          { color: theme.colors.colorTextSecondary }
        ]}
      >
        {selectedFilterKey !== "all"
          ? `${t("tasks.noTasksFound") || "No"} ${tabs[activeTab].label} ${t("tasks.tasksFound") || "tasks found"}`
          : t("tasks.noTasks") || "No tasks found"}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Text
        style={[
          theme.typography.fontBodyRegular,
          styles.loadingText, 
          { color: theme.colors.colorTextSecondary }
        ]}
      >
        {t("common.loading") || "Loading..."}
      </Text>
    </View>
  );

  return (
    <BodyLayout type="screen" screenName={t("tasks.screenTitle")}>
      {/* ---------------- TABS (4 TABS) ---------------- */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              ref={(el: any) => (tabRefs.current[index] = el)}
              onPress={() => {
                setActiveTab(index);
              }}
              style={[
                styles.tab,
                { 
                  backgroundColor: activeTab === index 
                    ? theme.colors.colorPrimary600 
                    : theme.colors.colorBgAlt,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.fontBodyRegular,
                  styles.tabText,
                  { 
                    color: activeTab === index 
                      ? theme.colors.colorTextInverse 
                      : theme.colors.colorTextSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ---------------- CASE LIST ---------------- */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.colorPrimary600]}
            tintColor={theme.colors.colorPrimary600}
          />
        }
      >
        {loading && !refreshing
          ? renderLoadingState()
          : filteredData.length > 0
            ? filteredData.map(renderTaskCard)
            : renderEmptyState()}
      </ScrollView>

      {/* ---------------- MODALS ---------------- */}
      <NewCasePopupModal
        visible={showPopUp}
        name={t("tasks.newTaskAssigned") || "New Task Assigned"}
        age={72}
        timerSeconds={30}
        details={[{ 
          label: t("tasks.ticketNumber") || "Ticket Number:", 
          value: t("tasks.autoAssigned") || "Auto Assigned" 
        }]}
        onAccept={() => {
          setShowPopUp(false);
          setShowStatusModal(true);
        }}
        onDeny={() => {
          setShowPopUp(false);
          setShowRemarkModal(true);
        }}
      />

      <StatusModal
        visible={showStatusModal}
        title={t("tasks.taskAccepted") || "Task Accepted"}
        iconName="check-line"
        iconColor={theme.colors.colorSuccess600}
        iconBgColor={theme.colors.colorSuccess100}
        autoCloseAfter={2000}
        onClose={() => setShowStatusModal(false)}
      />

      <StatusModal
        visible={showDeclinedStatusModal}
        title={t("tasks.taskDeclined") || "Task Declined"}
        iconName="close-line"
        iconColor={theme.colors.colorError600}
        iconBgColor={theme.colors.colorError100}
        autoCloseAfter={2000}
        onClose={() => setShowDeclinedStatusModal(false)}
        titleColor={theme.colors.colorError600}
      />
    </BodyLayout>
  );
}

/* ---------------- RESPONSIVE STYLES ---------------- */

const styles = StyleSheet.create({
  tabsWrapper: {
    marginTop: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  tabContainer: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    minHeight: verticalScale(44),
  },
  tab: {
    height: moderateScale(36),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(6),
    justifyContent: "center",
    alignItems: "center",
    minWidth: moderateScale(65),
  },
  tabText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    textAlign: "center",
  },

  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: moderateScale(14),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(24),
  },
  card: {
    width: width - moderateScale(28),
    alignSelf: "center",
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(10),
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(6),
  },
  cardTitle: {
    flex: 1,
    marginRight: moderateScale(8),
    lineHeight: moderateScale(20),
  },
  infoContainer: {
    marginBottom: verticalScale(6),
  },
  cardText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  infoText: {
    marginBottom: verticalScale(3),
  },
  tagBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(16),
    minWidth: moderateScale(65),
    alignItems: "center",
  },
  tagText: {
    color: "#fff",
    fontSize: moderateScale(11),
    fontWeight: "600",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: verticalScale(6),
    marginBottom: verticalScale(8),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: moderateScale(14),
    marginBottom: verticalScale(2),
    flex: 1,
    minWidth: width * 0.35,
  },
  metaText: {
    marginLeft: moderateScale(5),
    fontSize: moderateScale(12),
    flex: 1,
  },
  actionBtn: {
    marginTop: verticalScale(8),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionBtnText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: moderateScale(15),
    textAlign: "center",
    marginTop: verticalScale(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    fontSize: moderateScale(15),
    textAlign: "center",
  },
});