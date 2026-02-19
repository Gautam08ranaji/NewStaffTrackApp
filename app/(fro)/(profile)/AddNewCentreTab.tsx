import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

/* ================= TYPES ================= */

type CentreType = {
  id: string;
  label: string;
};

/* ================= DATA ================= */

const CENTRE_TYPES: CentreType[] = [
  { id: "AddFaq", label: "FAQs" },
  { id: "AddNgoMaster", label: "NGOs" },
  { id: "AddCaregiver", label: "Caregivers" },
  { id: "AddDayCareCentres", label: "Day Care Centres" },
  { id: "AddElderFriendlyProducts", label: "Elder-friendly Products" },
  { id: "AddHospitalMaster", label: "Hospitals" },
  { id: "AddPsychiatricClinics", label: "Psychiatric Clinic" },
  { id: "AddPalliativeCares", label: "Palliative Care" },
  { id: "AddOrganDonationOrg", label: "Organ Donation Organizations" },
  { id: "AddCounsellingCentres", label: "Counselling Centres" },
  { id: "AddDiagnosticCentre", label: "Diagnostic Centres" },
  { id: "AddCitizenHome", label: "Elder Homes" },
  { id: "AddBloodBank", label: "Blood Banks" },
];


/* ================= SCREEN ================= */

export default function SelectCentreTypeScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return CENTRE_TYPES.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const renderItem = ({ item }: { item: CentreType }) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedId(item.id)}
        style={[
          styles.card,
          {
            backgroundColor: isSelected
              ? theme.colors.colorPrimary100
              : theme.colors.btnSecondaryBg,
            borderColor: isSelected
              ? theme.colors.primary
              : theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.cardText,
            {
              color: theme.colors.colorTextPrimary,
              fontWeight: isSelected ? "600" : "500",
            },
          ]}
        >
          {item.label}
        </Text>

        {/* RADIO */}
        <View
          style={[
            styles.radioOuter,
            {
              borderColor: isSelected
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
        >
          {isSelected && (
            <View
              style={[
                styles.radioInner,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.colorTextPrimary }]}>
        Select Centre Type
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.colorTextPrimary }]}>
        Choose the category that best matches the service provided
      </Text>

      {/* SEARCH */}
      <View style={[styles.searchBox, { borderColor: theme.colors.border }]}>
        <RemixIcon
          name="search-line"
          size={18}
          color={theme.colors.colorTextPrimary}
        />
        <TextInput
          placeholder="Search Centre Type"
          placeholderTextColor={theme.colors.colorTextPrimary}
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            { color: theme.colors.colorTextPrimary },
          ]}
        />
      </View>

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* CONTINUE */}
      <TouchableOpacity
        disabled={!selectedId}
        style={[
          styles.continueBtn,
          {
            backgroundColor: selectedId
              ? theme.colors.primary
              : theme.colors.border,
          },
        ]}
        onPress={() => {
          router.push({
            pathname: "/(fro)/(profile)/AddNewCentreScreen",
            params: {
              centreType: selectedId,
            },
          });
        }}
      >
        <Text
          style={[
            styles.continueText,
            {
              color: selectedId
                ? theme.colors.btnPrimaryText
                : theme.colors.colorTextPrimary,
            },
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },

  cardText: {
    fontSize: 14,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  continueBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  continueText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
