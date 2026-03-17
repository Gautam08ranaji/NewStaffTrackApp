import BodyLayout from "@/components/layout/BodyLayout";
import Card from "@/components/reusables/Card";
// import { getLeaveDetails } from "@/features/fro/Attendance/leaves/getLeaveList";
import { updateLeave } from "@/features/fro/Attendance/leaves/updateLeave";
import { getLookupMasters } from "@/features/fro/getLookupMasters";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";

// Define leave type from API
type LeaveType = {
  id: number;
  isEnabled: boolean;
  lookupType: string;
  name: string;
  value: string;
  valueInt: number;
};

type LeaveDetails = {
  id: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason: string;
  status: string;
};

export default function UpdateLeave() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  console.log(params,"param");
  
  const leaveData = params.leave ? JSON.parse(params.leave as string) : null;

  /* ---------- LEAVE DETAILS ---------- */
  const [leaveDetails, setLeaveDetails] = useState<LeaveDetails | null>(leaveData);
  const [loadingDetails, setLoadingDetails] = useState(!leaveData);

  /* ---------- FORM FIELDS ---------- */
  const [leaveType, setLeaveType] = useState(leaveData?.leaveType || "");
  const [cause, setCause] = useState(leaveData?.reason || "");
  const [fromDate, setFromDate] = useState<Date | null>(
    leaveData?.fromDate ? new Date(leaveData.fromDate) : null
  );
  const [toDate, setToDate] = useState<Date | null>(
    leaveData?.toDate ? new Date(leaveData.toDate) : null
  );

  /* ---------- UI STATE ---------- */
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);

  const authState = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchLeaveTypes();
    if (!leaveData) {
    //   fetchLeaveDetails();
    }
  }, []);

//   const fetchLeaveDetails = async () => {
//     setLoadingDetails(true);
//     try {
//       const res = await getLeaveDetails({
//         leaveId: params.id as string,
//         token: String(authState.token),
//         csrfToken: String(authState.antiforgeryToken),
//       });

//       console.log("Leave Details:", res);

//       if (res?.data) {
//         setLeaveDetails(res.data);
//         setLeaveType(res.data.leaveType);
//         setCause(res.data.reason);
//         setFromDate(new Date(res.data.fromDate));
//         setToDate(new Date(res.data.toDate));
//       }

//     } catch (error) {
//       console.error("❌ Failed to fetch leave details:", error);
//       Toast.show({
//         type: "error",
//         text1: "Failed to fetch leave details",
//       });
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

  const fetchLeaveTypes = async () => {
    setLoadingLeaveTypes(true);
    try {
      const res = await getLookupMasters({
        lookupType: "LeaveType",
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("LeaveType response:", res);

      if (res && Array.isArray(res)) {
        setLeaveTypes(res);
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

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const fullName = `${authState?.firstName ?? ""} ${authState?.lastName ?? ""}`.trim();

    const payload = {
      id: leaveDetails?.id || params.id,
      leaveType: leaveType,
      fromDate: fromDate?.toISOString() || new Date().toISOString(),
      toDate: toDate?.toISOString() || new Date().toISOString(),
      reason: cause.trim(),
      status: leaveDetails?.status || "P",
      userId: String(authState.userId),
      modifiedBy: String(authState.userId),
      modifiedByName: fullName,
      token: String(authState.token),
      csrfToken: String(authState.antiforgeryToken),
    };

    console.log("📤 Update Leave Payload:", payload);

    try {
      const res = await updateLeave(payload);

      console.log("✅ Leave updated:", res);

      Toast.show({
        type: "success",
        text1: "Leave updated successfully",
      });

      router.back();

    } catch (error: any) {
      console.error("❌ Error updating leave:", error);

      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Failed to update leave",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Get leave type names for bottom sheet
  const getLeaveTypeNames = (): string[] => {
    return leaveTypes.map(type => type.name);
  };

  if (loadingDetails) {
    return (
      <Card
        title="Update Leave"
        backgroundColor={theme.colors.colorBgPage}
        titleColor={theme.colors.colorPrimary600}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.colorPrimary500} />
          <Text style={[styles.loadingText, { color: theme.colors.colorTextSecondary }]}>
            Loading leave details...
          </Text>
        </View>
      </Card>
    );
  }

  return (

    <BodyLayout type="screen" screenName="Update Leave">
  <Card
      title="Update Leave"
      backgroundColor={theme.colors.colorBgPage}
      titleColor={theme.colors.colorPrimary600}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ---------- UPDATE LEAVE FORM ---------- */}
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

          {/* ACTION BUTTONS */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                {
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.colorShadow,
                },
              ]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.updateBtn,
                {
                  backgroundColor: isSubmitting
                    ? theme.colors.btnDisabledBg
                    : theme.colors.btnPrimaryBg,
                  shadowColor: theme.colors.colorShadow,
                },
              ]}
              onPress={handleUpdate}
              disabled={isSubmitting || loadingLeaveTypes}
            >
              <Text
                style={[
                  styles.updateBtnText,
                  {
                    color: isSubmitting
                      ? theme.colors.btnDisabledText
                      : theme.colors.btnPrimaryText,
                  },
                ]}
              >
                {isSubmitting ? "Updating..." : "Update Leave"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------- LEAVE SUMMARY CARD ---------- */}
        {leaveDetails && (
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.colorBgSurface,
                shadowColor: theme.colors.colorShadow,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              Leave Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.colorTextSecondary }]}>
                Leave ID
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.colorTextPrimary }]}>
                {leaveDetails.id}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.colorTextSecondary }]}>
                Current Status
              </Text>
              <StatusBadge status={getStatusDisplay(leaveDetails.status)} />
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.colorTextSecondary }]}>
                Original Dates
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.colorTextPrimary }]}>
                {new Date(leaveDetails.fromDate).toLocaleDateString()} - {new Date(leaveDetails.toDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.noteContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={theme.colors.colorPrimary500}
              />
              <Text style={[styles.noteText, { color: theme.colors.colorTextSecondary }]}>
                You can only update leave details when status is "Awaiting"
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

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
              // If new from date is after current to date, reset to date
              if (toDate && d > toDate) {
                setToDate(null);
              }
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
    </BodyLayout>
  
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

// Status mapping helper
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  updateBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateBtnText: {
    fontWeight: "600",
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelBtnText: {
    fontWeight: "500",
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: 'Poppins-Medium',
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});