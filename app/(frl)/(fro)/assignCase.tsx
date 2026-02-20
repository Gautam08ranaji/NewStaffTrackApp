import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

/* ✅ DYNAMIC RECOMMENDED FRO DATA */
const RECOMMENDED_FRO = {
  id: "FRO-002",
  name: "Priya Singh",
  location: "Kanpur, UP",
  time: "08:45 AM",
  TasksToday: 4,
  solved: 4,
  rating: 4.9,
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  available: true,
};

/* ✅ CASE INTERFACE */
interface CaseItem {
  id: string;
  name: string;
  age: number;
  category: string;
  location: string;
  tat: number;
  priority: "High" | "Medium" | "Low";
}

/* ✅ CASE LIST */
const CASE_LIST: CaseItem[] = [
  {
    id: "TKT-14567-002",
    name: "Sita Devi",
    age: 68,
    category: "Pension Support",
    location: "Kanpur, UP",
    tat: 25,
    priority: "Medium",
  },
  {
    id: "TKT-14567-010",
    name: "Ram Prasad",
    age: 72,
    category: "Medical Help",
    location: "Lucknow, UP",
    tat: 40,
    priority: "High",
  },
  {
    id: "TKT-14567-021",
    name: "Shanti Bai",
    age: 65,
    category: "Ration Issue",
    location: "Agra, UP",
    tat: 60,
    priority: "Low",
  },
];

export default function AssignTaskscreen() {
  const { theme } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userChangedSelection, setUserChangedSelection] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [assignedCase, setAssignedCase] = useState<CaseItem | null>(null);

  /* ✅ AUTO-RECOMMENDED CASE (LOWEST TAT) */
  const recommendedCase = useMemo(() => {
    return [...CASE_LIST].sort((a, b) => a.tat - b.tat)[0];
  }, []);

  /* ✅ AUTO SELECT ON LOAD */
  useEffect(() => {
    setSelectedId(recommendedCase.id);
  }, []);

  /* ✅ SEARCH FILTER */
  const filteredList = useMemo(() => {
    return CASE_LIST.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  /* ✅ RENDER CASE CARD */
  const renderCase = ({ item }: { item: CaseItem }) => {
    const isSelected = item.id === selectedId;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setSelectedId(item.id);

          if (item.id !== recommendedCase.id) {
            setUserChangedSelection(true);
          } else {
            setUserChangedSelection(false);
          }
        }}
        style={[
          styles.card,
          {
            borderColor: isSelected
              ? theme.colors.validationInfoText
              : theme.colors.colorBorder,
            backgroundColor: isSelected
              ? theme.colors.validationInfoBg
              : theme.colors.colorBgPage,
          },
        ]}
      >
        {/* ✅ RECOMMENDED BANNER (ONLY FIRST LOAD) */}
        {isSelected &&
          item.id === recommendedCase.id &&
          !userChangedSelection && (
            <View style={styles.recommendedBox}>
              <View style={styles.recommendedRow}>
                <RemixIcon name="information-line" size={16} color="#fff" />
                <Text style={styles.recommendedTitle}>Recommended Case</Text>
              </View>

              <Text style={styles.recommendedDesc}>
                This case is prioritized based on lowest TAT and location match.
              </Text>
            </View>
          )}

        {/* ✅ CASE MAIN CONTENT */}
        <View style={{ padding: 14 }}>
          <View style={styles.row}>
            <View>
              <Text style={styles.caseName}>{item.name}</Text>
              <Text style={styles.caseId}>
                {item.id} ({item.age} Years)
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.priority === "High"
                      ? "#FEE2E2"
                      : item.priority === "Medium"
                        ? "#FEF9C3"
                        : "#DCFCE7",
                },
              ]}
            >
              <Text style={{ fontWeight: "700" }}>{item.priority}</Text>
            </View>
          </View>

          <Text style={styles.category}>• {item.category} • Assigned</Text>

          <View style={styles.locationRow}>
            <View style={styles.iconRow}>
              <RemixIcon name="map-pin-line" size={16} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>

            <View style={styles.iconRow}>
              <RemixIcon name="time-line" size={16} />
              <Text style={styles.timeText}>15 min ago</Text>
            </View>
          </View>

          <Text style={styles.tat}>TAT: {item.tat} min remaining</Text>

          {/* ✅ ASSIGN BUTTON */}
          <TouchableOpacity
            onPress={() => {
              setAssignedCase(item);
              setShowSuccess(true);

              setTimeout(() => {
                setShowSuccess(false);
                router.push("/(frl)/(Tasks)");
              }, 2000);
            }}
            style={styles.assignBtn}
          >
            <Text style={styles.assignText}>Assign this case</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BodyLayout type="screen" screenName="Assign Case">
      <View>
        {/* ✅ SEARCH BOX */}
        <View style={styles.searchBox}>
          <RemixIcon name="search-line" size={18} />
          <TextInput
            placeholder="Search case by name or ticket..."
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1 }}
          />
        </View>

        {/* ✅ RECOMMENDED FRO CARD */}
        <View style={styles.froCard}>
          <View style={styles.froTopRow}>
            <View style={styles.iconRow}>
              <Image
                source={{ uri: RECOMMENDED_FRO.avatar }}
                style={styles.froAvatar}
              />

              <View>
                <Text style={styles.froName}>{RECOMMENDED_FRO.name}</Text>
                <Text style={styles.froId}>{RECOMMENDED_FRO.id}</Text>
              </View>
            </View>

            <View
              style={[
                styles.availableBadge,
                {
                  backgroundColor: RECOMMENDED_FRO.available
                    ? "#DCFCE7"
                    : "#FFE4E6",
                },
              ]}
            >
              <Text
                style={[
                  { fontWeight: "700", fontSize: 12 },
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {RECOMMENDED_FRO.available ? "Available" : "Busy"}
              </Text>
            </View>
          </View>

          <View style={styles.froRowInfo}>
            <View style={styles.iconRow}>
              <RemixIcon name="map-pin-line" size={16} color="#fff" />
              <Text style={styles.froInfoText}>{RECOMMENDED_FRO.location}</Text>
            </View>

            <View style={styles.iconRow}>
              <RemixIcon name="time-line" size={16} color="#fff" />
              <Text style={styles.froInfoText}>{RECOMMENDED_FRO.time}</Text>
            </View>
          </View>

          <View style={styles.froStatRow}>
            <View style={[styles.froStatBox, { backgroundColor: "#ECFDF5" }]}>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                Tasks Today
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {RECOMMENDED_FRO.TasksToday}
              </Text>
            </View>

            <View style={[styles.froStatBox, { backgroundColor: "#FFF7ED" }]}>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                Solved
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {RECOMMENDED_FRO.solved}
              </Text>
            </View>

            <View style={[styles.froStatBox, { backgroundColor: "#EFF6FF" }]}>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                Rating
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {RECOMMENDED_FRO.rating}
              </Text>
            </View>
          </View>
        </View>

        {/* ✅ CASE LIST */}
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderCase}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* ✅ SUCCESS MODAL */}
      {showSuccess && assignedCase && (
        <View style={styles.overlay}>
          <View style={styles.popupCard}>
            <View style={styles.checkCircle}>
              <RemixIcon name="check-line" size={28} color="#fff" />
            </View>

            <Text style={styles.popupText}>
              Task{assignedCase.id} Assigned Successfully
            </Text>
          </View>
        </View>
      )}
    </BodyLayout>
  );
}

/* ✅ STYLES */
const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  froCard: {
    backgroundColor: "#047857",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },

  froTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  froAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },

  froName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  froId: {
    color: "#D1FAE5",
    fontSize: 12,
  },

  froRowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  froInfoText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

  froStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  froStatBox: {
    width: "32%",
    borderRadius: 14,
    padding: 10,
    alignItems: "flex-start",
  },

  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "900",
  },

  availableBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    justifyContent: "center",
  },

  card: {
    borderWidth: 2,
    borderRadius: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  caseName: { fontSize: 16, fontWeight: "800" },
  caseId: { fontSize: 12, opacity: 0.7 },

  category: { marginTop: 4 },

  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  locationText: { marginLeft: 5 },
  timeText: { marginLeft: 5 },

  tat: {
    marginTop: 10,
    fontWeight: "700",
    color: "green",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    justifyContent: "center",
  },

  assignBtn: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#2563EB",
  },

  assignText: { fontWeight: "700", color: "#fff" },

  recommendedBox: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  recommendedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  recommendedTitle: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },

  recommendedDesc: {
    fontSize: 12,
    color: "#fff",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupCard: {
    backgroundColor: "#EAFBF3",
    width: "80%",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },

  checkCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  popupText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },
});
