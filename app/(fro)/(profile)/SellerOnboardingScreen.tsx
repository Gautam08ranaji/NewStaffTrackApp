import BodyLayout from "@/components/layout/BodyLayout";
import { addClient, AddClientPayload } from "@/features/api/callApi";
import { getDropdownByEndpoint } from "@/features/fro/dropdownApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

// Define types for form data
interface SellerFormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | null;          // for UI only, not sent to API
  stateId: number | null;
  stateName: string;
  city: string;
  address: string;
  contactNo: string;
  gender: string | null;              // will store the value (e.g., "1", "2")
  alternateNo: string;
  pinCode: string;
  districtId: number | null;
  districtName: string;
  pinLocation: string;
}

interface DropdownItem {
  label: string;
  value: number;
}

export default function SellerOnboardingScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const authState = useAppSelector((state) => state.auth);

  // Log auth state on mount (for debugging)
  useEffect(() => {
    console.log("Auth State:", {
      userId: authState?.userId,
      token: authState?.token ? "Present" : "Missing",
      antiforgeryToken: authState?.antiforgeryToken ? "Present" : "Missing",
    });
  }, []);

  // Dropdown data states
  const [stateDropdown, setStateDropdown] = useState<DropdownItem[]>([]);
  const [genderDropdown, setGenderDropdown] = useState<DropdownItem[]>([]);
  const [districtDropdown, setDistrictDropdown] = useState<DropdownItem[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Form state
  const [form, setForm] = useState<SellerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: null,
    stateId: null,
    stateName: "",
    city: "",
    address: "",
    contactNo: "",
    gender: null,
    alternateNo: "",
    pinCode: "",
    districtId: null,
    districtName: "",
    pinLocation: "",
  });

  const [datePicker, setDatePicker] = useState({
    visible: false,
    field: "",
  });

  const [loading, setLoading] = useState(false);

  // Fetch initial dropdowns
  useEffect(() => {
    fetchStateDropdown();
    fetchGenderDropdown();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (form.stateId) {
      fetchDistrictDropdown(form.stateId);
    } else {
      setDistrictDropdown([]);
    }
  }, [form.stateId]);

  // --- API Fetch Functions ---
  const fetchStateDropdown = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      console.log("Fetching states...");
      const res = await getDropdownByEndpoint(
        "GetStateMasterDropdown",
        String(authState.token),
        String(authState.antiforgeryToken)
      );
      console.log("State dropdown response:", JSON.stringify(res, null, 2));
      const mapped = (res?.data ?? []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));
      setStateDropdown(mapped);
    } catch (error: any) {
      console.error("Failed to fetch states:", error);
      Alert.alert("Error", "Failed to load states");
      setStateDropdown([]);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [authState]);

  const fetchDistrictDropdown = useCallback(async (stateId: number) => {
    try {
      setLoadingDropdowns(true);
      console.log(`Fetching districts for state ID: ${stateId}`);
      const res = await getDropdownByEndpoint(
        `GetDistrictMasterByStateId/${stateId}`,
        String(authState.token),
        String(authState.antiforgeryToken)
      );
      console.log("District dropdown response:", JSON.stringify(res, null, 2));
      const mapped = (res?.data ?? []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));
      setDistrictDropdown(mapped);
    } catch (error: any) {
      console.error("Failed to fetch districts:", error);
      Alert.alert("Error", "Failed to load districts");
      setDistrictDropdown([]);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [authState]);

  const fetchGenderDropdown = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      console.log("Fetching genders...");
      const res = await getDropdownByEndpoint(
        "GetGenderMasterDropdown",
        String(authState.token),
        String(authState.antiforgeryToken)
      );
      console.log("Gender dropdown response:", JSON.stringify(res, null, 2));
      const mapped = (res?.data ?? []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));
      setGenderDropdown(mapped);
    } catch (error: any) {
      console.error("Failed to fetch genders:", error);
      // Fallback data
      setGenderDropdown([
        { label: "Male", value: 1 },
        { label: "Female", value: 2 },
        { label: "Other", value: 3 },
      ]);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [authState]);

  // --- Form Helpers ---
  const updateField = <K extends keyof SellerFormData>(key: K, value: SellerFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const openDatePicker = (field: string) => {
    setDatePicker({ visible: true, field });
  };

  const handleDateChange = (_: any, selectedDate: any) => {
    setDatePicker({ visible: false, field: "" });
    if (selectedDate && datePicker.field) {
      updateField(datePicker.field as keyof SellerFormData, selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Not used in API but kept for UI
  const formatDateForAPI = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString();
  };

  // --- Validation ---
  const validateForm = () => {
    if (!form.firstName.trim()) {
      Alert.alert("Validation Error", "Please enter first name");
      return false;
    }
    if (!form.lastName.trim()) {
      Alert.alert("Validation Error", "Please enter last name");
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert("Validation Error", "Please enter email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    if (!form.contactNo.trim()) {
      Alert.alert("Validation Error", "Please enter contact number");
      return false;
    }
    if (form.contactNo.length < 10) {
      Alert.alert("Validation Error", "Please enter valid 10-digit contact number");
      return false;
    }
    if (!form.gender) {
      Alert.alert("Validation Error", "Please select gender");
      return false;
    }
    if (!form.address.trim()) {
      Alert.alert("Validation Error", "Please enter address");
      return false;
    }
    if (!form.city.trim()) {
      Alert.alert("Validation Error", "Please enter city");
      return false;
    }
    if (!form.stateId) {
      Alert.alert("Validation Error", "Please select state");
      return false;
    }
    if (!form.districtId) {
      Alert.alert("Validation Error", "Please select district");
      return false;
    }
    if (!form.pinCode.trim()) {
      Alert.alert("Validation Error", "Please enter pincode");
      return false;
    }
    if (form.pinCode.length !== 6) {
      Alert.alert("Validation Error", "Please enter valid 6-digit pincode");
      return false;
    }
    if (!form.pinLocation.trim()) {
      Alert.alert("Validation Error", "Please enter pin location");
      return false;
    }
    return true;
  };

  // --- Prepare Payload for API ---
  const preparePayload = (): AddClientPayload => {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    return {
      name: fullName,
      pinCode: form.pinCode,
      gender: String(form.gender),           // ensure string
      stateId: form.stateId || 0,
      stateName: form.stateName,
      districtId: form.districtId || 0,
      districtName: form.districtName,
      pinLocation: form.pinLocation,
      mobileNo: form.contactNo,
      emailId: form.email,
      alternateNo: form.alternateNo,
      address: form.address,
      userId: String(authState?.userId || ""),
      latitude: "0",
      longitude: "0",
    };
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    console.log("=== HANDLE SUBMIT STARTED ===");
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setLoading(true);
    try {
      const payload = preparePayload();
      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      const response = await addClient({
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
        body: payload,
      });

      console.log("API Response:", JSON.stringify(response, null, 2));

      if (!response) {
        Alert.alert("Error", "No response from server");
        return;
      }

      if (response.success === true) {
        Alert.alert("Success", "Seller onboarded successfully", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        const errorMsg = response.errors?.[0]?.message || "Failed to onboard seller";
        Alert.alert("Error", errorMsg);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      Alert.alert("Error", error?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
      console.log("=== HANDLE SUBMIT END ===");
    }
  };

  return (
    <BodyLayout type="screen" screenName="Seller Onboarding">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seller Onboarding</Text>
          <Text style={styles.headerSubtitle}>
            Fill in the details to register a new seller
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <Text style={styles.label}>First Name <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.firstName}
            onChangeText={(t) => updateField("firstName", t)}
          />

          {/* Last Name */}
          <Text style={styles.label}>Last Name <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.lastName}
            onChangeText={(t) => updateField("lastName", t)}
          />

          {/* Email */}
          <Text style={styles.label}>Email <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.email}
            onChangeText={(t) => updateField("email", t)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Contact Number */}
          <Text style={styles.label}>Contact Number <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.contactNo}
            onChangeText={(t) => updateField("contactNo", t.replace(/[^0-9]/g, ''))}
            keyboardType="phone-pad"
            maxLength={10}
          />

          {/* Alternate Number */}
          <Text style={styles.label}>Alternate Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter alternate number (optional)"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.alternateNo}
            onChangeText={(t) => updateField("alternateNo", t.replace(/[^0-9]/g, ''))}
            keyboardType="phone-pad"
            maxLength={10}
          />

          {/* Date of Birth (UI only) */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => openDatePicker("dateOfBirth")}
          >
            <Text style={form.dateOfBirth ? styles.dateText : styles.placeholderText}>
              {form.dateOfBirth ? formatDate(form.dateOfBirth) : "Select Date of Birth"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.colorTextSecondary} />
          </TouchableOpacity>

          {/* Gender */}
          <Text style={styles.label}>Gender <Text style={styles.requiredStar}>*</Text></Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={styles.dropdown}
              data={genderDropdown}
              labelField="label"
              valueField="value"
              placeholder="Select Gender"
              placeholderStyle={styles.placeholderText}
              selectedTextStyle={styles.selectedText}
              value={form.gender ? Number(form.gender) : null}
              onChange={(item) => updateField("gender", String(item.value))}
              disable={loadingDropdowns}
              dropdownPosition="bottom"
            />
          </View>

          {/* Address */}
          <Text style={styles.label}>Address <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Enter complete address"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.address}
            onChangeText={(t) => updateField("address", t)}
            numberOfLines={3}
          />

          {/* City */}
          <Text style={styles.label}>City <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.city}
            onChangeText={(t) => updateField("city", t)}
          />

          {/* State */}
          <Text style={styles.label}>State <Text style={styles.requiredStar}>*</Text></Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={styles.dropdown}
              data={stateDropdown}
              labelField="label"
              valueField="value"
              placeholder="Select State"
              placeholderStyle={styles.placeholderText}
              selectedTextStyle={styles.selectedText}
              value={form.stateId}
              onChange={(item) => {
                updateField("stateId", item.value);
                updateField("stateName", item.label);
                // Reset district when state changes
                updateField("districtId", null);
                updateField("districtName", "");
              }}
              disable={loadingDropdowns}
              dropdownPosition="bottom"
            />
          </View>

          {/* District */}
          <Text style={styles.label}>District <Text style={styles.requiredStar}>*</Text></Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={styles.dropdown}
              data={districtDropdown}
              labelField="label"
              valueField="value"
              placeholder={form.stateId ? "Select District" : "Select State first"}
              placeholderStyle={styles.placeholderText}
              selectedTextStyle={styles.selectedText}
              value={form.districtId}
              onChange={(item) => {
                updateField("districtId", item.value);
                updateField("districtName", item.label);
              }}
              disable={!form.stateId || loadingDropdowns}
              dropdownPosition="bottom"
            />
          </View>

          {/* Pincode */}
          <Text style={styles.label}>Pincode <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.pinCode}
            onChangeText={(t) => updateField("pinCode", t.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={6}
          />

          {/* Pin Location */}
          <Text style={styles.label}>Pin Location <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pin location"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.pinLocation}
            onChangeText={(t) => updateField("pinLocation", t)}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.btnPrimaryBg },
              (loading || loadingDropdowns) && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading || loadingDropdowns}
          >
            <Text style={[styles.submitText, { color: theme.colors.btnPrimaryText }]}>
              {loading ? "Submitting..." : "Onboard Seller"}
            </Text>
            {!loading && <Ionicons name="checkmark-circle" size={20} color={theme.colors.btnPrimaryText} />}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {datePicker.visible && (
        <DateTimePicker
          value={form.dateOfBirth || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </BodyLayout>
  );
}

/* ---------- STYLES ---------- */
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.colorBgSurface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.colorHeadingH1,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.colorTextSecondary,
    },
    formContainer: {
      padding: 20,
    },
    label: {
      fontSize: 14,
      marginBottom: 8,
      marginTop: 16,
      color: theme.colors.colorTextSecondary,
      fontWeight: "500",
    },
    requiredStar: {
      color: "#FF3B30",
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 14,
      backgroundColor: theme.colors.colorBgSurface,
      borderColor: theme.colors.border,
      color: theme.colors.colorTextPrimary,
    },
    dropdownContainer: {
      borderWidth: 1,
      borderRadius: 10,
      backgroundColor: theme.colors.colorBgSurface,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    dropdown: {
      paddingHorizontal: 14,
      height: 50,
    },
    placeholderText: {
      color: theme.colors.colorTextSecondary,
      fontSize: 14,
    },
    selectedText: {
      color: theme.colors.colorTextPrimary,
      fontSize: 14,
    },
    dateInput: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.colorBgSurface,
      borderColor: theme.colors.border,
    },
    dateText: {
      color: theme.colors.colorTextPrimary,
      fontSize: 14,
    },
    textArea: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      minHeight: 80,
      textAlignVertical: "top",
      fontSize: 14,
      backgroundColor: theme.colors.colorBgSurface,
      borderColor: theme.colors.border,
      color: theme.colors.colorTextPrimary,
    },
    buttonContainer: {
      padding: 20,
      paddingTop: 10,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 10,
      gap: 8,
    },
    submitText: {
      fontSize: 16,
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });