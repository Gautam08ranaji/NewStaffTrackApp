import BodyLayout from "@/components/layout/BodyLayout";
import { getDropdownByEndpoint, getDropdownByEndpointAndId } from "@/features/fro/dropdownApi";
import { addInteractionActivityHistory } from "@/features/fro/interaction/ActivityHistory";
import { updateInteraction, UpdateInteractionPayload } from "@/features/fro/interactionApi";
import { getUserDataById } from "@/features/fro/profile/getProfile";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { showApiError } from "@/utils/showApiError";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

// Define types for better type safety
interface FormData {
  statusName: string | null;
  statusId: number | null;
  subStatusName: string | null;
  subStatusId: number | null;
  closeRemarks: string;
  fosVisitDate: Date | null;
  brandName: string;
  categoryName: string | null;
  categoryId: number | null;
  productDiscount: string;
}

interface DropdownItem {
  label: string;
  value: number;
}

export default function UpdateTaskScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const authState = useAppSelector((state) => state.auth);
  const params = useLocalSearchParams();

  // Use ref to track if we've already logged params
  const hasLoggedParams = useRef(false);

  // Parse the item data from params
  const taskData = React.useMemo(() => {
    return params.item ? JSON.parse(params.item as string) : null;
  }, [params.item]);
  
  const caseId = params.caseId ? Number(params.caseId) : null;
  const transactionNumber = taskData?.transactionNumber || "";

  // State for dropdown data
  const [statusDropdown, setStatusDropdown] = useState<DropdownItem[]>([]);
  const [subStatusDropdown, setSubStatusDropdown] = useState<DropdownItem[]>([]);
  const [categoryDropdown, setCategoryDropdown] = useState<DropdownItem[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Log params only once
  useEffect(() => {
    if (!hasLoggedParams.current) {
      console.log("param", params);
      hasLoggedParams.current = true;
    }
  }, [params]);

  // Form state with only the required fields from Swagger payload
  const [form, setForm] = useState<FormData>({
    statusName: null,
    statusId: null,
    subStatusName: null,
    subStatusId: null,
    closeRemarks: "",
    fosVisitDate: null,
    brandName: "",
    categoryName: null,
    categoryId: null,
    productDiscount: "",
  });

  const [datePicker, setDatePicker] = useState({
    visible: false,
    field: "",
  });

  const [loading, setLoading] = useState(false);

  // Fetch initial dropdowns
  useEffect(() => {
    fetchStatusDropdown();
    fetchCategoryDropdown(1);
  }, []);

  // Fetch sub-status when status changes
  useEffect(() => {
    if (form.statusId) {
      fetchSubStatusDropdown(form.statusId);
    } else {
      setSubStatusDropdown([]);
    }
  }, [form.statusId]);

  // Populate form with task data when component mounts
  useEffect(() => {
    if (taskData && statusDropdown.length > 0) {
      // Parse dates if they exist
      const fosVisitDate = taskData.fosVisitDate ? new Date(taskData.fosVisitDate) : null;
      
      // Find status ID from status name
      const statusItem = statusDropdown.find(item => item.label === taskData.statusName);
      
      // Find category ID from category name
      const categoryItem = categoryDropdown.find(item => item.label === taskData.categoryName);
      
      setForm({
        statusName: taskData.statusName || null,
        statusId: statusItem?.value || taskData.statusId || null,
        subStatusName: taskData.subStatusName || null,
        subStatusId: null, // Will be set after sub-status dropdown loads
        closeRemarks: taskData.closeRemarks || "",
        fosVisitDate: fosVisitDate,
        brandName: taskData.brandName || "",
        categoryName: taskData.categoryName || null,
        categoryId: categoryItem?.value || taskData.categoryId || null,
        productDiscount: taskData.productDiscount || "",
      });
    }
  }, [taskData, statusDropdown, categoryDropdown]);

  // Update sub-status ID when sub-status dropdown loads and name matches
  useEffect(() => {
    if (form.subStatusName && subStatusDropdown.length > 0) {
      const subStatusItem = subStatusDropdown.find(item => item.label === form.subStatusName);
      if (subStatusItem) {
        updateField('subStatusId', subStatusItem.value);
      }
    }
  }, [subStatusDropdown, form.subStatusName]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prevForm => ({ ...prevForm, [key]: value }));
  };

  const openDate = (field: string) => {
    setDatePicker({ visible: true, field });
  };

  const handleDateChange = (_: any, selectedDate: any) => {
    setDatePicker({ visible: false, field: "" });

    if (selectedDate && datePicker.field) {
      updateField(datePicker.field as keyof FormData, selectedDate);
    }
  };

  const renderDate = (date: Date | null) => {
    if (!date) return "";
    return date.toDateString();
  };

  // Format date to ISO string for API
  const formatDateForAPI = (date: Date | null) => {
    if (!date) return null;
    return date.toISOString();
  };

  /* ---------- SAVE ACTIVITY WITH DETAILED CHANGE TRACKING ---------- */
  const saveActivity = async ({
    interactionId,
    oldData,
    newData,
    changes,
  }: {
    interactionId: number;
    oldData: typeof taskData;
    newData: FormData & { statusName: string | null; subStatusName: string | null };
    changes: string[];
  }) => {
    try {
      const userRes = await getUserDataById({
        userId: String(authState?.userId),
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
      });

      const firstName = userRes?.data?.firstName || "";
      const lastName = userRes?.data?.lastName || "";
      const activityByName = `${firstName} ${lastName}`.trim();

      // Build detailed activity description
      let activityDescription = "Task updated: ";
      const changeDetails: string[] = [];

      // Check status change
      if (oldData.statusName !== newData.statusName) {
        changeDetails.push(
          `Status changed from "${oldData.statusName || 'None'}" to "${newData.statusName || 'None'}"`
        );
      }

      // Check sub-status change
      if (oldData.subStatusName !== newData.subStatusName) {
        changeDetails.push(
          `Sub-status changed from "${oldData.subStatusName || 'None'}" to "${newData.subStatusName || 'None'}"`
        );
      }

      // Check category change
      if (oldData.categoryName !== newData.categoryName) {
        changeDetails.push(
          `Category changed from "${oldData.categoryName || 'None'}" to "${newData.categoryName || 'None'}"`
        );
      }

      // Check brand change
      if (oldData.brandName !== newData.brandName) {
        changeDetails.push(
          `Brand changed from "${oldData.brandName || 'None'}" to "${newData.brandName || 'None'}"`
        );
      }

      // Check product discount change
      if (oldData.productDiscount !== newData.productDiscount) {
        changeDetails.push(
          `Product discount changed from "${oldData.productDiscount || 'None'}" to "${newData.productDiscount || 'None'}"`
        );
      }

      // Check close remarks change
      if (oldData.closeRemarks !== newData.closeRemarks) {
        changeDetails.push(
          `Close remarks updated`
        );
      }

      // Check FOS visit date change
      const oldDate = oldData.fosVisitDate ? new Date(oldData.fosVisitDate).toDateString() : 'None';
      const newDate = newData.fosVisitDate ? new Date(newData.fosVisitDate).toDateString() : 'None';
      if (oldDate !== newDate) {
        changeDetails.push(
          `FOS visit date changed from "${oldDate}" to "${newDate}"`
        );
      }

      // Combine all changes
      if (changeDetails.length > 0) {
        activityDescription += changeDetails.join('. ');
      } else {
        activityDescription += 'No changes detected';
      }

      // Add summary of changed fields
      if (changes.length > 0) {
        activityDescription += ` (Updated fields: ${changes.join(', ')})`;
      }

      const payload = {
        activityTime: new Date().toISOString(),
        activityInteractionId: interactionId,
        activityActionName: "UPDATE",
        activityDescription,
        activityStatus: "Completed",
        activityById: String(authState?.userId),
        activityByName,
        activityRelatedTo: "CAS",
        activityRelatedToId: interactionId,
        activityRelatedToName: transactionNumber,
      };

      console.log("Activity payload:", JSON.stringify(payload, null, 2));

      await addInteractionActivityHistory({
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        body: payload,
      });
      
      console.log("Activity saved successfully");
    } catch (err) {
      console.log("Activity error", err);
      showApiError(error, dispatch);
    }
  };

  // Prepare payload for API submission
  const preparePayload = (): UpdateInteractionPayload => {
    if (!taskData || !caseId) {
      throw new Error("Task data or case ID is missing");
    }

    return {
      id: caseId,
      assignToId: taskData.assignToId || authState.userId || "",
      assignToName: taskData.assignToName || "",
      statusId: form.statusId || 0,
      statusName: form.statusName || "",
      subStatusId: form.subStatusId || 0,
      subStatusName: form.subStatusName || "",
      closeRemarks: form.closeRemarks,
      fosVisitDate: formatDateForAPI(form.fosVisitDate),
      brandName: form.brandName,
      categoryId: form.categoryId || 0,
      categoryName: form.categoryName || "",
      productDiscount: form.productDiscount,
      
      // Include required fields from original task data
      isSellerOutOfLocation: taskData.isSellerOutOfLocation || "",
      isInterested: taskData.isInterested || "",
      sellerVisitDate: taskData.sellerVisitDate || null,
      
      // Include follow-up fields if they exist in taskData
      nextFollowupDate: taskData.nextFollowupDate || null,
      isNextFollowupStatus: taskData.isNextFollowupStatus || "No",
      secondFollowupDate: taskData.secondFollowupDate || null,
      isSecondVisitStatus: taskData.isSecondVisitStatus || "No",
      thirdFollowupDate: taskData.thirdFollowupDate || null,
      isThirdVisitStatus: taskData.isThirdVisitStatus || "No",
      
      // Include other optional fields
      fosSecondVisitDate: taskData.fosSecondVisitDate || null,
      fosSecondVisitStatus: taskData.fosSecondVisitStatus || "",
      fosThirdVisitDate: taskData.fosThirdVisitDate || null,
      fosThirdVisitStatus: taskData.fosThirdVisitStatus || "",
      fosVisitStatus: taskData.fosVisitStatus || "",
      callBack: taskData.callBack || null,
    };
  };

  const fetchStatusDropdown = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      const res = await getDropdownByEndpoint(
        "GetStatusMasterDropdown",
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      console.log("status res", res);
      
      const mapped = (res?.data ?? []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));

      setStatusDropdown(mapped);
    } catch (error: any) {
      console.error("Failed to fetch statuses:", error);
      showApiError(error, dispatch);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [authState]);

  const fetchSubStatusDropdown = useCallback(async (statusId: number) => {
    try {
      setLoadingDropdowns(true);
      const res = await getDropdownByEndpointAndId(
        "GetSubStatusMasterById",
        statusId,
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      console.log("Substatus res", res);
      
      const mapped = (res?.data ?? []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));

      setSubStatusDropdown(mapped);
    } catch (error) {
      console.error("Failed to fetch sub-statuses:", error);
      showApiError(error, dispatch);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [authState]);

  const fetchCategoryDropdown = useCallback(async (callType: number) => {
    try {
      setLoadingDropdowns(true);
      const res = await getDropdownByEndpoint(
        `GetCategoryMastersDropdownByCallType/${callType}`,
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      console.log("Category res", res);

      const mapped = (res?.data ?? []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));

      setCategoryDropdown(mapped);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showApiError(error, dispatch);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [authState]);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!form.statusId) {
      Alert.alert("Validation Error", "Please select a status");
      return;
    }

    if (!caseId) {
      Alert.alert("Error", "Case ID is missing");
      return;
    }

    if (!taskData) {
      Alert.alert("Error", "Task data is missing");
      return;
    }

    try {
      // Track changes for activity
      const changes: string[] = [];
      
      if (form.brandName !== taskData.brandName) changes.push("Brand");
      if (form.productDiscount !== taskData.productDiscount) changes.push("Product Discount");
      if (form.closeRemarks !== taskData.closeRemarks) changes.push("Close Remarks");
      if (form.categoryName !== taskData.categoryName) changes.push("Category");
      
      const fosVisitDateStr = form.fosVisitDate ? form.fosVisitDate.toDateString() : null;
      const oldFosVisitDateStr = taskData.fosVisitDate ? new Date(taskData.fosVisitDate).toDateString() : null;
      if (fosVisitDateStr !== oldFosVisitDateStr) changes.push("FOS Visit Date");
      
      // Always track status and sub-status changes
      if (taskData.statusName !== form.statusName) changes.push("Status");
      if (taskData.subStatusName !== form.subStatusName) changes.push("Sub Status");

      const payload = preparePayload();

      console.log("Complete Payload:", JSON.stringify(payload, null, 2));

      setLoading(true);
      
      const response = await updateInteraction({
        data: payload,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("Update response:", response);

      if (response?.success) {
        // Save activity after successful update with detailed changes
        await saveActivity({
          interactionId: caseId,
          oldData: taskData,
          newData: {
            ...form,
            statusName: form.statusName,
            subStatusName: form.subStatusName,
          },
          changes,
        });

        Alert.alert("Success", "Task updated successfully", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", response?.errors?.[0]?.message || "Failed to update task");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert("Error", error?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyLayout type="screen" screenName="Update Task">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Display Case/Transaction Info */}
        {taskData && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Transaction #{taskData.transactionNumber}</Text>
            <Text style={styles.infoText}>Customer: {taskData.name}</Text>
            <Text style={styles.infoText}>Contact: {taskData.mobileNo}</Text>
            <Text style={styles.infoText}>Assigned To: {taskData.assignToName}</Text>
          </View>
        )}

        {/* CATEGORY */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={styles.dropdown}
            data={categoryDropdown}
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
            value={form.categoryId}
            onChange={(item) => {
              updateField("categoryId", item.value);
              updateField("categoryName", item.label);
            }}
            disable={loadingDropdowns}
          />
        </View>

        {/* STATUS - Required */}
        <Text style={styles.label}>Status *</Text>
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={styles.dropdown}
            data={statusDropdown}
            labelField="label"
            valueField="value"
            placeholder="Select Status"
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
            value={form.statusId}
            onChange={(item) => {
              updateField("statusId", item.value);
              updateField("statusName", item.label);
              // Reset sub-status when status changes
              updateField("subStatusId", null);
              updateField("subStatusName", null);
            }}
            disable={loadingDropdowns}
          />
        </View>

        {/* SUB STATUS - Depends on selected status */}
        <Text style={styles.label}>Sub Status</Text>
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={styles.dropdown}
            data={subStatusDropdown}
            labelField="label"
            valueField="value"
            placeholder={form.statusId ? "Select Sub Status" : "Select Status first"}
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
            value={form.subStatusId}
            onChange={(item) => {
              updateField("subStatusId", item.value);
              updateField("subStatusName", item.label);
            }}
            disable={!form.statusId || loadingDropdowns}
          />
        </View>

        {/* BRAND */}
        <Text style={styles.label}>Brand</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Brand"
          placeholderTextColor={theme.colors.colorTextSecondary}
          value={form.brandName}
          onChangeText={(t) => updateField("brandName", t)}
        />

        {/* PRODUCT DISCOUNT */}
        <Text style={styles.label}>Product Discount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Discount (e.g., 10%)"
          placeholderTextColor={theme.colors.colorTextSecondary}
          value={form.productDiscount}
          onChangeText={(t) => updateField("productDiscount", t)}
        />

        {/* FOS VISIT DATE */}
        <Text style={styles.label}>FOS Visit Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => openDate("fosVisitDate")}
        >
          <Text style={form.fosVisitDate ? styles.dateText : styles.placeholderText}>
            {form.fosVisitDate
              ? renderDate(form.fosVisitDate)
              : "Select FOS Visit Date"}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.colorTextSecondary}
          />
        </TouchableOpacity>

        {/* REMARKS */}
        <Text style={styles.label}>Close Remarks</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Enter Remarks"
          placeholderTextColor={theme.colors.colorTextSecondary}
          value={form.closeRemarks}
          onChangeText={(t) => updateField("closeRemarks", t)}
        />

        {/* BUTTON */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.btnPrimaryBg },
            (loading || loadingDropdowns) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || loadingDropdowns}
        >
          <Text style={[styles.saveText, { color: theme.colors.btnPrimaryText }]}>
            {loading ? "Updating..." : "Update Task"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {datePicker.visible && (
        <DateTimePicker
          value={form.fosVisitDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
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
      padding: 16,
      backgroundColor: theme.colors.background,
    },

    infoCard: {
      backgroundColor: theme.colors.colorBgSurface,
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.colorHeadingH1,
      marginBottom: 8,
    },

    infoText: {
      fontSize: 14,
      color: theme.colors.colorTextPrimary,
      marginBottom: 4,
    },

    label: {
      fontSize: 13,
      marginBottom: 6,
      marginTop: 12,
      color: theme.colors.colorTextSecondary,
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
      minHeight: 100,
      textAlignVertical: "top",
      fontSize: 14,
      backgroundColor: theme.colors.colorBgSurface,
      borderColor: theme.colors.border,
      color: theme.colors.colorTextPrimary,
    },

    saveButton: {
      marginTop: 30,
      marginBottom: 40,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
    },

    buttonDisabled: {
      opacity: 0.6,
    },

    saveText: {
      fontWeight: "600",
      fontSize: 16,
    },
  });