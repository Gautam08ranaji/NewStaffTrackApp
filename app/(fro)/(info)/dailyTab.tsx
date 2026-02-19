import Card from "@/components/reusables/Card";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function DailyTab() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  /* ---------- FILTER ---------- */
  const [filterStatus, setFilterStatus] = useState<StatusType>("All");
  const [showFilter, setShowFilter] = useState(false);

  /* ---------- APPLY LEAVE ---------- */
  const [leaveType, setLeaveType] = useState("Casual");
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [cause, setCause] = useState("");

  /* ---------- DATE ---------- */
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const filteredHistory =
    filterStatus === "All"
      ? LEAVE_HISTORY
      : LEAVE_HISTORY.filter((i) => i.status === filterStatus);

  return (
    <Card
      title="Apply Leave"
      backgroundColor={theme.colors.colorBgPage}
      titleColor={theme.colors.colorPrimary600}
    >
      {/* ---------- LEAVE BALANCE ---------- */}
      <View style={styles.balanceRow}>
        {LEAVE_BALANCE.map((item) => (
          <View
            key={item.id}
            style={[
              styles.balanceCard,
              { backgroundColor: theme.colors.colorBgSurface },
            ]}
          >
            <Text
              style={[
                styles.balanceTitle,
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.balanceDays,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {item.days}
            </Text>
          </View>
        ))}
      </View>

      {/* ---------- APPLY LEAVE FORM ---------- */}
      <View style={styles.formCard}>
        {/* TYPE */}
        <TouchableOpacity
          style={[
            styles.formRow,
            { borderBottomColor: theme.colors.colorBorder },
          ]}
          onPress={() => setShowTypeSheet(true)}
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
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              Type
            </Text>
            <Text
              style={[
                styles.formValue,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {leaveType}
            </Text>
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
            { borderBottomColor: theme.colors.colorBorder },
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
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              Cause
            </Text>
            <TextInput
              placeholder="Enter reason"
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={cause}
              onChangeText={setCause}
              style={[
                styles.textInput,
                { color: theme.colors.colorTextPrimary },
              ]}
            />
          </View>
        </View>

        {/* FROM */}
        <TouchableOpacity
          style={[
            styles.formRow,
            { borderBottomColor: theme.colors.colorBorder },
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
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              From
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
            { borderBottomColor: theme.colors.colorBorder },
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
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              To
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
            { backgroundColor: theme.colors.btnPrimaryBg },
          ]}
        >
          <Text
            style={[
              styles.applyBtnText,
              { color: theme.colors.btnPrimaryText },
            ]}
          >
            Apply Leave
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- LEAVE HISTORY ---------- */}
      <View style={styles.historyHeader}>
        <Text
          style={[styles.sectionTitle, { color: theme.colors.colorPrimary600 }]}
        >
          Leave History
        </Text>
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
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.historyCard,
              { backgroundColor: theme.colors.colorBgSurface },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.historyTitle,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.historyDate,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.date}
              </Text>
              <Text
                style={[
                  styles.historyType,
                  { color: theme.colors.colorPrimary500 },
                ]}
              >
                {item.type}
              </Text>
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
    </Card>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

const BottomSheet = ({ visible, onClose, options, onSelect }: any) => {
  const { theme } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: theme.colors.colorOverlay }]}
        onPress={onClose}
      />
      <View
        style={[styles.sheet, { backgroundColor: theme.colors.colorBgSurface }]}
      >
        {options.map((opt: string) => (
          <TouchableOpacity
            key={opt}
            style={styles.sheetItem}
            onPress={() => onSelect(opt)}
          >
            <Text
              style={[
                styles.sheetText,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {opt}
            </Text>
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
      <Text style={{ color, fontSize: 12 }}>{status}</Text>
    </View>
  );
};

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  balanceRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  balanceCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  balanceTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceDays: {
    fontSize: 16,
    fontWeight: "600",
  },
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
  },
  formValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  textInput: {
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  applyBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyBtnText: {
    fontWeight: "600",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyType: {
    fontSize: 12,
    fontWeight: "500",
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
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetItem: {
    paddingVertical: 14,
  },
  sheetText: {
    fontSize: 14,
    textAlign: "center",
  },
});
