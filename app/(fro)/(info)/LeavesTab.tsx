import Card from "@/components/reusables/Card";
import { createLeave } from "@/features/fro/Attendance/leaves/applyLeave";
import { deleteLeave } from "@/features/fro/Attendance/leaves/deleteLeave";
import { getLeaveList } from "@/features/fro/Attendance/leaves/getLeaveList";
import { getLookupMasters } from "@/features/fro/getLookupMasters";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

/* ---------- CONSTANTS ---------- */
const FILTER_OPTIONS = ["All", "Awaiting", "Approved", "Declined"];

type StatusType = "All" | "Awaiting" | "Approved" | "Declined";

// Define leave list item type
type LeaveListItem = {
  id: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason: string;
  status: string;
};

// Define leave type from API
type LeaveType = {
  id: number;
  isEnabled: boolean;
  lookupType: string;
  name: string;
  value: string;
  valueInt: number;
};

// Status mapping
const getStatusDisplay = (status: string): string => {
  switch (status) {
    case "P":
      return "Awaiting";
    case "A":
      return "Approved";
    case "R":
      return "Declined";
    default:
      return "Awaiting";
  }
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate days between dates
const getDaysDifference = (fromDate: string, toDate: string): number => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Including both start and end dates
};

// Get title based on days
const getLeaveTitle = (fromDate: string, toDate: string): string => {
  const days = getDaysDifference(fromDate, toDate);
  if (days === 0.5) return "Half Day";
  if (days === 1) return "One Day";
  return `${days} Days`;
};

export default function LeavesTab() {
  const { theme } = useTheme();

  /* ---------- FILTER ---------- */
  const [filterStatus, setFilterStatus] = useState<StatusType>("All");
  const [showFilter, setShowFilter] = useState(false);

  /* ---------- APPLY LEAVE ---------- */
  const [leaveType, setLeaveType] = useState("");
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [cause, setCause] = useState("");

  /* ---------- DATE ---------- */
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);

  const fetchLeaveTypes = async () => {
    setLoadingLeaveTypes(true);
    try {
      const res = await getLookupMasters({
        lookupType: "LeaveType",
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      // console.log("LeaveType response:", res);

      if (res && Array.isArray(res)) {
        setLeaveTypes(res);
        // Set default leave type if available
        if (res.length > 0 && !leaveType) {
          setLeaveType(res[0].name);
        }
      }

    } catch (error) {
      console.error("❌ Failed to fetch Leave Types:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch leave types",
      });
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  /* ---------- LEAVE LIST ---------- */
  const [leaveList, setLeaveList] = useState<LeaveListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const authState = useAppSelector((state) => state.auth);

  const validateForm = () => {
    if (!leaveType) {
      Toast.show({
        type: "error",
        text1: "Please select leave type",
      });
      return false;
    }

    if (!cause.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter reason",
      });
      return false;
    }

    if (!fromDate) {
      Toast.show({
        type: "error",
        text1: "Please select from date",
      });
      return false;
    }

    if (!toDate) {
      Toast.show({
        type: "error",
        text1: "Please select to date",
      });
      return false;
    }

    return true;
  };



  const handleDelete = async (item: LeaveListItem) => {
    console.log("id", item.id);
    try {
      const fullName = `${authState?.firstName ?? ""} ${authState?.lastName ?? ""}`.trim();


      const payload = {
        id: item.id, // ✅ correct id
        deletedBy: String(authState.userId),
        deletedByName: fullName, // ✅ correct name
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      };

      console.log("🗑 Delete Payload:", payload);

      const res = await deleteLeave(payload);

      console.log("✅ Leave Deleted:", res);

      Toast.show({
        type: "success",
        text1: "Leave deleted successfully",
      });

      // refresh list instead of router.back()
      fetchLeaveList(1, true);

    } catch (error: any) {
      console.error("❌ Delete Error:", error);

      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Failed to delete leave",
      });
    }
  };

  const submitLeave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const fullName = `${authState?.firstName ?? ""} ${authState?.lastName ?? ""}`.trim();

    const payload = {
      leaveType: leaveType,
      fromDate: fromDate?.toISOString() || new Date().toISOString(),
      toDate: toDate?.toISOString() || new Date().toISOString(),
      reason: cause.trim(),
      userId: String(authState.userId),
      createdBy: String(authState.userId),
      createdByName: fullName,
      token: String(authState.token),
      csrfToken: String(authState.antiforgeryToken),
    };

    console.log("📤 Leave Payload:", payload);

    try {
      const res = await createLeave(payload);

      console.log("✅ Leave created:", res);

      Toast.show({
        type: "success",
        text1: "Leave applied successfully",
      });

      resetForm();
      fetchLeaveList(1, true);

    } catch (error: any) {
      console.error("❌ Error creating leave:", error);

      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Failed to apply leave",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setLeaveType(leaveTypes.length > 0 ? leaveTypes[0].name : "");
    setCause("");
    setFromDate(null);
    setToDate(null);
  };

  const fetchLeaveList = async (page: number = 1, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    }

    try {
      const res = await getLeaveList({
        PageNumber: 1,
        PageSize: 10,
        Userid: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken)
      });

      // console.log("Leave List:", res?.data);

      if (res?.data?.leaveList) {
        if (reset || page === 1) {
          setLeaveList(res.data.leaveList);
        } else {
          setLeaveList(prev => [...prev, ...res.data.leaveList]);
        }

        setTotalRecords(res.data.totalRecords || 0);
        setHasMore(res.data.leaveList.length === 10);
      }

    } catch (error) {
      console.log("Error fetching leave list:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch leave list",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaveList(1, true);
      fetchLeaveTypes();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPageNumber(1);
    fetchLeaveList(1, true);
    fetchLeaveTypes();
  }, []);

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchLeaveList(nextPage, false);
    }
  };

  // Filter leave list based on selected status
  const getFilteredLeaveList = () => {
    if (filterStatus === "All") {
      return leaveList;
    }

    const statusCode = filterStatus === "Awaiting" ? "P"
      : filterStatus === "Approved" ? "A"
        : "R";

    return leaveList.filter(item => item.status === statusCode);
  };

  const filteredLeaveList = getFilteredLeaveList();

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.colorPrimary500} />
        <Text style={[styles.footerText, { color: theme.colors.colorTextSecondary }]}>
          Loading more...
        </Text>
      </View>
    );
  };

  // Get leave type names for bottom sheet
  const getLeaveTypeNames = (): string[] => {
    return leaveTypes.map(type => type.name);
  };

  // Debug effect
  useEffect(() => {
    // console.log("Current leaveTypes state:", leaveTypes);
    console.log("Available options:", getLeaveTypeNames());
  }, [leaveTypes]);

  return (
    <Card
      title="Apply Leave"
      backgroundColor={theme.colors.colorBgPage}
      titleColor={theme.colors.colorPrimary600}
    >
      {/* ---------- APPLY LEAVE FORM ---------- */}
      <View style={styles.formCard}>
        {/* TYPE */}
        <TouchableOpacity
          style={[
            styles.formRow,
            { borderBottomColor: theme.colors.border },
          ]}
          onPress={() => setShowTypeSheet(true)}
          disabled={loadingLeaveTypes}
        >
          <Ionicons
            name="grid-outline"
            size={18}
            color={theme.colors.colorPrimary500}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.formLabel,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              Leave Type
            </Text>
            {loadingLeaveTypes ? (
              <ActivityIndicator size="small" color={theme.colors.colorPrimary500} />
            ) : (
              <Text
                style={[
                  styles.formValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {leaveType || "Select leave type"}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-down"
            size={18}
            color={theme.colors.colorTextTertiary}
          />
        </TouchableOpacity>

        {/* CAUSE */}
        <View
          style={[
            styles.inputRow,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={theme.colors.colorPrimary500}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.formLabel,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              Reason
            </Text>
            <TextInput
              placeholder="Enter reason for leave"
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={cause}
              onChangeText={setCause}
              style={[
                styles.textInput,
                {
                  color: theme.colors.inputText,
                },
              ]}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* FROM */}
        <TouchableOpacity
          style={[
            styles.formRow,
            { borderBottomColor: theme.colors.border },
          ]}
          onPress={() => setShowFromPicker(true)}
        >
          <Ionicons
            name="arrow-forward-outline"
            size={18}
            color={theme.colors.colorPrimary500}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.formLabel,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              From Date
            </Text>
            <Text
              style={[
                styles.formValue,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {fromDate ? fromDate.toDateString() : "Select date"}
            </Text>
          </View>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.colorTextTertiary}
          />
        </TouchableOpacity>

        {/* TO */}
        <TouchableOpacity
          style={[
            styles.formRow,
            { borderBottomColor: theme.colors.border },
          ]}
          onPress={() => fromDate && setShowToPicker(true)}
        >
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color={theme.colors.colorPrimary500}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.formLabel,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              To Date
            </Text>
            <Text
              style={[
                styles.formValue,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {toDate ? toDate.toDateString() : "Select date"}
            </Text>
          </View>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.colorTextTertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.applyBtn,
            {
              backgroundColor: isSubmitting
                ? theme.colors.btnDisabledBg
                : theme.colors.btnPrimaryBg,
              shadowColor: theme.colors.colorShadow,
            },
          ]}
          onPress={submitLeave}
          disabled={isSubmitting || loadingLeaveTypes}
        >
          <Text
            style={[
              styles.applyBtnText,
              {
                color: isSubmitting
                  ? theme.colors.btnDisabledText
                  : theme.colors.btnPrimaryText,
              },
            ]}
          >
            {isSubmitting ? "Applying..." : "Apply Leave"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- LEAVE HISTORY ---------- */}
      <View style={styles.historyHeader}>
        <Text
          style={[styles.sectionTitle, { color: theme.colors.colorPrimary600 }]}
        >
          Leave History {totalRecords > 0 && `(${totalRecords})`}
        </Text>
        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <Ionicons
            name="filter-outline"
            size={20}
            color={theme.colors.colorPrimary500}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.colorPrimary500} />
          <Text style={[styles.loadingText, { color: theme.colors.colorTextSecondary }]}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLeaveList}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.colorPrimary500]}
              tintColor={theme.colors.colorPrimary500}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={theme.colors.colorTextTertiary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.colorTextSecondary }]}>
                No leave history found
              </Text>
            </View>
          }
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View
              style={[
                styles.historyCard,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  shadowColor: theme.colors.colorShadow,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.historyTitle,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {getLeaveTitle(item.fromDate, item.toDate)}
                </Text>
                <Text
                  style={[
                    styles.historyDate,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                </Text>
                <Text
                  style={[
                    styles.historyType,
                    { color: theme.colors.colorPrimary500 },
                  ]}
                >
                  {item.leaveType} • {item.reason}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <StatusBadge status={getStatusDisplay(item.status)} />

                {item.status === "P" && (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity onPress={() => {
                      router.push({
                        pathname: "/(fro)/(info)/EditLeave",
                        params: {
                          leave: JSON.stringify(item),
                        },
                      });
                    }}>
                      <Ionicons name="create-outline" size={22} color={theme.colors.colorPrimary500} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                      handleDelete(item)
                    }}>
                      <Ionicons name="trash-outline" size={22} color={theme.colors.validationErrorText} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* ---------- FILTER BOTTOM SHEET ---------- */}
      <BottomSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        options={FILTER_OPTIONS}
        selectedOption={filterStatus}
        onSelect={(v: any) => {
          setFilterStatus(v as StatusType);
          setShowFilter(false);
        }}
      />

      {/* ---------- TYPE BOTTOM SHEET ---------- */}
      <BottomSheet
        visible={showTypeSheet}
        onClose={() => setShowTypeSheet(false)}
        options={getLeaveTypeNames()}
        selectedOption={leaveType}
        onSelect={(v: any) => {
          setLeaveType(v);
          setShowTypeSheet(false);
        }}
      />

      {/* ---------- DATE PICKERS ---------- */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(e, d) => {
            setShowFromPicker(false);
            if (d) {
              setFromDate(d);
              setToDate(null);
            }
          }}
        />
      )}

      {showToPicker && fromDate && (
        <DateTimePicker
          value={toDate ?? fromDate}
          mode="date"
          minimumDate={fromDate}
          onChange={(e, d) => {
            setShowToPicker(false);
            if (d) setToDate(d);
          }}
        />
      )}
    </Card>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

const BottomSheet = ({ visible, onClose, options, selectedOption, onSelect }: any) => {
  const { theme } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: theme.colors.colorOverlay }]}
        onPress={onClose}
        activeOpacity={1}
      />
      <View
        style={[styles.sheet, { backgroundColor: theme.colors.colorBgSurface }]}
      >
        {options.map((opt: string) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.sheetItem,
              opt === selectedOption && {
                backgroundColor: theme.colors.colorPrimary100
              }
            ]}
            onPress={() => onSelect(opt)}
          >
            <Text
              style={[
                styles.sheetText,
                { color: theme.colors.colorTextPrimary },
                opt === selectedOption && {
                  color: theme.colors.colorPrimary500,
                  fontFamily: 'Poppins-SemiBold'
                }
              ]}
            >
              {opt}
            </Text>
            {opt === selectedOption && (
              <Ionicons
                name="checkmark"
                size={20}
                color={theme.colors.colorPrimary500}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const { theme } = useTheme();

  const bg =
    status === "Approved"
      ? theme.colors.validationSuccessBg
      : status === "Declined"
        ? theme.colors.validationErrorBg
        : theme.colors.validationWarningBg;

  const color =
    status === "Approved"
      ? theme.colors.validationSuccessText
      : status === "Declined"
        ? theme.colors.validationErrorText
        : theme.colors.validationWarningText;

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: 12, fontFamily: 'Poppins-Medium' }}>
        {status}
      </Text>
    </View>
  );
};

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  formCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  formLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  formValue: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: 'Poppins-Medium',
  },
  textInput: {
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
  },
  applyBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyBtnText: {
    fontWeight: "600",
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  historyCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    justifyContent: "space-between",
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  historyDate: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  historyType: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: 'Poppins-Medium',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "center",
  },
  overlay: {
    flex: 1,
  },
  sheet: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: "absolute",
    bottom: 45,
    left: 0,
    right: 0,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  sheetItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  sheetText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});