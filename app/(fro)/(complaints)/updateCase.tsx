import {
  getDropdownByEndpoint,
  getDropdownByEndpointAndId,
} from "@/features/fro/dropdownApi";
import { addAndUpdateFROLocation } from "@/features/fro/froLocationApi";
import { addInteractionActivityHistory } from "@/features/fro/interaction/ActivityHistory";
import { updateInteraction } from "@/features/fro/interactionApi";
import { getUserDataById } from "@/features/fro/profile/getProfile";

import { useLocation } from "@/hooks/LocationContext";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

type DropdownItem = {
  id: number;
  name: string;
};

/* ================= TYPES ================= */
type Attachment = {
  uri: string;
  name: string;
  type: "image" | "file";
};

type InteractionItem = {
  id: number;
  transactionNumber?: string;
  statusId?: number;
  statusName?: string;
  subStatusId?: number;
  subStatusName?: string;
  categoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  subject?: string;
  name?: string;
  gender?: string;
  stateId?: number;
  stateName?: string;
  districtId?: number;
  districtName?: string;
  closeRemarks?: string;
  callBackDateTime?: string | null;
  callBack?: string;
  priority?: string;
  contactId?: number;
  contactName?: string;
  teamId?: number;
  teamName?: string;
  source?: string;
  emailId?: string;
  mobileNo?: string;
  assignToId?: string;
  assignToName?: string;
  taskDescription?: string;
  openTime?: string;
  closeTime?: string | null;
  taskTime?: string;
  activityByName?: string;
  pinCode?: string;
  alternateNo?: string;
  latitude?: string | null;
  longitude?: string | null;
  pinLocation?: string;
  address?: string;
  createdByName?: string | null;
  companyName?: string;
  createdBy?: string;
  createdDate?: string;
  comment?: string;
  caseDescription?: string;
  agentRemarks?: string;
};

/* ================= RESPONSIVE SCALING ================= */
const { width, height } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const UpdateStatusScreen = () => {
  const authState = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const params = useLocalSearchParams();
  const [statusDropdown, setStatusDropdown] = useState<DropdownItem[]>([]);
  const [subStatusDropdown, setSubStatusDropdown] = useState<DropdownItem[]>(
    [],
  );

  const caseId = params.caseId ? Number(params.caseId) : null;
  const itemString = params.item as string;

  // Parse the item data properly
  const [interactionItem, setInteractionItem] = useState<InteractionItem | null>(null);
  const [isParsing, setIsParsing] = useState(true);

  useEffect(() => {
    if (itemString) {
      try {
        const parsedItem = JSON.parse(itemString);
        console.log("✅ Parsed item:", parsedItem);
        setInteractionItem(parsedItem);
      } catch (error) {
        console.error("❌ Failed to parse item:", error);
        Alert.alert(
          t("common.error"),
          t("updateStatus.loadFailed")
        );
      } finally {
        setIsParsing(false);
      }
    } else {
      setIsParsing(false);
    }
    fetchStatusDropdown();
  }, [itemString]);

  const fetchStatusDropdown = async () => {
    try {
      const res = await getDropdownByEndpoint(
        "GetStatusMasterDropdown",
        String(authState.token),
        String(authState.antiforgeryToken),
      );
      console.log("statuwqfews", res);
      const mapped = (res?.data ?? []).map((item: any) => ({
        id: item.value,
        name: item.label,
      }));

      setStatusDropdown(mapped);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        Alert.alert(
          t("common.sessionExpired"),
          t("common.pleaseLoginAgain")
        );
        router.replace("/login");
        return;
      }
      Alert.alert(
        t("common.error"),
        t("updateStatus.statusLoadFailed")
      );
    }
  };

  const fetchSubStatusDropdown = async (statusId: number) => {
    try {
      const res = await getDropdownByEndpointAndId(
        "GetSubStatusMasterById",
        statusId,
        String(authState.token),
        String(authState.antiforgeryToken),
      );

      console.log("subst", res);

      const mapped = (res?.data ?? []).map((item: any) => ({
        id: item.value,
        name: item.label,
      }));

      setSubStatusDropdown(mapped);
    } catch (e) {
      Alert.alert(
        t("common.error"),
        t("updateStatus.subStatusLoadFailed")
      );
    }
  };

  /* ---------- SAVE ACTIVITY HISTORY ---------- */
  const saveActivity = async ({
    interactionId,
    oldTaskstatus,
    newTaskstatus,
    oldSubStatus,
    newSubStatus,
    oldComment,
    newComment,
    activityStatus,
    transactionNumber,
  }: {
    interactionId: number;
    oldTaskstatus?: string;
    newTaskstatus?: string;
    oldSubStatus?: string;
    newSubStatus?: string;
    oldComment?: string;
    newComment?: string;
    activityStatus: string;
    transactionNumber?: string;
  }) => {
    try {
      /* ---------------- FETCH USER DATA FIRST ---------------- */
      const userRes = await getUserDataById({
        userId: String(authState?.userId),
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
      });

      const firstName = userRes?.data?.firstName || "";
      const lastName = userRes?.data?.lastName || "";
      const activityByName = `${firstName} ${lastName}`.trim();

      /* ---------------- BUILD ACTIVITY DESCRIPTION BASED ON CHANGES ---------------- */
      const changes = [];

      // Check if case status changed
      if (oldTaskstatus !== newTaskstatus) {
        changes.push(
          `${t("updateStatus.statusChanged")} "${oldTaskstatus || t("common.noData")}" ${t("updateStatus.to")} "${newTaskstatus || t("common.noData")}"`,
        );
      }

      // Check if sub status changed
      if (oldSubStatus !== newSubStatus) {
        changes.push(
          `${t("updateStatus.subStatusChanged")} "${oldSubStatus || t("common.noData")}" ${t("updateStatus.to")} "${newSubStatus || t("common.noData")}"`,
        );
      }

      // Check if comment changed (closeRemarks field)
      if (oldComment !== newComment) {
        if (oldComment && !newComment) {
          changes.push(t("updateStatus.commentRemoved"));
        } else if (!oldComment && newComment) {
          // Truncate long comments for readability
          const truncateComment = (comment: string) => {
            if (comment.length <= 50) return comment;
            return comment.substring(0, 50) + "...";
          };
          changes.push(
            `${t("updateStatus.commentAdded")}: "${truncateComment(newComment)}"`,
          );
        } else if (oldComment && newComment) {
          // Both have values and they're different
          const truncateOld = oldComment.length <= 30 ? oldComment : oldComment.substring(0, 30) + "...";
          const truncateNew = newComment.length <= 30 ? newComment : newComment.substring(0, 30) + "...";
          changes.push(
            `${t("updateStatus.commentUpdated")} "${truncateOld}" ${t("updateStatus.to")} "${truncateNew}"`,
          );
        }
      }

      // Build activity description
      let activityDescription = "";
      if (changes.length === 0) {
        activityDescription = t("updateStatus.noChanges");
      } else if (changes.length === 1) {
        activityDescription = changes[0];
      } else {
        activityDescription = changes.join(", ");
      }

      /* ---------------- ACTIVITY PAYLOAD ---------------- */
      const payload = {
        activityTime: new Date().toISOString(),
        activityInteractionId: interactionId,
        activityActionName: "UPDATE",
        activityDescription,
        activityStatus,
        activityById: String(authState?.userId),
        activityByName,
        activityRelatedTo: "CAS",
        activityRelatedToId: interactionId,
        activityRelatedToName: transactionNumber || `${t("updateStatus.task")}${interactionId}`,
      };

      console.log("📤 Status Update Activity Payload:", payload);

      const response = await addInteractionActivityHistory({
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        body: payload,
      });

      console.log("✅ Status Update Activity Response:", response);
    } catch (err) {
      console.error("❌ Activity save error:", err);
    }
  };

  const handleUpdate = async () => {
    if (!Taskstatus) {
      Alert.alert(
        t("common.validationError"),
        t("updateStatus.selectStatus")
      );
      return;
    }

    // Check if selected status is "Closed" (value 4)
    const isClosed = Taskstatus.id === 4;

    // If status is Closed, validate that comment is provided
    if (isClosed && !notes.trim()) {
      Alert.alert(
        t("common.validationError"),
        t("updateStatus.commentRequired")
      );
      return;
    }

    proceedWithUpdate(isClosed);
  };

  const proceedWithUpdate = async (isClosed: boolean) => {
    // Capture old values before making API call
    const oldTaskstatus = interactionItem?.statusName || "";
    const oldSubStatus = interactionItem?.subStatusName || "";
    const oldComment = interactionItem?.closeRemarks || "";
    const transactionNumber = interactionItem?.transactionNumber || "";

    try {
      setIsLoading(true);

      // Prepare update payload
      const updatePayload: any = {
        id: Number(caseId),
        statusId: Taskstatus!.id,
        statusName: Taskstatus!.name,
        subStatusId: subStatus?.id ?? 0,
        subStatusName: subStatus?.name ?? "",
        callBack: "",
        assignToId: String(authState.userId),
      };

      // Only pass closeRemarks if status is Closed (value 4)
      if (isClosed) {
        updatePayload.closeRemarks = notes.trim();
      }

      console.log("📤 Update Payload:", updatePayload);

      const res = await updateInteraction({
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
        data: updatePayload,
      });

      if (res?.success) {
        // Save activity history after successful update
        await saveActivity({
          interactionId: Number(caseId),
          oldTaskstatus,
          newTaskstatus: Taskstatus!.name,
          oldSubStatus,
          newSubStatus: subStatus?.name || "",
          oldComment,
          newComment: isClosed ? notes.trim() : "",
          activityStatus: "SUCCESS",
          transactionNumber,
        });

        Alert.alert(
          t("common.success"),
          t("updateStatus.updateSuccess"),
          [
            {
              text: t("common.ok"),
              onPress: () => router.replace("/(fro)/(complaints)"),
            },
          ]
        );
        sendLocation(caseId);
        return;
      }

      // If update failed but we have error status
      await saveActivity({
        interactionId: Number(caseId),
        oldTaskstatus,
        newTaskstatus: Taskstatus!.name,
        oldSubStatus,
        newSubStatus: subStatus?.name || "",
        oldComment,
        newComment: isClosed ? notes.trim() : "",
        activityStatus: res?.status || "FAILED",
        transactionNumber,
      });

      console.log("update", res);
    } catch (error: any) {
      console.error("❌ Update failed:", error);

      // Save failed activity
      await saveActivity({
        interactionId: Number(caseId),
        oldTaskstatus,
        newTaskstatus: Taskstatus!.name,
        oldSubStatus,
        newSubStatus: subStatus?.name || "",
        oldComment,
        newComment: isClosed ? notes.trim() : "",
        activityStatus: "FAILED",
        transactionNumber,
      });

      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        t("common.somethingWentWrong");

      if (status === 401) {
        Alert.alert(
          t("common.sessionExpired"),
          t("common.pleaseLoginAgain"),
          [
            {
              text: t("common.ok"),
              onPress: () => router.replace("/login"),
            },
          ]
        );
        return;
      }

      if (status === 400) {
        Alert.alert(
          t("updateStatus.updateFailed"),
          message
        );
        return;
      }

      if (!error?.response) {
        Alert.alert(
          t("common.networkError"),
          t("common.checkInternet"),
        );
        return;
      }

      Alert.alert(t("common.error"), message);
    } finally {
      setIsLoading(false);
    }
  };

  const [Taskstatus, setTaskstatus] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [subStatus, setSubStatus] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [dropdownType, setDropdownType] = useState<"CASE" | "SUB" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSubStatusWarning, setShowSubStatusWarning] = useState(false);
  const { hasPermission, fetchLocation, address } = useLocation();

  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const initializedRef = useRef(false);

  // console.log("params", params);

  useEffect(() => {
    if (!interactionItem || initializedRef.current) {
      setIsInitializing(false);
      return;
    }

    // Map statusId/statusName to Taskstatus (using the actual field names from your data)
    if (interactionItem.statusId !== undefined && interactionItem.statusName) {
      console.log("Setting status:", interactionItem.statusId, interactionItem.statusName);
      setTaskstatus({
        id: interactionItem.statusId,
        name: interactionItem.statusName,
      });
      fetchSubStatusDropdown(interactionItem.statusId);
    }

    // Map subStatusId/subStatusName to subStatus (using the actual field names from your data)
    if (interactionItem.subStatusId !== undefined && interactionItem.subStatusName) {
      console.log("Setting subStatus:", interactionItem.subStatusId, interactionItem.subStatusName);
      setSubStatus({
        id: interactionItem.subStatusId,
        name: interactionItem.subStatusName,
      });
    }

    // Map closeRemarks to notes (comment field)
    if (interactionItem.closeRemarks) {
      console.log("Setting comment from closeRemarks:", interactionItem.closeRemarks);
      setNotes(interactionItem.closeRemarks);
    }

    initializedRef.current = true;
    setIsInitializing(false);
  }, [interactionItem]);

  const sendLocation = async (id: any) => {
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

      const res = await addAndUpdateFROLocation(payload);
      console.log("✅ Update Ticket:", res);
    } catch (error) {
      // console.error("❌ Location update error:", error);
    }
  };

  const handleSubStatusPress = () => {
    if (!Taskstatus) {
      setShowSubStatusWarning(true);
      return;
    }
    setDropdownType("SUB");
  };

  const submitHandler = useCallback(() => {
    if (!Taskstatus) {
      Alert.alert(
        t("common.error"),
        t("updateStatus.selectStatus")
      );
      return;
    }

    handleUpdate();
  }, [Taskstatus, subStatus, notes]);

  // Show loading while parsing
  if (isParsing || isInitializing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.colorBgPage },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.colorPrimary600} />
        <Text
          style={[
            styles.loadingText,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {t("updateStatus.loadingTask")}
        </Text>
      </View>
    );
  }

  if (!interactionItem) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.colorBgPage },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={moderateScale(60)}
          color={theme.colors.colorAccent700}
        />
        <Text
          style={[styles.errorText, { color: theme.colors.colorTextSecondary }]}
        >
          {t("updateStatus.noData")}
        </Text>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: theme.colors.colorPrimary600 },
          ]}
          onPress={() => router.back()}
        >
          <Text
            style={[styles.backButtonText, { color: theme.colors.colorBgPage }]}
          >
            {t("common.goBack")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if current status is Closed (value 4)
  const isClosedStatus = Taskstatus?.id === 4;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.colorBgPage }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* HEADER */}
          <View
            style={[
              styles.header,
              { backgroundColor: theme.colors.colorPrimary600 },
            ]}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={moderateScale(24)}
                color={theme.colors.colorBgPage}
              />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text
                style={[
                  styles.headerTitle,
                  { color: theme.colors.colorBgPage },
                ]}
              >
                {t("updateStatus.title")} {caseId}
              </Text>
              {!!interactionItem.subject && (
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: `${theme.colors.colorBgPage}CC` },
                  ]}
                  numberOfLines={1}
                >
                  {interactionItem.subject}
                </Text>
              )}
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* STATUS */}
            <Text
              style={[styles.label, { color: theme.colors.colorTextSecondary }]}
            >
              {t("updateStatus.selectTaskStatus")} *
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.colorBorder,
                },
              ]}
              onPress={() => setDropdownType("CASE")}
            >
              <Text
                style={[
                  Taskstatus ? styles.value : styles.placeholder,
                  {
                    color: Taskstatus
                      ? theme.colors.colorTextPrimary
                      : theme.colors.inputPlaceholder,
                    fontWeight: Taskstatus ? "500" : "400",
                  },
                ]}
              >
                {Taskstatus?.name || t("updateStatus.selectTaskStatus")}
              </Text>
              <Ionicons
                name="chevron-down"
                size={moderateScale(20)}
                color={theme.colors.inputPlaceholder}
              />
            </TouchableOpacity>

            {/* SUB STATUS */}
            <View>
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {t("updateStatus.selectSubStatus")} ({t("common.optional")})
              </Text>

              {showSubStatusWarning && (
                <View
                  style={[
                    styles.warningContainer,
                    {
                      backgroundColor: theme.colors.colorAccent500 + "20",
                      borderColor: theme.colors.colorAccent500 + "40",
                    },
                  ]}
                >
                  <Ionicons
                    name="warning-outline"
                    size={moderateScale(16)}
                    color={theme.colors.colorAccent700}
                  />
                  <Text
                    style={[
                      styles.warningText,
                      { color: theme.colors.colorAccent700 },
                    ]}
                  >
                    {t("updateStatus.selectStatusFirst")}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.colorBgSurface,
                    borderColor: theme.colors.colorBorder,
                  },
                  !Taskstatus && styles.disabledDropdown,
                ]}
                onPress={handleSubStatusPress}
                disabled={!Taskstatus}
              >
                <Text
                  style={[
                    subStatus ? styles.value : styles.placeholder,
                    {
                      color: subStatus
                        ? theme.colors.colorTextPrimary
                        : theme.colors.inputPlaceholder,
                      fontWeight: subStatus ? "500" : "400",
                    },
                  ]}
                >
                  {subStatus?.name || t("updateStatus.selectSubStatus")}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={moderateScale(20)}
                  color={
                    Taskstatus
                      ? theme.colors.inputPlaceholder
                      : theme.colors.colorBorder
                  }
                />
              </TouchableOpacity>
            </View>

            {/* COMMENT FIELD - Only show when status is Closed */}
            {isClosedStatus && (
              <>
                <Text
                  style={[styles.label, { color: theme.colors.colorTextSecondary }]}
                >
                  {t("updateStatus.comment")} *
                </Text>
                <TextInput
                  ref={notesInputRef}
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.colors.colorBgSurface,
                      borderColor: theme.colors.colorBorder,
                      color: theme.colors.colorTextPrimary,
                    },
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder={t("updateStatus.enterClosingRemarks")}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                />
              </>
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: theme.colors.colorPrimary600 },
              ]}
              onPress={submitHandler}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.colorBgPage} />
              ) : (
                <Text
                  style={[
                    styles.submitText,
                    { color: theme.colors.colorBgPage },
                  ]}
                >
                  {t("common.update")}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* BOTTOM SHEET */}
          <Modal transparent visible={!!dropdownType} animationType="slide">
            <TouchableOpacity
              style={styles.bottomSheetOverlay}
              onPress={() => {
                setDropdownType(null);
                setShowSubStatusWarning(false);
              }}
              activeOpacity={1}
            >
              <View
                style={[
                  styles.bottomSheet,
                  { backgroundColor: theme.colors.colorBgPage },
                ]}
              >
                {(dropdownType === "CASE"
                  ? statusDropdown
                  : subStatusDropdown
                ).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.sheetItem,
                      {
                        borderBottomColor: theme.colors.colorBorder + "30",
                      },
                    ]}
                    onPress={() => {
                      if (dropdownType === "CASE") {
                        setTaskstatus(item);
                        setSubStatus(null);
                        setShowSubStatusWarning(false);
                        fetchSubStatusDropdown(item.id);
                      } else {
                        setSubStatus(item);
                      }
                      setDropdownType(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.sheetItemText,
                        { color: theme.colors.colorTextPrimary },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UpdateStatusScreen;

/* ================= STYLES ================= */
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
  textArea: {
    borderWidth: 1,
    borderRadius: moderateScale(10),
    height: verticalScale(100),
    padding: moderateScale(12),
    textAlignVertical: "top",
    fontSize: moderateScale(14),
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(6),
  },
  fileName: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(4),
    paddingHorizontal: moderateScale(4),
    textAlign: "center",
  },
  removeAttachmentBtn: {
    position: "absolute",
    top: -moderateScale(6),
    right: -moderateScale(6),
    backgroundColor: "#fff",
    borderRadius: moderateScale(12),
    zIndex: 1,
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
    bottom: 110,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    maxHeight: height * 0.5,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom:
      Platform.OS === "ios" ? verticalScale(30) : verticalScale(20),
  },
  sheetItem: {
    padding: moderateScale(16),
    borderBottomWidth: 1,
  },
  sheetItemText: {
    fontSize: moderateScale(16),
  },
});