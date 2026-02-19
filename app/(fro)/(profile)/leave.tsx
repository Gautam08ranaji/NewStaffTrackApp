import BodyLayout from "@/components/layout/BodyLayout";
import type { Theme } from "@/theme/ThemeContext";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* ---------- CONSTANTS ---------- */
const LEAVE_TYPES = ["Casual", "Sick", "Earned"];
const FILTER_OPTIONS = ["All", "Awaiting", "Approved", "Declined"];

/* ---------- LEAVE BALANCE ---------- */
const LEAVE_BALANCE = [
  { id: "1", title: "Sick", days: "5 Days" },
  { id: "2", title: "Earned Leaves", days: "8 Days" },
  { id: "3", title: "Casual Leaves", days: "3 Days" },
];

/* ---------- HISTORY ---------- */
const LEAVE_HISTORY = [
  {
    id: "1",
    title: "4 Days Application",
    date: "Monday, Aug 17, 2025",
    type: "Casual",
    status: "Awaiting",
  },
  {
    id: "2",
    title: "3 Days Application",
    date: "Wednesday, Aug 12, 2025",
    type: "Casual",
    status: "Declined",
  },
  {
    id: "3",
    title: "Half Day Application",
    date: "Wednesday, Aug 12, 2025",
    type: "Earned",
    status: "Approved",
  },
];

type StatusType = "All" | "Awaiting" | "Approved" | "Declined";

export default function LeavesScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  /* ---------- FILTER ---------- */
  const [filterStatus, setFilterStatus] = useState<StatusType>("All");
  const [showFilter, setShowFilter] = useState(false);

  const filteredHistory =
    filterStatus === "All"
      ? LEAVE_HISTORY
      : LEAVE_HISTORY.filter((i) => i.status === filterStatus);

  /* ---------- APPLY LEAVE ---------- */
  const [leaveType, setLeaveType] = useState("Casual");
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [cause, setCause] = useState("");

  /* ---------- DATE ---------- */
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  return (
    <BodyLayout type="screen" screenName="leaves">
      {/* ---------- BALANCE ---------- */}
      <View style={styles.balanceRow}>
        {LEAVE_BALANCE.map((item) => (
          <View key={item.id} style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>{item.title}</Text>
            <Text style={styles.balanceDays}>{item.days}</Text>
          </View>
        ))}
      </View>

      {/* ---------- APPLY LEAVE ---------- */}
      <Text style={styles.sectionTitle}>Apply Leave</Text>

      <View style={styles.formCard}>
        {/* TYPE */}
        <FormRow
          icon="grid-outline"
          label="Type"
          value={leaveType}
          rightIcon="chevron-down"
          onPress={() => setShowTypeSheet(true)}
        />

        {/* CAUSE */}
        <View style={styles.inputRow}>
          <Ionicons
            name="create-outline"
            size={18}
            color={theme.colors.colorPrimary500}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.formLabel}>Cause</Text>
            <TextInput
              placeholder="Enter reason"
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={cause}
              onChangeText={setCause}
              style={styles.textInput}
            />
          </View>
        </View>

        {/* FROM */}
        <FormRow
          icon="arrow-forward-outline"
          label="From"
          value={fromDate ? fromDate.toDateString() : "Select date"}
          rightIcon="calendar-outline"
          onPress={() => setShowFromPicker(true)}
        />

        {/* TO */}
        <FormRow
          icon="arrow-back-outline"
          label="To"
          value={toDate ? toDate.toDateString() : "Select date"}
          rightIcon="calendar-outline"
          onPress={() => fromDate && setShowToPicker(true)}
        />

        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyBtnText}>Apply Leave</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- HISTORY ---------- */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Leave History</Text>
        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <Ionicons
            name="filter-outline"
            size={20}
            color={theme.colors.colorPrimary500}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyType}>{item.type}</Text>
            </View>

            <StatusBadge status={item.status} />
          </View>
        )}
      />

      {/* ---------- FILTER BOTTOM SHEET ---------- */}
      <BottomSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        options={FILTER_OPTIONS}
        onSelect={(v: any) => {
          setFilterStatus(v as StatusType);
          setShowFilter(false);
        }}
      />

      {/* ---------- TYPE BOTTOM SHEET ---------- */}
      <BottomSheet
        visible={showTypeSheet}
        onClose={() => setShowTypeSheet(false)}
        options={LEAVE_TYPES}
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
    </BodyLayout>
  );
}

/* ---------- REUSABLE ---------- */

const FormRow = ({ icon, label, value, rightIcon, onPress }: any) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity onPress={onPress} style={styles.formRow}>
      <Ionicons name={icon} size={18} color={theme.colors.colorPrimary500} />
      <View style={{ flex: 1 }}>
        <Text style={styles.formLabel}>{label}</Text>
        <Text style={styles.formValue}>{value}</Text>
      </View>
      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={18}
          color={theme.colors.colorTextTertiary}
        />
      )}
    </TouchableOpacity>
  );
};

const BottomSheet = ({ visible, onClose, options, onSelect }: any) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableOpacity style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        {options.map((opt: string) => (
          <TouchableOpacity
            key={opt}
            style={styles.sheetItem}
            onPress={() => onSelect(opt)}
          >
            <Text style={styles.sheetText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

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
      <Text style={{ color, fontSize: 12 }}>{status}</Text>
    </View>
  );
};

/* ---------- STYLES ---------- */

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    balanceRow: { flexDirection: "row", marginBottom: 20, elevation: 3 },
    balanceCard: {
      flex: 1,
      marginHorizontal: 4,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.colorBgSurface,
      borderWidth: 1,
      borderColor: theme.colors.colorBorder,
    },
    balanceTitle: { fontSize: 12, color: theme.colors.colorTextTertiary },
    balanceDays: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 6,
      color: theme.colors.colorTextPrimary,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 10,
      color: theme.colors.colorHeadingH2,
    },
    formCard: {
      backgroundColor: theme.colors.colorBgSurface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      elevation: 3,
    },
    formRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.colorBorder,
    },
    inputRow: {
      flexDirection: "row",
      gap: 10,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.colorBorder,
    },
    formLabel: { fontSize: 12, color: theme.colors.colorTextTertiary },
    formValue: { fontSize: 14, marginTop: 2 },
    textInput: {
      fontSize: 14,
      color: theme.colors.inputText,
      paddingVertical: 4,
    },
    applyBtn: {
      marginTop: 16,
      backgroundColor: theme.colors.btnPrimaryBg,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    applyBtnText: {
      color: theme.colors.btnPrimaryText,
      fontWeight: "600",
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    historyCard: {
      flexDirection: "row",
      backgroundColor: theme.colors.colorBgSurface,
      padding: 14,
      borderRadius: 14,
      marginBottom: 10,
      justifyContent: "space-between",
      elevation: 3,
    },
    historyTitle: { fontSize: 14, fontWeight: "600" },
    historyDate: { fontSize: 12, color: theme.colors.colorTextSecondary },
    historyType: { fontSize: 12, color: theme.colors.colorPrimary500 },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: "center",
    },
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.colorOverlay,
    },
    sheet: {
      backgroundColor: theme.colors.colorBgSurface,
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    sheetItem: {
      paddingVertical: 14,
    },
    sheetText: {
      fontSize: 14,
      color: theme.colors.colorTextPrimary,
    },
  });
