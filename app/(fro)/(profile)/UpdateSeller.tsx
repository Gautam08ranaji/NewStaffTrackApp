import BodyLayout from "@/components/layout/BodyLayout";
import { getDropdownByEndpoint } from "@/features/fro/dropdownApi";
import { getClientDataById, updateClient } from "@/features/fro/profile/updateSeller";
import { useLocation } from "@/hooks/LocationContext";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
  id: number;
  name: string;
  emailId: string;
  stateId: number | null;
  stateName: string;
  districtId: number | null;
  districtName: string;
  address: string;
  mobileNo: string;
  gender: string | null;
  alternateNo: string;
  pinCode: string;
  pinLocation: string;
  productName: string;
  latitude: string;
  longitude: string;
}

interface DropdownItem {
  label: string;
  value: number;
}

export default function UpdateSellerScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const authState = useAppSelector((state) => state.auth);
  const { fetchLocation, address } = useLocation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const sellerId = params.id as string;

  // Dropdown data states
  const [stateDropdown, setStateDropdown] = useState<DropdownItem[]>([]);
  const [genderDropdown, setGenderDropdown] = useState<DropdownItem[]>([]);
  const [districtDropdown, setDistrictDropdown] = useState<DropdownItem[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form state
  const [form, setForm] = useState<SellerFormData>({
    id: 0,
    name: "",
    emailId: "",
    stateId: null,
    stateName: "",
    districtId: null,
    districtName: "",
    address: "",
    mobileNo: "",
    gender: null,
    alternateNo: "",
    pinCode: "",
    pinLocation: "",
    productName: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);

  // Fetch seller data on mount
  useEffect(() => {
    if (sellerId) {
      fetchSellerData(parseInt(sellerId));
    }
  }, [sellerId]);

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
  const fetchSellerData = useCallback(async (id: number) => {
    try {
      setLoadingData(true);
      console.log(`Fetching seller data for ID: ${id}`);
      
      const response = await getClientDataById({
        id: id,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("Seller data response:", JSON.stringify(response, null, 2));

      if (response?.success && response?.data) {
        const data = response.data;
        setForm({
          id: data.id || 0,
          name: data.name || "",
          emailId: data.emailId || "",
          stateId: data.stateId || null,
          stateName: data.stateName || "",
          districtId: data.districtId || null,
          districtName: data.districtName || "",
          address: data.address || "",
          mobileNo: data.mobileNo || "",
          gender: data.gender || null,
          alternateNo: data.alternateNo || "",
          pinCode: data.pinCode || "",
          pinLocation: data.pinLocation || "",
          productName: data.productName || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
        });
      } else {
        Alert.alert("Error", "Failed to load seller data");
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to fetch seller data:", error);
      Alert.alert("Error", "Failed to load seller data");
      router.back();
    } finally {
      setLoadingData(false);
    }
  }, [authState]);

  const fetchStateDropdown = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      console.log("Fetching states...");
      const res = await getDropdownByEndpoint(
        "GetStateDropdown",
        String(authState.token),
        String(authState.antiforgeryToken)
      );

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
        `GetDistrictDropdownByStateId/${stateId}`,
        String(authState.token),
        String(authState.antiforgeryToken)
      );
      
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
        "GetGenderDropdown",
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      const mapped = (res?.data ?? []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));

      setGenderDropdown(mapped);
    } catch (error: any) {
      console.error("Failed to fetch genders:", error);
      Alert.alert("Error", "Failed to load genders");
      setGenderDropdown([]);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [authState]);

  // --- Form Helpers ---
  const updateField = <K extends keyof SellerFormData>(key: K, value: SellerFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // --- Validation ---
  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Validation Error", "Please enter full name");
      return false;
    }
    if (!form.emailId.trim()) {
      Alert.alert("Validation Error", "Please enter email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.emailId)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    if (!form.mobileNo.trim()) {
      Alert.alert("Validation Error", "Please enter contact number");
      return false;
    }
    if (form.mobileNo.length < 10) {
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
    return true;
  };

  // --- Prepare Payload for API ---
  const preparePayload = () => {
    return {
      id: form.id,
      name: form.name,
      emailId: form.emailId,
      mobileNo: form.mobileNo,
      alternateNo: form.alternateNo,
      gender: form.gender,
      address: form.address,
      stateId: form.stateId,
      stateName: form.stateName,
      districtId: form.districtId,
      districtName: form.districtName,
      pinCode: form.pinCode,
      pinLocation: form.pinLocation || address,
      productName: form.productName,
      latitude: form.latitude,
      longitude: form.longitude,
      isMobileApp: "true"
    };
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    console.log("=== HANDLE UPDATE STARTED ===");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setLoading(true);

    try {
      // Fetch current location
      const location = await fetchLocation();
      
      const payload = preparePayload();
      
      // Update location if available
      if (location?.coords) {
        payload.latitude = String(location.coords.latitude);
        payload.longitude = String(location.coords.longitude);
      }

      console.log("Updating payload:", JSON.stringify(payload, null, 2));

      const response = await updateClient({
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
        payload: payload,
      });

      console.log("API Response:", JSON.stringify(response, null, 2));

      if (response?.success === true) {
        Alert.alert(
          "Success", 
          "Seller updated successfully",
          [
            {
              text: "OK",
              onPress: () => {
                router.push('/(fro)/(profile)/SellerList')
              }
            }
          ]
        );
      } else {
        const errorMsg = response?.errors?.[0]?.message || "Failed to update seller";
        Alert.alert("Error", errorMsg);
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert("Error", error?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
      console.log("=== HANDLE UPDATE END ===");
    }
  };

  // Loading state
  if (loadingData) {
    return (
      <BodyLayout type="screen" screenName="Update Seller">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.btnPrimaryBg} />
          <Text style={styles.loadingText}>Loading seller data...</Text>
        </View>
      </BodyLayout>
    );
  }

  return (
    <BodyLayout type="screen" screenName="Update Seller">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.colorTextPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Update Seller</Text>
            <Text style={styles.headerSubtitle}>
              Update seller information
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <Text style={styles.label}>Full Name <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.name}
            onChangeText={(t) => updateField("name", t)}
          />

          {/* Email */}
          <Text style={styles.label}>Email <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.emailId}
            onChangeText={(t) => updateField("emailId", t)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Contact Number */}
          <Text style={styles.label}>Contact Number <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.mobileNo}
            onChangeText={(t) => updateField("mobileNo", t.replace(/[^0-9]/g, ''))}
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
              value={genderDropdown.find(item => item.label === form.gender)?.value || null}
              onChange={(item) => updateField("gender", item.label)}
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
          <Text style={styles.label}>Pin Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pin location"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.pinLocation}
            onChangeText={(t) => updateField("pinLocation", t)}
          />

          {/* Product Name */}
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            placeholderTextColor={theme.colors.colorTextSecondary}
            value={form.productName}
            onChangeText={(t) => updateField("productName", t)}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.cancelText, { color: theme.colors.colorTextSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>

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
              {loading ? "Updating..." : "Update Seller"}
            </Text>
            {!loading && <Ionicons name="checkmark-circle" size={20} color={theme.colors.btnPrimaryText} />}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.colors.colorTextSecondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.colorBgSurface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTextContainer: {
      flex: 1,
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
      flexDirection: 'row',
      gap: 12,
    },
    submitButton: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 10,
      gap: 8,
    },
    cancelButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    submitText: {
      fontSize: 16,
      fontWeight: "600",
    },
    cancelText: {
      fontSize: 16,
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });