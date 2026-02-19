import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const caseTabs = [
  { label: "All" },
  { label: "New" },
  { label: "Assigned" },
  { label: "In Progress" },
];

const dateFilters = [
  "All",
  "Today",
  "Yesterday",
  "Weekly",
  "Monthly",
  "Last 3 Months",
];

const caseData = [
  {
    id: 1,
    name: "Ram Prasad Sharma",
    age: 75,
    ticket: "TKT-14567-001",
    category: "Medical Emergency",
    status: "New",
    priority: "High",
    location: "Lucknow, UP",
    time: "5 min ago",
    assigned: null,
    tat: "10 min remaining",
    tatStatus: "danger",
    date: "2025-12-10",
  },
  {
    id: 2,
    name: "Sita Devi",
    age: 68,
    ticket: "TKT-14567-002",
    category: "Pension Support",
    status: "Assigned",
    priority: "Medium",
    location: "Kanpur, UP",
    time: "15 min ago",
    assigned: "Ashish Tomar (FRO-001)",
    tat: "25 min remaining",
    tatStatus: "success",
    date: "2025-11-09",
  },
  {
    id: 3,
    name: "Gopal Krishna",
    age: 72,
    ticket: "TKT-14567-003",
    category: "Legal Aid",
    status: "In Progress",
    priority: "Low",
    location: "Agra, UP",
    time: "1 hour ago",
    assigned: "Priya Singh (FRO-002)",
    tat: "On Time",
    tatStatus: "success",
    date: "2025-03-06",
  },
  {
    id: 4,
    name: "Laxmi Bai",
    age: 80,
    ticket: "TKT-14567-004",
    category: "Food Security",
    status: "Resolved",
    priority: "High",
    location: "Ghazipur, UP",
    time: "3 hours ago",
    assigned: "Amit Sharma (FRO-007)",
    tat: "Completed",
    tatStatus: "success",
    date: "2024-12-20",
  },
];

export default function CaseManagementScreen() {
  const { filter } = useLocalSearchParams();
  const { theme } = useTheme();

  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("All"); // ✅ DEFAULT ALL

  const [activeTab, setActiveTab] = useState(
    typeof filter === "string" ? filter : "All",
  );

  const [priorityFilter, setPriorityFilter] = useState<
    "All" | "High" | "Medium" | "Low"
  >("All");

  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, number>>({});

  /* ✅ DATE RANGE LOGIC */
  const isWithinDateRange = (caseDate: string) => {
    if (dateFilter === "All") return true;

    const today = new Date();
    const itemDate = new Date(caseDate);
    const diffTime = today.getTime() - itemDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    switch (dateFilter) {
      case "Today":
        return today.toDateString() === itemDate.toDateString();

      case "Yesterday":
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return yesterday.toDateString() === itemDate.toDateString();

      case "Weekly":
        return diffDays <= 7;

      case "Monthly":
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );

      case "Last 3 Months":
        return diffDays <= 90;

      default:
        return true;
    }
  };

  /* ✅ FINAL FILTER LOGIC (TAB + PRIORITY + DATE + SEARCH) */
  const filteredData = useMemo(() => {
    let data = caseData;

    if (activeTab !== "All") {
      data = data.filter((item) => item.status === activeTab);
    }

    if (priorityFilter !== "All") {
      data = data.filter((item) => item.priority === priorityFilter);
    }

    data = data.filter((item) => isWithinDateRange(item.date));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.ticket.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query),
      );
    }

    return data;
  }, [activeTab, priorityFilter, searchQuery, dateFilter]);

  const tabCounts = useMemo(() => {
    return {
      All: caseData.length,
      New: caseData.filter((i) => i.status === "New").length,
      Assigned: caseData.filter((i) => i.status === "Assigned").length,
      "In Progress": caseData.filter((i) => i.status === "In Progress").length,
    };
  }, []);

  return (
    <BodyLayout type="screen" screenName="Case Management">
      {/* SEARCH + CALENDAR */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { flex: 1 }]}>
          <RemixIcon
            name="search-line"
            size={18}
            color={theme.colors.colorTextSecondary}
          />
          <TextInput
            placeholder="Search case/ticket ID or elder name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1 }}
          />
        </View>

        <TouchableOpacity
          style={styles.calendarBtn}
          onPress={() => setShowDateDropdown((p) => !p)}
        >
          <RemixIcon name="calendar-line" size={18} color="#16A34A" />
        </TouchableOpacity>
      </View>

      {/* ✅ WORKING DATE DROPDOWN */}
      {showDateDropdown && (
        <View style={styles.dateDropdown}>
          {dateFilters.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.dateOption}
              onPress={() => {
                setDateFilter(item);
                setShowDateDropdown(false);
              }}
            >
              <Text
                style={{
                  color: item === dateFilter ? "#16A34A" : "#111827",
                  fontWeight: "600",
                }}
              >
                {item}
              </Text>
              {item === "Custom Range" && (
                <RemixIcon name="calendar-line" size={22} color="#16A34A" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* TABS */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {caseTabs.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            onLayout={(e) => {
              tabLayouts.current[tab.label] = e.nativeEvent.layout.x;
            }}
            onPress={() => {
              setActiveTab(tab.label);
              const x = tabLayouts.current[tab.label];
              if (x !== undefined) {
                scrollRef.current?.scrollTo({
                  x: Math.max(x - 40, 0),
                  animated: true,
                });
              }
            }}
            style={[
              styles.tab,
              {
                borderColor: theme.colors.colorPrimary600,
                backgroundColor:
                  activeTab === tab.label
                    ? theme.colors.colorPrimary600
                    : "transparent",
              },
            ]}
          >
            <Text
              style={{
                color:
                  activeTab === tab.label
                    ? "#fff"
                    : theme.colors.colorPrimary600,
                fontWeight: "700",
              }}
            >
              {tab.label}{" "}
              {String(tabCounts[tab.label as keyof typeof tabCounts]).padStart(
                2,
                "0",
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PRIORITY */}
      <View style={styles.priorityRow}>
        <Text style={styles.allTasksText}>All Tasks</Text>

        <TouchableOpacity
          style={[
            styles.priorityBtn,
            { backgroundColor: theme.colors.validationSuccessBg },
          ]}
          onPress={() => setShowPriorityDropdown((prev) => !prev)}
        >
          <Text
            style={[
              styles.priorityBtnText,
              { color: theme.colors.validationSuccessText },
            ]}
          >
            Priority ({priorityFilter})
          </Text>
          <RemixIcon
            name="arrow-down-s-line"
            size={18}
            color={theme.colors.validationSuccessText}
          />
        </TouchableOpacity>
      </View>

      {showPriorityDropdown && (
        <View style={styles.priorityDropdown}>
          {["All", "High", "Medium", "Low"].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.priorityOption}
              onPress={() => {
                setPriorityFilter(item as any);
                setShowPriorityDropdown(false);
              }}
            >
              <Text style={styles.priorityOptionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ✅ FULL ORIGINAL CARD UI */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor:
                  item?.status === "New"
                    ? theme.colors.colorPrimary50
                    : theme.colors.colorBgPage,
              },
            ]}
            onPress={() => {
              router.push({
                pathname: "/caseDetail",
                params: {
                  assigned: item.assigned ? "yes" : "no",
                  ticket: item.ticket,
                },
              });
            }}
          >
            {/* ✅ YOUR FULL CARD UI IS UNCHANGED BELOW */}
            <View style={styles.topRow}>
              <View>
                <Text
                  style={[
                    styles.name,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.ticket,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {item.ticket} ({item.age} Years)
                </Text>
              </View>

              <View
                style={[
                  styles.priorityBadge,
                  item.priority === "High"
                    ? { backgroundColor: theme.colors.validationErrorBg }
                    : item.priority === "Medium"
                      ? { backgroundColor: theme.colors.validationWarningBg }
                      : { backgroundColor: theme.colors.validationInfoBg },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    item.priority === "High"
                      ? { color: theme.colors.validationErrorText }
                      : item.priority === "Medium"
                        ? { color: theme.colors.validationWarningText }
                        : { color: theme.colors.validationInfoText },
                  ]}
                >
                  {item.priority}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.category,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              ● {item.category} • {item.status}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.rowItem}>
                <RemixIcon
                  name="map-pin-line"
                  size={16}
                  color={theme.colors.btnDisabledText}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.btnDisabledText },
                  ]}
                >
                  {item.location}
                </Text>
              </View>

              <View style={styles.rowItem}>
                <RemixIcon
                  name="time-line"
                  size={16}
                  color={theme.colors.btnDisabledText}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.btnDisabledText },
                  ]}
                >
                  {item.time}
                </Text>
              </View>
            </View>

            {!item.assigned ? (
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: theme.colors.validationErrorBg },
                ]}
              >
                <RemixIcon
                  name="information-line"
                  size={16}
                  color={theme.colors.validationErrorText}
                />
                <Text
                  style={{
                    color: theme.colors.validationErrorText,
                    fontWeight: "600",
                  }}
                >
                  Not assigned yet
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: theme.colors.validationSuccessBg },
                ]}
              >
                <RemixIcon
                  name="user-line"
                  size={16}
                  color={theme.colors.validationSuccessText}
                />
                <Text
                  style={{
                    color: theme.colors.validationSuccessText,
                    fontWeight: "600",
                  }}
                >
                  Assigned to: {item.assigned}
                </Text>
              </View>
            )}

            <View style={styles.tatRow}>
              <Text
                style={[
                  styles.tatLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                TAT:
              </Text>
              <Text
                style={[
                  styles.tatValue,
                  item.tatStatus === "danger"
                    ? { color: theme.colors.validationErrorText }
                    : { color: theme.colors.validationSuccessText },
                ]}
              >
                {item.tat}
              </Text>
            </View>

            {!item.assigned && (
              <TouchableOpacity
                style={[
                  styles.assignBtn,
                  { backgroundColor: theme.colors.btnPrimaryBg },
                ]}
                onPress={() => {
                  router.push("/assignScreen");
                }}
              >
                <Text style={styles.assignText}>Assign to FRO</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </BodyLayout>
  );
}

/* ✅ STYLES — UNCHANGED UI + RESPONSIVE */

const styles = StyleSheet.create({
  searchBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },

  tabsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingRight: 20,
  },

  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },

  priorityRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  allTasksText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },

  priorityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  priorityBtnText: {
    fontWeight: "700",
  },

  priorityDropdown: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },

  priorityOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  priorityOptionText: {
    fontWeight: "600",
    color: "#374151",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginTop: 14,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: { fontSize: 16, fontWeight: "700" },
  ticket: { fontSize: 12, color: "#6A7282" },

  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  priorityText: { fontSize: 11, fontWeight: "700" },

  category: {
    marginTop: 6,
    color: "#374151",
    fontWeight: "600",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  rowItem: { flexDirection: "row", alignItems: "center", gap: 6 },

  metaText: { color: "#6A7282", fontSize: 12 },

  infoBox: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },

  tatRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  tatLabel: {
    fontWeight: "700",
    color: "#374151",
  },

  tatValue: {
    fontWeight: "700",
  },

  assignBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  assignText: {
    color: "#fff",
    fontWeight: "700",
  },

  calendarBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
  },

  dateDropdown: {
    position: "absolute",
    top: 70,
    right: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 6,
    overflow: "hidden",
    zIndex: 999,
    width: 180,
  },

  dateOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
