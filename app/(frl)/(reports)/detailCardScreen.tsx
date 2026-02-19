import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import {
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const { width } = Dimensions.get("window");

/* ------------ DATA FOR EACH TAB ------------ */
const hospitals = [
  {
    id: 1,
    name: "Singh Life Care Hospital & Nursing Home",
    type: "Government Hospital",
    status: "open",
    address: "Zamania Road, Rauza",
    phone: "+91-9453416629",
    distanceLabel: "Nearest hospital to you • 2.4 km Away",
  },
  {
    id: 2,
    name: "City General Hospital",
    type: "Private Hospital",
    status: "closed",
    address: "Lanka, Ghazipur",
    phone: "+91-9453416629",
    distanceLabel: "Distance: 4.1 km Away",
  },
  {
    id: 3,
    name: "Eastside Health Centre",
    type: "Private Hospital",
    status: "closed",
    address: "Lanka, Ghazipur",
    phone: "+91-9453416628",
    distanceLabel: "Distance: 4.6 km Away",
  },
  {
    id: 4,
    name: "North City Clinic",
    type: "Private Hospital",
    status: "closed",
    address: "Lanka, Ghazipur",
    phone: "+91-9453416627",
    distanceLabel: "Distance: 5.1 km Away",
  },
];

const diagnosticCentres = [
  {
    id: 1,
    name: "Health Scan Diagnostic Centre",
    type: "Diagnostics",
    status: "open",
    address: "Ghazipur City",
    phone: "+91-9554416629",
    distanceLabel: "1.8 km Away",
  },
];

const treatments = [
  {
    id: 1,
    name: "Ayush Treatment Facility",
    type: "Government Treatment Centre",
    status: "open",
    address: "Near Collector Office",
    phone: "+91-9999916629",
    distanceLabel: "3.2 km Away",
  },
];

/* NEW: Awareness items */
const awareness = [
  {
    id: 1,
    title: "COVID-19 Vaccination: What to Know",
    summary: "Eligibility, nearest centres, documents required and safety tips.",
    link: "https://www.mohfw.gov.in/",
  },
  {
    id: 2,
    title: "Recognising Stroke Symptoms",
    summary: "FAST: Face, Arms, Speech, Time — act fast and call emergency services.",
    link: "https://www.who.int/news-room/fact-sheets/detail/stroke",
  },
  {
    id: 3,
    title: "Healthy Ageing Tips",
    summary: "Simple daily habits to improve mobility, nutrition and mental health.",
    link: "https://www.who.int/ageing",
  },
];

export default function HospitalListScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("Hospitals");

  const renderData = () => {
    if (activeTab === "Hospitals") return hospitals;
    if (activeTab === "Diagnostic Centres") return diagnosticCentres;
    if (activeTab === "Treatment") return treatments;
    if (activeTab === "Awareness") return awareness;
    return [];
  };

  const handleCall = (number: any) => Linking.openURL(`tel:${number}`);
  const handleOpen = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {
      // silent fail; optionally show toast
    });
  };

  return (
    <BodyLayout  type="screen" screenName="Details">
      <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}>
        {/* ---------- TABS ---------- */}
        <View style={styles.tabsRow}>
          {["Hospitals", "Diagnostic Centres", "Treatment", "Awareness"].map(
            (tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    {
                      borderColor: theme.colors.primary,
                    },
                    isActive && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: theme.colors.primary },
                      isActive && {
                        color: theme.colors.btnPrimaryText,
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>
         </ScrollView>

        {/* ---------- STATS ONLY FOR HOSPITAL TAB ---------- */}
        {activeTab === "Hospitals" && (
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statsCard,
                { backgroundColor: theme.colors.colorPrimary50 },
              ]}
            >
              <Text
                style={[
                  styles.statsTitle,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Total hospitals in your city
              </Text>
              <Text
                style={[
                  styles.statsValue,
                  { color: theme.colors.primary },
                ]}
              >
                612
              </Text>
            </View>

            <View
              style={[
                styles.statsCard,
                { backgroundColor: theme.colors.colorPrimary50 },
              ]}
            >
              <Text
                style={[
                  styles.statsTitle,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Total hospitals in Uttar Pradesh
              </Text>
              <Text
                style={[
                  styles.statsValue,
                  { color: theme.colors.primary },
                ]}
              >
                8,726
              </Text>
            </View>
          </View>
        )}

        {/* ---------- DATA CARDS BASED ON TAB ---------- */}
        {renderData().map((item: any) => (
          <View
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: theme.colors.colorBgSurface },
            ]}
          >
            {/* For Awareness items we treat 'title' and 'summary' */}
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {item.title ?? item.name}
              </Text>

              {/* Show status badge only if hospital/centre/treatment has status */}
              {item.status ? (
                <View
                  style={[
                    item.status === "open"
                      ? {
                          backgroundColor: theme.colors.validationWarningBg,
                        }
                      : {
                          backgroundColor: theme.colors.validationErrorBg,
                        },
                    styles.statusBadge,
                  ]}
                >
                  <Text
                    style={[
                      item.status === "open"
                        ? { color: theme.colors.validationWarningText }
                        : { color: theme.colors.validationErrorText },
                      styles.statusText,
                    ]}
                  >
                    {item.status === "open" ? "Open" : "Closed"}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Secondary line: type OR summary */}
            <Text
              style={[
                styles.hospitalType,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              {item.type ?? item.summary}
            </Text>

            {/* Address / phone row only for hospitals/centres/treatments */}
            {item.address ? (
              <View style={styles.addressRow}>
                <RemixIcon
                  name="map-pin-line"
                  size={18}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    styles.addressText,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {item.address}
                </Text>
                <Text
                  style={[
                    styles.phoneText,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  Ph: {item.phone}
                </Text>
              </View>
            ) : null}

            {/* distance or for awareness we can show nothing or a label */}
            {item.distanceLabel ? (
              <View
                style={[
                  styles.distanceBox,
                  { backgroundColor: theme.colors.colorPrimary100 },
                ]}
              >
                <Text
                  style={[
                    styles.distanceText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {item.distanceLabel}
                </Text>
              </View>
            ) : null}

            {/* BUTTON ROW */}
            <View style={styles.btnRow}>
              {/* Left action: View Details / Summary */}
              <TouchableOpacity
                style={[
                  styles.outlineBtn,
                  { borderColor: theme.colors.primary },
                ]}
                onPress={() => {
                  // Reuse behavior: for awareness open link if available, else noop
                  if (activeTab === "Awareness") {
                    handleOpen(item.link);
                  } else {
                    // placeholder for view details action
                  }
                }}
              >
                <Text
                  style={[
                    styles.outlineBtnText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {activeTab === "Awareness" ? "Learn More" : "View Details"}
                </Text>
              </TouchableOpacity>

              {/* Right action: Call (only for entries that have phone) */}
              {item.phone ? (
                <TouchableOpacity
                  style={[
                    styles.callBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleCall(item.phone)}
                >
                  <RemixIcon
                    name="phone-line"
                    size={20}
                    color={theme.colors.btnPrimaryText}
                  />
                  <Text
                    style={[
                      styles.callBtnText,
                      { color: theme.colors.btnPrimaryText },
                    ]}
                  >
                    Call
                  </Text>
                </TouchableOpacity>
              ) : (
                // If no phone, show a disabled-look button (same width)
                <View
                  style={[
                    styles.callBtn,
                    {
                      backgroundColor: theme.colors.colorPrimary50,
                      justifyContent: "center",
                    },
                  ]}
                >
                  <RemixIcon
                    name="external-link-line"
                    size={20}
                    color={theme.colors.colorTextSecondary}
                  />
                  <Text
                    style={[
                      styles.callBtnText,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {activeTab === "Awareness" ? "Open" : "—"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
     
    </BodyLayout>
  );
}

/* ------------ STYLES ------------ */
const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 12,
    // flexWrap: "wrap",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginVertical: 4,
  },
  tabText: {
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statsCard: {
    width: width * 0.445,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },

  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    width: "75%",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: "600",
  },

  hospitalType: { marginTop: 4 },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  addressText: {
    marginLeft: 6,
    width: "40%",
  },
  phoneText: { marginLeft: "auto" },

  distanceBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  distanceText: {
    fontWeight: "500",
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  outlineBtnText: {
    fontWeight: "600",
  },

  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    justifyContent: "center",
  },
  callBtnText: { marginLeft: 6, fontWeight: "600" },
});
