import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Custom Hooks
import { useLocation } from "@/hooks/LocationContext";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";

// API Imports
import {
  getDropdownByEndpoint,
  getDropdownByEndpointAndId,
} from "@/features/fro/dropdownApi";
import { addAndUpdateFROLocation } from "@/features/fro/froLocationApi";
import { addInteractionActivityHistory } from "@/features/fro/interaction/ActivityHistory";
import { updateInteraction } from "@/features/fro/interactionApi";
import { getUserDataById } from "@/features/fro/profile/getProfile";

// ================= TYPES =================
type DropdownItem = {
  id: number;
  name: string;
};

type SelectedItem = {
  id: number;
  name: string;
} | null;

type InteractionItem = {
  id: number;
  transactionNumber?: string;
  statusId?: number;
  statusName?: string;
  subStatusId?: number;
  subStatusName?: string;
  categoryId?: number;
  categoryName?: string;
  subject?: string;
  closeRemarks?: string;
  brandName?: string;
  productDiscount?: number;
  fosVisitDate?: string;
  fosVisitStatus?: string;
  fosSecondVisitDate?: string;
  fosSecondVisitStatus?: string;
  fosThirdVisitDate?: string;
  fosThirdVisitStatus?: string;
  // Add other fields as needed
};

type DropdownType = "CASE" | "SUB" | "CATEGORY" | "FOS_VISIT" | "FOS_SECOND_VISIT" | "FOS_THIRD_VISIT" | null;

// ================= CONSTANTS =================
const CLOSED_STATUS_ID = 4;
const { width, height } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// ================= UTILS =================
const truncateText = (text: string, maxLength: number = 30): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// ================= MAIN COMPONENT =================
const UpdateStatusScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { hasPermission, fetchLocation, address } = useLocation();
  const params = useLocalSearchParams();
  const authState = useAppSelector((state) => state.auth);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const initializedRef = useRef(false);

  // State
  const [interactionItem, setInteractionItem] = useState<InteractionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [dropdownType, setDropdownType] = useState<DropdownType>(null);
  const [showSubStatusWarning, setShowSubStatusWarning] = useState(false);

  // Form State
  const [Taskstatus, setTaskstatus] = useState<SelectedItem>(null);
  const [subStatus, setSubStatus] = useState<SelectedItem>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectedItem>(null);
  const [brandName, setBrandName] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [fosVisitDate, setFosVisitDate] = useState("");
  const [selectedFosVisitStatus, setSelectedFosVisitStatus] = useState<SelectedItem>(null);
  const [fosSecondVisitDate, setFosSecondVisitDate] = useState("");
  const [selectedFosSecondVisitStatus, setSelectedFosSecondVisitStatus] = useState<SelectedItem>(null);
  const [fosThirdVisitDate, setFosThirdVisitDate] = useState("");
  const [selectedFosThirdVisitStatus, setSelectedFosThirdVisitStatus] = useState<SelectedItem>(null);
  const [notes, setNotes] = useState("");

  // Dropdown Data
  const [statusDropdown, setStatusDropdown] = useState<DropdownItem[]>([]);
  const [subStatusDropdown, setSubStatusDropdown] = useState<DropdownItem[]>([]);
  const [categoryDropdown, setCategoryDropdown] = useState<DropdownItem[]>([]);
  const [fosVisitStatusDropdown, setFosVisitStatusDropdown] = useState<DropdownItem[]>([]);

  // Memoized Values
  const caseId = useMemo(() => (params.caseId ? Number(params.caseId) : null), [params.caseId]);
  const isClosedStatus = useMemo(() => Taskstatus?.id === CLOSED_STATUS_ID, [Taskstatus]);

  // ================= EFFECTS =================
  useEffect(() => {
    const itemString = params.item as string;
    if (!itemString) {
      setIsParsing(false);
      return;
    }

    try {
      const parsedItem = JSON.parse(itemString);
      console.log("✅ Parsed item:", parsedItem);
      setInteractionItem(parsedItem);
    } catch (error) {
      console.error("❌ Failed to parse item:", error);
      Alert.alert(t("common.error"), t("updateStatus.loadFailed"));
    } finally {
      setIsParsing(false);
    }

    // Fetch dropdowns
    fetchStatusDropdown();
    fetchCategoryDropdown(1);
    fetchFosVisitStatusDropdown();
  }, [params.item]);

  useEffect(() => {
    if (!interactionItem || initializedRef.current) {
      setIsInitializing(false);
      return;
    }

    initializeFormData();
    initializedRef.current = true;
    setIsInitializing(false);
  }, [interactionItem]);

  // ================= API CALLS =================
  const fetchStatusDropdown = useCallback(async () => {
    try {
      const res = await getDropdownByEndpoint(
        "GetStatusMasterDropdown",
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      const mapped = (res?.data ?? []).map((item: any) => ({
        id: item.value,
        name: item.label,
      }));

      setStatusDropdown(mapped);
    } catch (error: any) {
      handleApiError(error, "updateStatus.statusLoadFailed");
    }
  }, [authState]);

  const fetchSubStatusDropdown = useCallback(async (statusId: number) => {
    try {
      const res = await getDropdownByEndpointAndId(
        "GetSubStatusMasterById",
        statusId,
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      const mapped = (res?.data ?? []).map((item: any) => ({
        id: item.value,
        name: item.label,
      }));

      setSubStatusDropdown(mapped);
    } catch (error) {
      handleApiError(error, "updateStatus.subStatusLoadFailed");
    }
  }, [authState]);

  const fetchCategoryDropdown = useCallback(async (callType: number) => {
    try {
      const res = await getDropdownByEndpoint(
        `GetCategoryMastersDropdownByCallType/${callType}`,
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      const mapped = (res?.data ?? []).map((item: any) => ({
        id: item.value,
        name: item.label,
      }));
      console.log("cat res", res);

      setCategoryDropdown(mapped);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [authState]);

  const fetchFosVisitStatusDropdown = useCallback(async () => {
    try {
      const res = await getDropdownByEndpoint(
        "GetFOSVisitStatusDropdown",
        String(authState.token),
        String(authState.antiforgeryToken)
      );

      const mapped = (res?.data ?? []).map((item: any) => ({
        id: item.value,
        name: item.label,
      }));

      setFosVisitStatusDropdown(mapped);
    } catch (error) {
      console.error("Failed to fetch FOS visit status:", error);
    }
  }, [authState]);

  // ================= HELPERS =================
  const handleApiError = (error: any, fallbackMessage: string) => {
    const status = error?.response?.status;
    if (status === 401) {
      Alert.alert(t("common.sessionExpired"), t("common.pleaseLoginAgain"));
      router.replace("/login");
      return;
    }
    Alert.alert(t("common.error"), t(fallbackMessage));
  };

  const initializeFormData = () => {
    if (!interactionItem) return;

    const {
      statusId, statusName,
      subStatusId, subStatusName,
      categoryId, categoryName,
      brandName: brand, productDiscount: discount,
      fosVisitDate: visitDate, fosVisitStatus: visitStatus,
      fosSecondVisitDate: secondDate, fosSecondVisitStatus: secondStatus,
      fosThirdVisitDate: thirdDate, fosThirdVisitStatus: thirdStatus,
      closeRemarks
    } = interactionItem;

    if (statusId && statusName) {
      setTaskstatus({ id: statusId, name: statusName });
      fetchSubStatusDropdown(statusId);
    }

    if (subStatusId && subStatusName) {
      setSubStatus({ id: subStatusId, name: subStatusName });
    }

    if (categoryId && categoryName) {
      setSelectedCategory({ id: categoryId, name: categoryName });
    }

    setBrandName(brand || "");
    setProductDiscount(discount?.toString() || "");
    setFosVisitDate(visitDate || "");
    setFosSecondVisitDate(secondDate || "");
    setFosThirdVisitDate(thirdDate || "");

    if (visitStatus) setSelectedFosVisitStatus({ id: 0, name: visitStatus });
    if (secondStatus) setSelectedFosSecondVisitStatus({ id: 0, name: secondStatus });
    if (thirdStatus) setSelectedFosThirdVisitStatus({ id: 0, name: thirdStatus });
    if (closeRemarks) setNotes(closeRemarks);
  };

  const saveActivity = useCallback(async (
    interactionId: number,
    oldValues: {
      oldTaskstatus: string;
      oldSubStatus: string;
      oldComment: string;
    },
    newValues: {
      newTaskstatus: string;
      newSubStatus: string;
      newComment: string;
    },
    activityStatus: string,
    transactionNumber?: string
  ) => {
    try {
      const userRes = await getUserDataById({
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      const firstName = userRes?.data?.firstName || "";
      const lastName = userRes?.data?.lastName || "";
      const activityByName = `${firstName} ${lastName}`.trim();

      const changes = [];
      const { oldTaskstatus, oldSubStatus, oldComment } = oldValues;
      const { newTaskstatus, newSubStatus, newComment } = newValues;

      if (oldTaskstatus !== newTaskstatus) {
        changes.push(`${t("updateStatus.statusChanged")} "${oldTaskstatus || t("common.noData")}" ${t("updateStatus.to")} "${newTaskstatus || t("common.noData")}"`);
      }

      if (oldSubStatus !== newSubStatus) {
        changes.push(`${t("updateStatus.subStatusChanged")} "${oldSubStatus || t("common.noData")}" ${t("updateStatus.to")} "${newSubStatus || t("common.noData")}"`);
      }

      if (oldComment !== newComment) {
        if (oldComment && !newComment) {
          changes.push(t("updateStatus.commentRemoved"));
        } else if (!oldComment && newComment) {
          changes.push(`${t("updateStatus.commentAdded")}: "${truncateText(newComment, 50)}"`);
        } else if (oldComment && newComment) {
          changes.push(`${t("updateStatus.commentUpdated")} "${truncateText(oldComment)}" ${t("updateStatus.to")} "${truncateText(newComment)}"`);
        }
      }

      const activityDescription = changes.length === 0
        ? t("updateStatus.noChanges")
        : changes.join(", ");

      const payload = {
        activityTime: new Date().toISOString(),
        activityInteractionId: interactionId,
        activityActionName: "UPDATE",
        activityDescription,
        activityStatus,
        activityById: String(authState.userId),
        activityByName,
        activityRelatedTo: "CAS",
        activityRelatedToId: interactionId,
        activityRelatedToName: transactionNumber || `${t("updateStatus.task")}${interactionId}`,
      };

      await addInteractionActivityHistory({
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
        body: payload,
      });
    } catch (err) {
      console.error("❌ Activity save error:", err);
    }
  }, [authState, t]);

  const sendLocation = useCallback(async (id: any) => {
    try {
      const location = await fetchLocation();
      if (!location) return;

      const { latitude, longitude } = location.coords;
      const payload = {
        name: address ?? t("updateStatus.unknownLocation"),
        latitute: latitude.toString(),
        longititute: longitude.toString(),
        discriptions: address ?? "",
        elderPinLocation: "string",
        froPinLocation: String(address),
        userId: String(authState.userId),
      };

      await addAndUpdateFROLocation(payload);
    } catch (error) {
      console.error("❌ Location update error:", error);
    }
  }, [authState.userId, fetchLocation, address, t]);

  const validateForm = useCallback((): boolean => {
    if (!Taskstatus) {
      Alert.alert(t("common.validationError"), t("updateStatus.selectStatus"));
      return false;
    }

    if (isClosedStatus && !notes.trim()) {
      Alert.alert(t("common.validationError"), t("updateStatus.commentRequired"));
      return false;
    }

    return true;
  }, [Taskstatus, isClosedStatus, notes, t]);

  const handleUpdate = useCallback(async () => {
    if (!validateForm() || !caseId || !interactionItem) return;

    setIsLoading(true);

    const oldValues = {
      oldTaskstatus: interactionItem.statusName || "",
      oldSubStatus: interactionItem.subStatusName || "",
      oldComment: interactionItem.closeRemarks || "",
    };

    const newValues = {
      newTaskstatus: Taskstatus!.name,
      newSubStatus: subStatus?.name || "",
      newComment: isClosedStatus ? notes.trim() : "",
    };

    try {
      const updatePayload = {
        id: caseId,
        statusId: Taskstatus!.id,
        statusName: Taskstatus!.name,
        subStatusId: subStatus?.id ?? 0,
        subStatusName: subStatus?.name ?? "",
        categoryId: selectedCategory?.id ?? 0,
        categoryName: selectedCategory?.name ?? "",
        brandName: brandName,
        productDiscount: productDiscount ? parseFloat(productDiscount) : 0,
        fosVisitDate: fosVisitDate,
        fosVisitStatus: selectedFosVisitStatus?.name || "",
        fosSecondVisitDate: fosSecondVisitDate,
        fosSecondVisitStatus: selectedFosSecondVisitStatus?.name || "",
        fosThirdVisitDate: fosThirdVisitDate,
        fosThirdVisitStatus: selectedFosThirdVisitStatus?.name || "",
        callBack: "",
        assignToId: String(authState.userId),
        ...(isClosedStatus && { closeRemarks: notes.trim() }),
      };

      const res = await updateInteraction({
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
        data: updatePayload,
      });

      await saveActivity(
        caseId,
        oldValues,
        newValues,
        res?.success ? "SUCCESS" : res?.status || "FAILED",
        interactionItem.transactionNumber
      );

      if (res?.success) {
        Alert.alert(t("common.success"), t("updateStatus.updateSuccess"), [
          { text: t("common.ok"), onPress: () => router.replace("/(fro)/(complaints)") }
        ]);
        sendLocation(caseId);
      }
    } catch (error: any) {
      console.error("❌ Update failed:", error);

      await saveActivity(
        caseId,
        oldValues,
        newValues,
        "FAILED",
        interactionItem.transactionNumber
      );

      handleApiError(error, "common.somethingWentWrong");
    } finally {
      setIsLoading(false);
    }
  }, [
    caseId, interactionItem, Taskstatus, subStatus, isClosedStatus, notes,
    selectedCategory, brandName, productDiscount, fosVisitDate,
    selectedFosVisitStatus, fosSecondVisitDate, selectedFosSecondVisitStatus,
    fosThirdVisitDate, selectedFosThirdVisitStatus, authState, validateForm,
    saveActivity, sendLocation, t
  ]);

  const handleSubStatusPress = useCallback(() => {
    if (!Taskstatus) {
      setShowSubStatusWarning(true);
      return;
    }
    setDropdownType("SUB");
  }, [Taskstatus]);

  const handleDropdownSelect = useCallback((type: DropdownType, item: DropdownItem) => {
    switch (type) {
      case "CASE":
        setTaskstatus(item);
        setSubStatus(null);
        setShowSubStatusWarning(false);
        fetchSubStatusDropdown(item.id);
        break;
      case "SUB":
        setSubStatus(item);
        break;
      case "CATEGORY":
        setSelectedCategory(item);
        break;
      case "FOS_VISIT":
        setSelectedFosVisitStatus(item);
        break;
      case "FOS_SECOND_VISIT":
        setSelectedFosSecondVisitStatus(item);
        break;
      case "FOS_THIRD_VISIT":
        setSelectedFosThirdVisitStatus(item);
        break;
    }
    setDropdownType(null);
  }, [fetchSubStatusDropdown]);

  // ================= RENDER HELPERS =================
  const renderDropdown = (type: DropdownType, data: DropdownItem[]) => (
    <>
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.sheetItem, { borderBottomColor: theme.colors.colorBorder + "30" }]}
          onPress={() => handleDropdownSelect(type, item)}
        >
          <Text style={[styles.sheetItemText, { color: theme.colors.colorTextPrimary }]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderFOSSection = (
    title: string,
    dateValue: string,
    onDateChange: (text: string) => void,
    statusValue: SelectedItem,
    statusType: DropdownType
  ) => (
    <View style={[styles.sectionContainer, { borderColor: theme.colors.colorBorder }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.colorTextPrimary }]}>
        {title}
      </Text>

      <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
        {t("updateStatus.visitDate")} ({t("common.optional")})
      </Text>
      <TextInput
        style={[styles.input, {
          backgroundColor: theme.colors.colorBgSurface,
          borderColor: theme.colors.colorBorder,
          color: theme.colors.colorTextPrimary,
        }]}
        value={dateValue}
        onChangeText={onDateChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.colors.inputPlaceholder}
      />

      <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
        {t("updateStatus.visitStatus")} ({t("common.optional")})
      </Text>
      <TouchableOpacity
        style={[styles.dropdown, {
          backgroundColor: theme.colors.colorBgSurface,
          borderColor: theme.colors.colorBorder,
        }]}
        onPress={() => setDropdownType(statusType)}
      >
        <Text style={[
          statusValue ? styles.value : styles.placeholder,
          { color: statusValue ? theme.colors.colorTextPrimary : theme.colors.inputPlaceholder }
        ]}>
          {statusValue?.name || t("updateStatus.selectVisitStatus")}
        </Text>
        <Ionicons name="chevron-down" size={moderateScale(20)} color={theme.colors.inputPlaceholder} />
      </TouchableOpacity>
    </View>
  );

  // Loading/Error States
  if (isParsing || isInitializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.colorBgPage }]}>
        <ActivityIndicator size="large" color={theme.colors.colorPrimary600} />
        <Text style={[styles.loadingText, { color: theme.colors.colorTextSecondary }]}>
          {t("updateStatus.loadingTask")}
        </Text>
      </View>
    );
  }

  if (!interactionItem) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.colorBgPage }]}>
        <Ionicons name="alert-circle-outline" size={moderateScale(60)} color={theme.colors.colorAccent700} />
        <Text style={[styles.errorText, { color: theme.colors.colorTextSecondary }]}>
          {t("updateStatus.noData")}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.colorPrimary600 }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.colorBgPage }]}>
            {t("common.goBack")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.colorBgPage }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.colorPrimary600 }]}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.colorBgPage} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: theme.colors.colorBgPage }]}>
                {t("updateStatus.title")} {caseId}
              </Text>
              {interactionItem.subject && (
                <Text style={[styles.headerSubtitle, { color: `${theme.colors.colorBgPage}CC` }]} numberOfLines={1}>
                  {interactionItem.subject}
                </Text>
              )}
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* Brand Name */}
            <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
              {t("updateStatus.brandName")} ({t("common.optional")})
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.colorBorder,
                color: theme.colors.colorTextPrimary,
              }]}
              value={brandName}
              onChangeText={setBrandName}
              placeholder={t("updateStatus.enterBrandName")}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />
            {/* Category */}
            <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
              {t("updateStatus.selectCategory")} ({t("common.optional")})
            </Text>
            <TouchableOpacity
              style={[styles.dropdown, {
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.colorBorder,
              }]}
              onPress={() => setDropdownType("CATEGORY")}
            >
              <Text style={[
                selectedCategory ? styles.value : styles.placeholder,
                { color: selectedCategory ? theme.colors.colorTextPrimary : theme.colors.inputPlaceholder }
              ]}>
                {selectedCategory?.name || t("updateStatus.selectCategory")}
              </Text>
              <Ionicons name="chevron-down" size={moderateScale(20)} color={theme.colors.inputPlaceholder} />
            </TouchableOpacity>


            {/* Status */}
            <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
              {t("updateStatus.selectTaskStatus")} *
            </Text>
            <TouchableOpacity
              style={[styles.dropdown, {
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.colorBorder,
              }]}
              onPress={() => setDropdownType("CASE")}
            >
              <Text style={[
                Taskstatus ? styles.value : styles.placeholder,
                { color: Taskstatus ? theme.colors.colorTextPrimary : theme.colors.inputPlaceholder }
              ]}>
                {Taskstatus?.name || t("updateStatus.selectTaskStatus")}
              </Text>
              <Ionicons name="chevron-down" size={moderateScale(20)} color={theme.colors.inputPlaceholder} />
            </TouchableOpacity>

            {/* Sub Status */}
            <View>
              <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
                {t("updateStatus.selectSubStatus")} ({t("common.optional")})
              </Text>

              {showSubStatusWarning && (
                <View style={[styles.warningContainer, {
                  backgroundColor: theme.colors.colorAccent500 + "20",
                  borderColor: theme.colors.colorAccent500 + "40",
                }]}>
                  <Ionicons name="warning-outline" size={moderateScale(16)} color={theme.colors.colorAccent700} />
                  <Text style={[styles.warningText, { color: theme.colors.colorAccent700 }]}>
                    {t("updateStatus.selectStatusFirst")}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.dropdown, {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.colorBorder,
                }, !Taskstatus && styles.disabledDropdown]}
                onPress={handleSubStatusPress}
                disabled={!Taskstatus}
              >
                <Text style={[
                  subStatus ? styles.value : styles.placeholder,
                  { color: subStatus ? theme.colors.colorTextPrimary : theme.colors.inputPlaceholder }
                ]}>
                  {subStatus?.name || t("updateStatus.selectSubStatus")}
                </Text>
                <Ionicons name="chevron-down" size={moderateScale(20)} color={
                  Taskstatus ? theme.colors.inputPlaceholder : theme.colors.colorBorder
                } />
              </TouchableOpacity>
            </View>


            {/* Product Discount */}
            <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
              {t("updateStatus.productDiscount")} (%) ({t("common.optional")})
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.colorBorder,
                color: theme.colors.colorTextPrimary,
              }]}
              value={productDiscount}
              onChangeText={setProductDiscount}
              placeholder={t("updateStatus.enterDiscount")}
              placeholderTextColor={theme.colors.inputPlaceholder}
              keyboardType="numeric"
            />

            {/* FOS Sections */}
            {renderFOSSection(
              t("updateStatus.fosFirstVisit"),
              fosVisitDate,
              setFosVisitDate,
              selectedFosVisitStatus,
              "FOS_VISIT"
            )}

            {renderFOSSection(
              t("updateStatus.fosSecondVisit"),
              fosSecondVisitDate,
              setFosSecondVisitDate,
              selectedFosSecondVisitStatus,
              "FOS_SECOND_VISIT"
            )}

            {renderFOSSection(
              t("updateStatus.fosThirdVisit"),
              fosThirdVisitDate,
              setFosThirdVisitDate,
              selectedFosThirdVisitStatus,
              "FOS_THIRD_VISIT"
            )}

            {/* Comments for Closed Status */}
            {isClosedStatus && (
              <>
                <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
                  {t("updateStatus.comment")} *
                </Text>
                <TextInput
                  ref={notesInputRef}
                  style={[styles.textArea, {
                    backgroundColor: theme.colors.colorBgSurface,
                    borderColor: theme.colors.colorBorder,
                    color: theme.colors.colorTextPrimary,
                  }]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder={t("updateStatus.enterClosingRemarks")}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                />
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.colors.colorPrimary600 }]}
              onPress={handleUpdate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.colorBgPage} />
              ) : (
                <Text style={[styles.submitText, { color: theme.colors.colorBgPage }]}>
                  {t("common.update")}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Sheet Modal */}
          <Modal transparent visible={!!dropdownType} animationType="slide">
            <TouchableOpacity
              style={styles.bottomSheetOverlay}
              onPress={() => {
                setDropdownType(null);
                setShowSubStatusWarning(false);
              }}
              activeOpacity={1}
            >
              <View style={[styles.bottomSheet, { backgroundColor: theme.colors.colorBgPage }]}>
                {dropdownType === "CASE" && renderDropdown("CASE", statusDropdown)}
                {dropdownType === "SUB" && renderDropdown("SUB", subStatusDropdown)}
                {dropdownType === "CATEGORY" && renderDropdown("CATEGORY", categoryDropdown)}
                {dropdownType === "FOS_VISIT" && renderDropdown("FOS_VISIT", fosVisitStatusDropdown)}
                {dropdownType === "FOS_SECOND_VISIT" && renderDropdown("FOS_SECOND_VISIT", fosVisitStatusDropdown)}
                {dropdownType === "FOS_THIRD_VISIT" && renderDropdown("FOS_THIRD_VISIT", fosVisitStatusDropdown)}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UpdateStatusScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(14),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(18),
    marginBottom: verticalScale(20),
  },
  backButton: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  backButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40),
    padding: moderateScale(16),
    flexDirection: "row",
    alignItems: "center",
  },
  headerContent: {
    marginLeft: moderateScale(12),
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: moderateScale(13),
    marginTop: verticalScale(2),
  },
  content: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(30),
  },
  sectionContainer: {
    marginTop: verticalScale(16),
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginBottom: verticalScale(8),
  },
  label: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(6),
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  dropdown: {
    borderWidth: 1,
    padding: moderateScale(14),
    borderRadius: moderateScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  disabledDropdown: {
    opacity: 0.6,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(8),
    borderRadius: moderateScale(6),
    marginBottom: verticalScale(6),
    borderWidth: 1,
  },
  warningText: {
    fontSize: moderateScale(12),
    marginLeft: moderateScale(4),
    fontWeight: "500",
  },
  placeholder: {
    fontSize: moderateScale(14),
  },
  value: {
    fontSize: moderateScale(14),
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    fontSize: moderateScale(14),
    marginBottom: verticalScale(8),
  },
  textArea: {
    borderWidth: 1,
    borderRadius: moderateScale(10),
    height: verticalScale(100),
    padding: moderateScale(12),
    textAlignVertical: "top",
    fontSize: moderateScale(14),
  },
  submitBtn: {
    marginTop: verticalScale(24),
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  bottomSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    maxHeight: height * 0.5,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: Platform.OS === "ios" ? verticalScale(30) : verticalScale(20),
  },
  sheetItem: {
    padding: moderateScale(16),
    borderBottomWidth: 1,
  },
  sheetItemText: {
    fontSize: moderateScale(16),
  },
});