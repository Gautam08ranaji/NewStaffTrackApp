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

interface FRO {
  id: string;
  name: string;
  location: string;
  distance: number;
  avgTime: number;
  rating: number;
  workload: string;
  available: boolean;
  avatar: string;
}

const FRO_LIST: FRO[] = [
  {
    id: "FRO-001",
    name: "Ashish Tomar",
    location: "Agra, UP",
    distance: 1.2,
    avgTime: 12,
    rating: 4.8,
    workload: "2/5 Case",
    available: true,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "FRO-002",
    name: "Priya Singh",
    location: "Agra, UP",
    distance: 3.5,
    avgTime: 15,
    rating: 4.9,
    workload: "2/5 Case",
    available: true,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "FRO-041",
    name: "Amit Sharma",
    location: "Agra, UP",
    distance: 5.8,
    avgTime: 18,
    rating: 4.6,
    workload: "4/5 Case",
    available: false,
    avatar: "https://randomuser.me/api/portraits/men/50.jpg",
  },
];

export default function AssignTaskscreen() {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [assignedFRO, setAssignedFRO] = useState<FRO | null>(null);

  // Auto select nearest FRO
  const nearestFRO = useMemo(() => {
    return [...FRO_LIST].sort((a, b) => a.distance - b.distance)[0];
  }, []);

  useEffect(() => {
    setSelectedId(nearestFRO.id);
  }, []);

  const filteredList = useMemo(() => {
    return FRO_LIST.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const renderFRO = ({ item }: { item: FRO }) => {
    const isSelected = item.id === selectedId;
    const isBusy = !item.available;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (!isBusy) setSelectedId(item.id);
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
        {/* Recommended Header */}
        {isSelected && item.id === nearestFRO.id && (
          <View
            style={[
              styles.recommendedBox,
              {
                backgroundColor: theme.colors.validationInfoText,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            ]}
          >
            <View style={styles.recommendedRow}>
              <RemixIcon
                name="information-line"
                size={16}
                color={theme.colors.validationInfoBg}
              />
              <Text
                style={[
                  styles.recommendedTitle,
                  { color: theme.colors.validationInfoBg },
                ]}
              >
                Recommended FRO
              </Text>
            </View>

            <Text
              style={[
                styles.recommendedDesc,
                { color: theme.colors.validationInfoBg },
              ]}
            >
              {item.name} is the nearest and best-matched FRO based on location
              and workload.
            </Text>
          </View>
        )}

        {/* MAIN CARD CONTENT */}
        <View style={{ padding: 14 }}>
          <View style={styles.row}>
            <View style={styles.row}>
              <Image
                source={{ uri: item.avatar }}
                style={[
                  styles.avatar,
                  { borderColor: theme.colors.colorPrimary600, borderWidth: 1 },
                ]}
              />

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
                    styles.id,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {item.id}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: isBusy ? "#FFE4E6" : "#DCFCE7" },
              ]}
            >
              <Text
                style={{
                  color: isBusy ? "#DC2626" : "#15803D",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {isBusy ? "Busy - High Load" : "Available Now"}
              </Text>
            </View>
          </View>

          {/* LOCATION */}
          <View style={styles.location}>
            <RemixIcon
              name="map-pin-line"
              size={16}
              color={theme.colors.btnDisabledText}
            />
            <Text
              style={[
                styles.locationText,
                { color: theme.colors.btnDisabledText },
              ]}
            >
              {item.location}
            </Text>
          </View>

          {/* METRICS */}
          <View style={styles.metricRow}>
            <View
              style={[
                styles.metricBox,
                { backgroundColor: theme.colors.validationSuccessBg },
              ]}
            >
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Distance
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.distance} km
              </Text>
            </View>

            <View
              style={[
                styles.metricBox,
                { backgroundColor: theme.colors.validationWarningBg },
              ]}
            >
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Avg Time
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.avgTime} min
              </Text>
            </View>

            <View
              style={[
                styles.metricBox,
                { backgroundColor: theme.colors.validationInfoBg },
              ]}
            >
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Rating
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {item.rating}
              </Text>
            </View>
          </View>

          {/* WORKLOAD */}
          <View
            style={[
              styles.workload,
              {
                backgroundColor: theme.colors.validationInfoBg,
                padding: 10,
                borderRadius: 5,
              },
            ]}
          >
            <Text style={{ color: theme.colors.validationInfoText }}>
              Current Workload:
            </Text>
            <Text
              style={{
                fontWeight: "600",
                color: theme.colors.validationInfoText,
              }}
            >
              {item.workload}
            </Text>
          </View>

          {/* ASSIGN BUTTON */}
          <TouchableOpacity
            disabled={isBusy}
            onPress={() => {
              if (showSuccess) return;
              setAssignedFRO(item);
              setShowSuccess(true);
              setTimeout(() => {
                setShowSuccess(false);
                router.push("/(frl)/(Tasks)");
              }, 2000);
            }}
            style={[
              styles.assignBtn,
              {
                backgroundColor: isBusy
                  ? theme.colors.colorBorder
                  : isSelected
                    ? theme.colors.validationInfoText
                    : "#0F766E",
              },
            ]}
          >
            <Text style={[styles.assignText, { color: theme.colors.inputBg }]}>
              Assign
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BodyLayout type="screen" screenName="Assign Case">
      <View>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.colors.colorBgPage },
          ]}
        >
          <RemixIcon
            name="search-line"
            size={18}
            color={theme.colors.inputPlaceholder}
          />

          <TextInput
            placeholder="Search FROs by name or ID..."
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: theme.colors.colorTextSecondary }}
            placeholderTextColor={theme.colors.inputPlaceholder}
          />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          Available FROs
        </Text>

        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderFRO}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* SINGLE SUCCESS MODAL */}
      {showSuccess && assignedFRO && (
        <View style={styles.overlay}>
          <View style={styles.popupCard}>
            <View style={styles.checkCircle}>
              <RemixIcon name="check-line" size={28} color="#fff" />
            </View>

            <Text style={styles.popupText}>
              Case TKT-14567-001 Assigned to{"\n"}
              {assignedFRO.name} ({assignedFRO.id})
            </Text>
          </View>
        </View>
      )}
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    borderWidth: 2,
    borderRadius: 16,
    marginBottom: 16,
  },
  row: {
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  name: { fontSize: 17, fontWeight: "800" },
  id: { fontSize: 12 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationText: { marginLeft: 5 },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metricBox: {
    width: "30%",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  metricLabel: { fontSize: 11 },
  metricValue: { fontWeight: "700", marginTop: 4 },
  workload: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  assignBtn: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  assignText: { fontWeight: "700" },

  // Recommended FRO Styles
  recommendedBox: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
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
  },
  recommendedDesc: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Modal Styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  popupCard: {
    backgroundColor: "#EAFBF3",
    width: "85%",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    elevation: 8,
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
    lineHeight: 22,
  },
});
