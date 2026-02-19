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

  /* ---------------- 4 TABS ---------------- */
  const tabs = [
    { label: "All", key: "all", displayKey: "all" },
    { label: "Open", key: "open", displayKey: "Open" },
    { label: "In Progress", key: "inProgress", displayKey: "In-Progress" },
    { label: "Closed", key: "closed", displayKey: "Closed" },
  ];

  // console.log("param", params);

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
      // setShowPopUp(true);
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
    }
  };

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
    // console.log("Filtering data with key:", selectedFilterKey);
    // console.log("Total interactions:", interactions.length);

    if (selectedFilterKey === "all") {
      // console.log("Showing all Tasks");
      return interactions;
    }

    const filtered = interactions.filter((item) => {
      // Get the case status from backend
      const Taskstatus = item.TaskstatusName || "";
      // console.log(
      //   `Item ${item.transactionNumber}: TaskstatusName="${Taskstatus}"`,
      // );

      // For Open tab, check if it's "Open" (case-insensitive)
      if (selectedFilterKey === "open") {
        return Taskstatus.toLowerCase() === "open";
      }

      // For In Progress tab, check if it's "In-Progress" (case-insensitive)
      if (selectedFilterKey === "inProgress") {
        return Taskstatus.toLowerCase() === "in-progress";
      }

      // For Closed tab, check if it's "Closed" (case-insensitive)
      if (selectedFilterKey === "closed") {
        return Taskstatus.toLowerCase() === "closed";
      }

      return false;
    });

    // console.log(`Filtered to ${filtered.length} items`);
    return filtered;
  }, [interactions, selectedFilterKey]);

  const statusColors: Record<string, string> = {
    Open: "#00C950",
    "In-Progress": "#F57C00",
    "In Progress": "#F57C00",
    Closed: "#6A7282",
  };

  const getDisplayStatus = (TaskstatusName: string) => {
    return STATUS_DISPLAY_MAP[TaskstatusName] || TaskstatusName;
  };

  const getStatusColor = (TaskstatusName: string) => {
    // First get the display status name
    const displayStatus = getDisplayStatus(TaskstatusName);

    // Get color based on display status (case-insensitive)
    const statusKey = Object.keys(statusColors).find(
      (key) => key.toLowerCase() === displayStatus.toLowerCase(),
    );
    return statusKey ? statusColors[statusKey] : "#6A7282"; // Default gray
  };

  /* ================= UI ================= */

  return (
    <BodyLayout type="screen" screenName={t("Tasks.screenTitle")}>
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
                // console.log(`Tab clicked: ${tab.key} (${tab.displayKey})`);
                setActiveTab(index);
              }}
              style={[
                styles.tab,
                { backgroundColor: theme.colors.colorBgPage },
                activeTab === index && {
                  backgroundColor: theme.colors.colorPrimary600,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.colors.colorTextSecondary },
                  activeTab === index && {
                    color: theme.colors.colorBgPage,
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
      >
        {filteredData.map((item, idx) => {
          const displayStatus = getDisplayStatus(item.TaskstatusName);
          const statusColor = getStatusColor(item.TaskstatusName);

          return (
            <View
              key={idx}
              style={[
                styles.card,
                { backgroundColor: theme.colors.colorBgPage },
              ]}
            >
              <View style={styles.rowBetween}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.colors.colorPrimary600 },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {t("Tasks.ticket")}: {item.transactionNumber || "-"}
                </Text>

                <View
                  style={[styles.tagBadge, { backgroundColor: statusColor }]}
                >
                  <Text style={styles.tagText}>{displayStatus}</Text>
                </View>
              </View>

              <View style={styles.infoContainer}>
                <Text style={[styles.cardText, styles.infoText]}>
                  {item.name || "Unnamed Case"}
                </Text>
                <Text style={[styles.cardText, styles.infoText]}>
                  {t("Tasks.age")}: {item.age || "-"}
                </Text>
                <Text style={[styles.cardText, styles.infoText]}>
                  {t("Tasks.category")}: {item.categoryName || "-"}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <RemixIcon name="map-pin-line" size={moderateScale(16)} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.districtName || "-"}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <RemixIcon name="time-line" size={moderateScale(16)} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.createdDate
                      ? new Date(item.createdDate).toLocaleString()
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
                <Text style={styles.actionBtnText}>{t("Tasks.viewCase")}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Empty state */}
        {filteredData.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              No {selectedFilterKey !== "all" ? selectedFilterKey : ""} Tasks
              found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ---------------- MODALS (UNCHANGED) ---------------- */}
      <NewCasePopupModal
        visible={showPopUp}
        name="New Case Assigned"
        age={72}
        timerSeconds={30}
        details={[{ label: "Ticket Number:", value: "Auto Assigned" }]}
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
        title="Case Accepted"
        iconName="check-line"
        iconColor="#00796B"
        iconBgColor="#E0F2F1"
        autoCloseAfter={2000}
        onClose={() => setShowStatusModal(false)}
      />

      <StatusModal
        visible={showDeclinedStatusModal}
        title="Case Declined"
        iconName="check-line"
        iconColor={theme.colors.validationErrorText}
        iconBgColor={theme.colors.validationErrorText + "22"}
        autoCloseAfter={2000}
        onClose={() => setShowDeclinedStatusModal(false)}
        titleColor={theme.colors.colorAccent500}
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
        shadowColor: "#000",
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
    fontSize: moderateScale(15),
    fontWeight: "600",
    flex: 1,
    marginRight: moderateScale(8),
    lineHeight: moderateScale(20),
  },
  infoContainer: {
    marginBottom: verticalScale(6),
  },
  cardText: {
    fontSize: moderateScale(13),
    color: "#666",
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
    color: "#666",
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
  },
});
