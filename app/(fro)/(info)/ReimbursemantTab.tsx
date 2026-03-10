import Card from "@/components/reusables/Card";
import { createReimbursement } from "@/features/fro/Attendance/leaves/createReimbursement";
import { getReimbursementList } from "@/features/fro/Attendance/leaves/getReimbursementList";
import { getInteractionsListByAssignToId } from "@/features/fro/interactionApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";

const { height } = Dimensions.get("window");

interface Attachment {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface TaskOption {
  label: string;
  value: string;
  contactName?: string;
  categoryName?: string;
  transactionNumber?: string;
  statusName?: string;
  priority?: string;
  createdDate?: string;
}

// Reimbursement List Interface
interface ReimbursementItem {
  id: string;
  taskNumber: string;
  amount: number;
  remarks: string;
  status: string;
  createdDate: string;
}

interface ReimbursementResponse {
  reimbursementList: ReimbursementItem[];
  totalRecords: number;
}

// Helper function to get safe icon name
const getIconName = (type: string): IconName => {
  if (type.includes("pdf")) return "file-pdf-line";
  if (type.includes("image")) return "file-image-line";
  if (type.includes("jpg") || type.includes("jpeg")) return "file-image-line";
  if (type.includes("png")) return "file-image-line";
  return "file-line";
};

// Helper function to get file icon and color using theme
const getFileIcon = (type: string, theme: any): { name: IconName; color: string } => {
  if (type.includes("pdf")) {
    return { name: "file-pdf-line", color: theme.colors.colorError600 };
  }
  if (type.includes("image")) {
    return { name: "file-image-line", color: theme.colors.colorSuccess600 };
  }
  if (type.includes("word") || type.includes("document")) {
    return { name: "file-word-line", color: theme.colors.colorPrimary600 };
  }
  if (type.includes("excel") || type.includes("sheet")) {
    return { name: "file-excel-line", color: theme.colors.colorSuccess600 };
  }
  return { name: "file-line", color: theme.colors.colorTextTertiary };
};

// Helper function to get status color using theme
const getStatusColor = (statusName?: string, theme?: any): string => {
  if (!theme) return "#757575";
  
  switch (statusName?.toLowerCase()) {
    case "open":
      return theme.colors.colorSuccess600;
    case "in-progress":
      return theme.colors.colorWarning600;
    case "closed":
      return theme.colors.colorTextTertiary;
    case "pending":
      return theme.colors.colorError600;
    case "approved":
      return theme.colors.colorSuccess600;
    case "rejected":
      return theme.colors.colorError600;
    default:
      return theme.colors.colorTextTertiary;
  }
};

// Helper function to get status background color using theme (lighter version)
const getStatusBackgroundColor = (statusName?: string, theme?: any): string => {
  if (!theme) return "#75757520";
  
  switch (statusName?.toLowerCase()) {
    case "open":
      return theme.colors.colorSuccess100;
    case "in-progress":
      return theme.colors.colorWarning100;
    case "closed":
      return theme.colors.colorBgAlt;
    case "pending":
      return theme.colors.colorError100;
    case "approved":
      return theme.colors.colorSuccess100;
    case "rejected":
      return theme.colors.colorError100;
    default:
      return theme.colors.colorBgAlt;
  }
};

// Format currency
const formatCurrency = (amount: number, locale: string = 'en-IN'): string => {
  return `₹${amount.toLocaleString(locale)}`;
};

// Format date with locale support
const formatDate = (dateString: string, locale: string = 'en'): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

// Format short date
const formatDateShort = (dateString?: string, locale: string = 'en'): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function ReimbursemantTab() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const authState = useAppSelector((state) => state.auth);

  // State management for form
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<TaskOption | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [remarks, setRemarks] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskOption[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [taskModalVisible, setTaskModalVisible] = useState<boolean>(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State management for reimbursement list
  const [reimbursements, setReimbursements] = useState<ReimbursementItem[]>([]);
  const [isLoadingReimbursements, setIsLoadingReimbursements] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedReimbursement, setSelectedReimbursement] = useState<ReimbursementItem | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);

  // Animation for attachment modal
  const slideAnim = useRef(new Animated.Value(height)).current;

  useFocusEffect(
    useCallback(() => {
      fetchInteractions();
      loadReimbursements(1, true);
    }, [])
  );

  // Filter tasks when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTasks(taskOptions);
    } else {
      const filtered = taskOptions.filter(
        (task) =>
          task.transactionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, taskOptions]);

  // Animation for attachment modal
  useEffect(() => {
    if (attachmentModalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [attachmentModalVisible]);

  const fetchInteractions = async () => {
    setIsLoadingTasks(true);
    try {
      const res = await getInteractionsListByAssignToId({
        assignToId: String(authState.userId),
        pageNumber: 1,
        pageSize: 100,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      if (res?.data?.interactions && Array.isArray(res.data.interactions)) {
        // Filter for Open or In-Progress tasks only (optional)
        const filteredInteractions = res.data.interactions.filter(
          (interaction: any) =>
            interaction.statusName === "Open" ||
            interaction.statusName === "In-Progress"
        );

        const options: TaskOption[] = filteredInteractions.map(
          (interaction: any) => ({
            label: `${interaction.transactionNumber} - ${interaction.contactName} (${interaction.categoryName})`,
            value: interaction.transactionNumber,
            contactName: interaction.contactName,
            categoryName: interaction.categoryName,
            transactionNumber: interaction.transactionNumber,
            statusName: interaction.statusName,
            priority: interaction.priority,
            createdDate: interaction.createdDate,
          })
        );

        setTaskOptions(options);
        setFilteredTasks(options);
      }
    } catch (error) {
      console.error("❌ Failed to fetch Tasks:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("reimbursement.taskLoadFailed") || "Failed to load tasks. Please try again."
      );
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadReimbursements = async (page: number = 1, reset: boolean = false) => {
    if (isLoadingReimbursements) return;

    setIsLoadingReimbursements(true);
    try {
      const res = await getReimbursementList({
        userId: String(authState.userId),
        pageNumber: page,
        pageSize: 10,
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("Reimbursement List 👉", res.data);

      if (res?.data) {
        const responseData = res.data as ReimbursementResponse;
        const newReimbursements = responseData.reimbursementList || [];
        
        setTotalRecords(responseData.totalRecords || 0);
        setHasMore(newReimbursements.length === 10); // If we got 10 items, there might be more
        
        if (reset || page === 1) {
          setReimbursements(newReimbursements);
        } else {
          setReimbursements(prev => [...prev, ...newReimbursements]);
        }
        setCurrentPage(page);
      }
    } catch (error) {
      console.log("Reimbursement API Error", error);
      Alert.alert(
        t("common.error") || "Error",
        t("reimbursement.listLoadFailed") || "Failed to load reimbursement list"
      );
    } finally {
      setIsLoadingReimbursements(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReimbursements(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingReimbursements) {
      loadReimbursements(currentPage + 1, false);
    }
  };

  const submitReimbursement = async () => {
    try {
      // Validate form before submission
      if (!validateForm()) return;

      // Get the first attachment from the attachments array
      const primaryAttachment = attachments.length > 0 ? attachments[0] : null;
      
      if (!primaryAttachment) {
        Alert.alert(
          t("common.error") || "Error",
          t("reimbursement.attachmentRequired") || "Please add at least one attachment"
        );
        return;
      }

      // Create a file object similar to what your API expects
      const fileToUpload = {
        uri: primaryAttachment.uri,
        name: primaryAttachment.name,
        type: primaryAttachment.type,
      };

      console.log("Submitting reimbursement with:", {
        taskNumber: selectedTask,
        amount: Number(price),
        remarks: remarks,
        attachment: fileToUpload.name
      });

      const response = await createReimbursement({
        taskNumber: selectedTask,
        amount: Number(price),
        remarks: remarks || t("reimbursement.defaultRemarks") || "Reimbursement request",
        userId: String(authState?.userId),
        attachment: fileToUpload,
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken)
      });

      console.log("Reimbursement Success:", response);
      
      Alert.alert(
        t("common.success") || "Success",
        t("reimbursement.submitSuccess") || "Reimbursement submitted successfully",
        [{ text: t("common.ok") || "OK" }]
      );

      // Reset form
      setSelectedTask("");
      setSelectedTaskDetails(null);
      setAttachments([]);
      setRemarks("");
      setPrice("");
      
      // Refresh the reimbursement list
      loadReimbursements(1, true);
      
    } catch (error) {
      console.log("Reimbursement Error:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("reimbursement.submitFailed") || "Failed to submit reimbursement. Please try again."
      );
    }
  };

  const handleTaskSelect = (task: TaskOption) => {
    setSelectedTask(task.value);
    setSelectedTaskDetails(task);
    setTaskModalVisible(false);
    setSearchQuery("");
  };

  const handleFilePick = async () => {
    setAttachmentModalVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const newAttachment: Attachment = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
          size: file.size,
        };
        setAttachments([...attachments, newAttachment]);
        
        Alert.alert(
          t("reimbursement.fileAdded") || "File Added",
          t("reimbursement.fileAddedMessage", { fileName: file.name }) || `${file.name} has been attached successfully.`,
          [{ text: t("common.ok") || "OK" }]
        );
      }
    } catch (error) {
      console.log("Error picking file:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("reimbursement.filePickFailed") || "Failed to pick file. Please try again."
      );
    }
  };

  const handleImagePick = async () => {
    setAttachmentModalVisible(false);
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          t("common.permissionRequired") || "Permission Required",
          t("reimbursement.galleryPermission") || "Please grant camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const image = result.assets[0];
        const newAttachment: Attachment = {
          uri: image.uri,
          name: image.fileName || `image_${Date.now()}.jpg`,
          type: "image/jpeg",
        };
        setAttachments([...attachments, newAttachment]);
        
        Alert.alert(
          t("reimbursement.imageAdded") || "Image Added",
          t("reimbursement.imageAddedMessage") || `Image has been attached successfully.`,
          [{ text: t("common.ok") || "OK" }]
        );
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("reimbursement.imagePickFailed") || "Failed to pick image. Please try again."
      );
    }
  };

  const handleCameraCapture = async () => {
    setAttachmentModalVisible(false);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          t("common.permissionRequired") || "Permission Required",
          t("reimbursement.cameraPermission") || "Please grant camera permissions to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const image = result.assets[0];
        const newAttachment: Attachment = {
          uri: image.uri,
          name: `camera_${Date.now()}.jpg`,
          type: "image/jpeg",
        };
        setAttachments([...attachments, newAttachment]);
        
        Alert.alert(
          t("reimbursement.photoAdded") || "Photo Added",
          t("reimbursement.photoAddedMessage") || `Photo has been captured and attached successfully.`,
          [{ text: t("common.ok") || "OK" }]
        );
      }
    } catch (error) {
      console.log("Error capturing image:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("reimbursement.cameraCaptureFailed") || "Failed to capture image. Please try again."
      );
    }
  };

  const removeAttachment = (index: number) => {
    Alert.alert(
      t("reimbursement.removeAttachment") || "Remove Attachment",
      t("reimbursement.removeConfirmation") || "Are you sure you want to remove this attachment?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.remove") || "Remove",
          style: "destructive",
          onPress: () => {
            const updatedAttachments = [...attachments];
            updatedAttachments.splice(index, 1);
            setAttachments(updatedAttachments);
          },
        },
      ]
    );
  };

  const showAttachmentOptions = () => {
    setAttachmentModalVisible(true);
  };

  // Handle price input - only allow numbers (strict integer)
  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPrice(cleaned);
  };

  const validateForm = (): boolean => {
    if (!selectedTask) {
      Alert.alert(
        t("common.validationError") || "Validation Error",
        t("reimbursement.taskRequired") || "Please select a task number"
      );
      return false;
    }
    if (attachments.length === 0) {
      Alert.alert(
        t("common.validationError") || "Validation Error",
        t("reimbursement.attachmentRequired") || "Please upload at least one attachment"
      );
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert(
        t("common.validationError") || "Validation Error",
        t("reimbursement.priceRequired") || "Please enter a valid price amount"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await submitReimbursement();
    } catch (error) {
      console.log("Error submitting reimbursement:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("reimbursement.submitFailed") || "Failed to submit reimbursement. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render reimbursement list item
  const renderReimbursementItem = ({ item }: { item: ReimbursementItem }) => (
    <TouchableOpacity
      style={[
        styles.reimbursementItem,
        {
          backgroundColor: theme.colors.colorBgSurface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.colorShadow,
        },
      ]}
      onPress={() => {
        setSelectedReimbursement(item);
        setDetailsModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.reimbursementHeader}>
        <View style={styles.reimbursementHeaderLeft}>
          <RemixIcon
            name="bill-line"
            size={20}
            color={theme.colors.colorPrimary600}
          />
          <Text
            style={[
              styles.reimbursementTaskNumber,
              { color: theme.colors.colorPrimary600 },
            ]}
          >
            {item.taskNumber}
          </Text>
        </View>
        <View
          style={[
            styles.reimbursementStatusBadge,
            { backgroundColor: getStatusBackgroundColor(item.status, theme) },
          ]}
        >
          <Text
            style={[
              styles.reimbursementStatusText,
              { color: getStatusColor(item.status, theme) },
            ]}
          >
            {t(`reimbursement.status.${item.status.toLowerCase()}`) || item.status}
          </Text>
        </View>
      </View>

      <View style={styles.reimbursementBody}>
        <View style={styles.reimbursementAmountContainer}>
          <Text
            style={[
              styles.reimbursementAmountLabel,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("reimbursement.amount")}:
          </Text>
          <Text
            style={[
              styles.reimbursementAmount,
              { color: theme.colors.colorSuccess600 },
            ]}
          >
            {formatCurrency(item.amount, i18n.language)}
          </Text>
        </View>

        {item.remarks ? (
          <View style={styles.reimbursementRemarksContainer}>
            <Text
              style={[
                styles.reimbursementRemarksLabel,
                { color: theme.colors.colorTextSecondary },
              ]}
              numberOfLines={1}
            >
              {t("reimbursement.remarks")}: 
            </Text>
            <Text
              style={[
                styles.reimbursementRemarks,
                { color: theme.colors.colorTextPrimary },
              ]}
              numberOfLines={1}
            >
              {item.remarks}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.reimbursementFooter}>
        <RemixIcon
          name="time-line"
          size={14}
          color={theme.colors.colorTextTertiary}
        />
        <Text
          style={[
            styles.reimbursementDate,
            { color: theme.colors.colorTextTertiary },
          ]}
        >
          {formatDateShort(item.createdDate, i18n.language)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render reimbursement list header
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.listHeaderLeft}>
        <Text
          style={[
            styles.listTitle,
            { color: theme.colors.colorTextPrimary },
          ]}
        >
          {t("reimbursement.history")}
        </Text>
        <View
          style={[
            styles.listBadge,
            { backgroundColor: theme.colors.colorPrimary600 },
          ]}
        >
          <Text
            style={[
              styles.listBadgeText,
              { color: theme.colors.colorTextInverse },
            ]}
          >
            {totalRecords}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleRefresh}
        disabled={isLoadingReimbursements}
        style={styles.refreshButton}
        activeOpacity={0.7}
      >
        <RemixIcon
          name="refresh-line"
          size={18}
          color={theme.colors.colorPrimary600}
        />
      </TouchableOpacity>
    </View>
  );

  // Render list footer with loader
  const renderListFooter = () => {
    if (!isLoadingReimbursements) return null;
    
    return (
      <View style={styles.listFooterLoader}>
        <RemixIcon
          name="loader-4-line"
          size={24}
          color={theme.colors.colorPrimary600}
        />
        <Text
          style={[
            styles.listFooterText,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {t("common.loadingMore")}
        </Text>
      </View>
    );
  };

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      <RemixIcon
        name="inbox-line"
        size={64}
        color={theme.colors.colorTextTertiary}
      />
      <Text
        style={[
          styles.emptyListTitle,
          { color: theme.colors.colorTextPrimary },
        ]}
      >
        {t("reimbursement.noReimbursements")}
      </Text>
      <Text
        style={[
          styles.emptyListText,
          { color: theme.colors.colorTextSecondary },
        ]}
      >
        {t("reimbursement.emptyMessage")}
      </Text>
    </View>
  );

  const renderTaskItem = ({ item }: { item: TaskOption }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={() => handleTaskSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.taskItemContent}>
        <View style={styles.taskItemHeader}>
          <RemixIcon
            name="file-list-line"
            size={20}
            color={theme.colors.colorPrimary600}
          />
          <Text
            style={[
              styles.taskTransactionNumber,
              { color: theme.colors.colorPrimary600 },
            ]}
          >
            {item.transactionNumber}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackgroundColor(item.statusName, theme) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.statusName, theme) },
              ]}
            >
              {item.statusName || t("common.unknown") || "Unknown"}
            </Text>
          </View>
        </View>
        
        <Text
          style={[
            styles.taskContactName,
            { color: theme.colors.colorTextPrimary },
          ]}
        >
          {item.contactName}
        </Text>
        
        <View style={styles.taskDetailsRow}>
          <View style={styles.taskDetail}>
            <RemixIcon
              name="folder-line"
              size={14}
              color={theme.colors.colorTextSecondary}
            />
            <Text
              style={[
                styles.taskDetailText,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              {item.categoryName}
            </Text>
          </View>
          
          <View style={styles.taskDetail}>
            <RemixIcon
              name="calendar-line"
              size={14}
              color={theme.colors.colorTextSecondary}
            />
            <Text
              style={[
                styles.taskDetailText,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              {formatDateShort(item.createdDate, i18n.language)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAttachmentItem = ({ item, index }: { item: Attachment; index: number }) => {
    const fileIcon = getFileIcon(item.type, theme);
    
    return (
      <Animated.View
        style={[
          styles.attachmentItem,
          {
            backgroundColor: theme.colors.colorBgSurface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={[styles.fileIconContainer, { backgroundColor: fileIcon.color + '20' }]}>
          <RemixIcon
            name={fileIcon.name}
            size={24}
            color={fileIcon.color}
          />
        </View>
        
        <View style={styles.attachmentInfo}>
          <Text
            style={[
              styles.attachmentName,
              { color: theme.colors.colorTextPrimary },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View style={styles.attachmentMeta}>
            {item.size && (
              <Text
                style={[
                  styles.attachmentSize,
                  { color: theme.colors.colorTextTertiary },
                ]}
              >
                {formatFileSize(item.size)}
              </Text>
            )}
            <Text
              style={[
                styles.attachmentType,
                { color: theme.colors.colorTextTertiary },
              ]}
            >
              {item.type.split('/')[1]?.toUpperCase() || 'FILE'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => removeAttachment(index)}
          disabled={isSubmitting}
          style={styles.removeButton}
          activeOpacity={0.7}
        >
          <RemixIcon
            name="close-line"
            size={20}
            color={theme.colors.colorError600}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Reimbursement Request Form Card */}
        <Card
          title={t("reimbursement.title")}
          backgroundColor={theme.colors.colorBgPage}
          titleColor={theme.colors.colorPrimary600}
        >
          {/* Task Number Dropdown - Custom Trigger */}
          <View style={styles.fieldContainer}>
            <Text
              style={[styles.label, { color: theme.colors.colorTextPrimary }]}
            >
              {t("reimbursement.taskNumber")} <Text style={[styles.required, { color: theme.colors.colorError600 }]}>*</Text>
            </Text>
            
            <TouchableOpacity
              style={[
                styles.taskSelector,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
              onPress={() => setTaskModalVisible(true)}
              disabled={isLoadingTasks || isSubmitting}
              activeOpacity={0.7}
            >
              <View style={styles.taskSelectorContent}>
                {selectedTaskDetails ? (
                  <View style={styles.selectedTaskInfo}>
                    <View style={styles.selectedTaskHeader}>
                      <Text
                        style={[
                          styles.selectedTaskNumber,
                          { color: theme.colors.colorPrimary600 },
                        ]}
                      >
                        {selectedTaskDetails.transactionNumber}
                      </Text>
                      <View
                        style={[
                          styles.selectedStatusBadge,
                          { backgroundColor: getStatusBackgroundColor(selectedTaskDetails.statusName, theme) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.selectedStatusText,
                            { color: getStatusColor(selectedTaskDetails.statusName, theme) },
                          ]}
                        >
                          {selectedTaskDetails.statusName}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.selectedTaskName,
                        { color: theme.colors.colorTextSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedTaskDetails.contactName} - {selectedTaskDetails.categoryName}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.placeholderText,
                      { color: theme.colors.inputPlaceholder },
                    ]}
                  >
                    {isLoadingTasks ? t("common.loading") : t("reimbursement.selectTask")}
                  </Text>
                )}
                <RemixIcon
                  name="arrow-down-s-line"
                  size={24}
                  color={theme.colors.colorTextSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Price Field */}
          <View style={styles.fieldContainer}>
            <Text
              style={[styles.label, { color: theme.colors.colorTextPrimary }]}
            >
              {t("reimbursement.amount")} <Text style={[styles.required, { color: theme.colors.colorError600 }]}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.currencySymbol,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                ₹
              </Text>
              <TextInput
                style={[styles.input, { color: theme.colors.inputText }]}
                placeholder={t("reimbursement.enterAmount")}
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={price}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
                editable={!isSubmitting}
                returnKeyType="done"
                maxLength={10}
              />
            </View>
          </View>

          {/* Attachment Section */}
          <View style={styles.fieldContainer}>
            <View style={styles.attachmentHeader}>
              <Text
                style={[styles.label, { color: theme.colors.colorTextPrimary }]}
              >
                {t("reimbursement.attachments")} <Text style={[styles.required, { color: theme.colors.colorError600 }]}>*</Text>
              </Text>
              <Text style={[styles.attachmentCount, { color: theme.colors.colorPrimary600 }]}>
                {attachments.length} {t("reimbursement.files")}
              </Text>
            </View>
            
            <Text
              style={[styles.hint, { color: theme.colors.colorTextTertiary }]}
            >
              {t("reimbursement.attachmentHint")}
            </Text>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <View style={styles.attachmentList}>
                {attachments.map((attachment, index) => (
                  <View key={index}>
                    {renderAttachmentItem({ item: attachment, index })}
                  </View>
                ))}
              </View>
            )}

            {/* Add Attachment Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  borderColor: theme.colors.colorPrimary600,
                  backgroundColor: theme.colors.colorPrimary50,
                },
              ]}
              onPress={showAttachmentOptions}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <RemixIcon
                name="attachment-line"
                size={20}
                color={theme.colors.colorPrimary600}
              />
              <Text
                style={[
                  styles.addButtonText,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {t("reimbursement.addAttachment")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Remarks Field */}
          <View style={styles.fieldContainer}>
            <Text
              style={[styles.label, { color: theme.colors.colorTextPrimary }]}
            >
              {t("reimbursement.remarks")}
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.inputText,
                },
              ]}
              placeholder={t("reimbursement.remarksPlaceholder")}
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isSubmitting
                  ? theme.colors.btnDisabledBg
                  : theme.colors.btnPrimaryBg,
              },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.submitContent}>
                <RemixIcon
                  name="loader-4-line"
                  size={20}
                  color={theme.colors.btnPrimaryText}
                />
                <Text
                  style={[
                    styles.submitText,
                    { color: theme.colors.btnPrimaryText },
                  ]}
                >
                  {t("common.submitting")}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.submitText,
                  { color: theme.colors.btnPrimaryText },
                ]}
              >
                {t("reimbursement.submitButton")}
              </Text>
            )}
          </TouchableOpacity>

          {/* Summary Section */}
          {attachments.length > 0 && selectedTask && price && selectedTaskDetails && (
            <View
              style={[
                styles.summaryContainer,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryTitle,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {t("reimbursement.summary")}
              </Text>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("reimbursement.transactionNo")}:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {selectedTask}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("reimbursement.contact")}:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {selectedTaskDetails.contactName || "N/A"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("reimbursement.category")}:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {selectedTaskDetails.categoryName || "N/A"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("reimbursement.status")}:
                </Text>
                <View
                  style={[
                    styles.summaryStatusBadge,
                    { backgroundColor: getStatusBackgroundColor(selectedTaskDetails.statusName, theme) },
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryStatusText,
                      { color: getStatusColor(selectedTaskDetails.statusName, theme) },
                    ]}
                  >
                    {selectedTaskDetails.statusName || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("reimbursement.amount")}:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.colorSuccess600 },
                  ]}
                >
                  ₹{Number(price).toLocaleString(i18n.language)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("reimbursement.attachments")}:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {attachments.length} {t("reimbursement.files")}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Reimbursement List Section */}
        <View style={styles.listSection}>
          {renderListHeader()}

          {isLoadingReimbursements && reimbursements.length === 0 ? (
            <View style={styles.listLoader}>
              <RemixIcon
                name="loader-4-line"
                size={32}
                color={theme.colors.colorPrimary600}
              />
              <Text
                style={[
                  styles.listLoaderText,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {t("reimbursement.loadingList")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={reimbursements}
              renderItem={renderReimbursementItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.reimbursementList}
              ListEmptyComponent={renderEmptyList}
              ListFooterComponent={renderListFooter}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.colors.colorPrimary600]}
                  tintColor={theme.colors.colorPrimary600}
                />
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Task Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={() => {
          setTaskModalVisible(false);
          setSearchQuery("");
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalOverlay, { backgroundColor: theme.colors.colorOverlay }]}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.colorBgSurface },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {t("reimbursement.selectTask")}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setTaskModalVisible(false);
                    setSearchQuery("");
                  }}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <RemixIcon
                    name="close-line"
                    size={24}
                    color={theme.colors.colorTextSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: theme.colors.inputBg,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              >
                <RemixIcon
                  name="search-line"
                  size={20}
                  color={theme.colors.inputPlaceholder}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: theme.colors.inputText },
                  ]}
                  placeholder={t("reimbursement.searchPlaceholder")}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
                    <RemixIcon
                      name="close-circle-fill"
                      size={20}
                      color={theme.colors.inputPlaceholder}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Task List */}
              {isLoadingTasks ? (
                <View style={styles.loadingContainer}>
                  <RemixIcon
                    name="loader-4-line"
                    size={32}
                    color={theme.colors.colorPrimary600}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {t("common.loading")}
                  </Text>
                </View>
              ) : filteredTasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <RemixIcon
                    name="file-search-line"
                    size={48}
                    color={theme.colors.colorTextTertiary}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {searchQuery.length > 0
                      ? t("reimbursement.noSearchResults")
                      : t("reimbursement.noTasks")}
                  </Text>
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery("")}
                      style={[
                        styles.clearSearchButton,
                        { borderColor: theme.colors.colorPrimary600 },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.clearSearchText,
                          { color: theme.colors.colorPrimary600 },
                        ]}
                      >
                        {t("common.clear")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <FlatList
                  data={filteredTasks}
                  renderItem={renderTaskItem}
                  keyExtractor={(item) => item.value}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.taskList}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Professional Attachment Picker Modal */}
      <Modal
        transparent={true}
        visible={attachmentModalVisible}
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAttachmentModalVisible(false)}>
          <View style={[styles.attachmentModalOverlay, { backgroundColor: theme.colors.colorOverlay }]}>
            <Animated.View
              style={[
                styles.attachmentModalContent,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.attachmentModalHeader}>
                <View style={styles.attachmentModalHeaderLeft}>
                  <RemixIcon
                    name="attachment-line"
                    size={24}
                    color={theme.colors.colorPrimary600}
                  />
                  <Text
                    style={[
                      styles.attachmentModalTitle,
                      { color: theme.colors.colorTextPrimary },
                    ]}
                  >
                    {t("reimbursement.addAttachment")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setAttachmentModalVisible(false)}
                  style={styles.attachmentModalCloseButton}
                  activeOpacity={0.7}
                >
                  <RemixIcon
                    name="close-line"
                    size={24}
                    color={theme.colors.colorTextSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <View style={styles.attachmentModalBody}>
                <Text
                  style={[
                    styles.attachmentModalSubtitle,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("reimbursement.chooseSource")}
                </Text>

                {/* Options Grid */}
                <View style={styles.attachmentOptionsGrid}>
                  {/* Camera Option */}
                  <TouchableOpacity
                    style={[
                      styles.attachmentOption,
                      {
                        backgroundColor: theme.colors.inputBg,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={handleCameraCapture}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.attachmentOptionIcon, { backgroundColor: theme.colors.colorPrimary100 }]}>
                      <RemixIcon name="camera-line" size={32} color={theme.colors.colorPrimary600} />
                    </View>
                    <Text
                      style={[
                        styles.attachmentOptionTitle,
                        { color: theme.colors.colorTextPrimary },
                      ]}
                    >
                      {t("reimbursement.camera")}
                    </Text>
                    <Text
                      style={[
                        styles.attachmentOptionDescription,
                        { color: theme.colors.colorTextTertiary },
                      ]}
                    >
                      {t("reimbursement.takePhoto")}
                    </Text>
                  </TouchableOpacity>

                  {/* Gallery Option */}
                  <TouchableOpacity
                    style={[
                      styles.attachmentOption,
                      {
                        backgroundColor: theme.colors.inputBg,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={handleImagePick}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.attachmentOptionIcon, { backgroundColor: theme.colors.colorSuccess100 }]}>
                      <RemixIcon name="image-line" size={32} color={theme.colors.colorSuccess600} />
                    </View>
                    <Text
                      style={[
                        styles.attachmentOptionTitle,
                        { color: theme.colors.colorTextPrimary },
                      ]}
                    >
                      {t("reimbursement.gallery")}
                    </Text>
                    <Text
                      style={[
                        styles.attachmentOptionDescription,
                        { color: theme.colors.colorTextTertiary },
                      ]}
                    >
                      {t("reimbursement.chooseFromLibrary")}
                    </Text>
                  </TouchableOpacity>

                  {/* Document Option */}
                  <TouchableOpacity
                    style={[
                      styles.attachmentOption,
                      {
                        backgroundColor: theme.colors.inputBg,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={handleFilePick}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.attachmentOptionIcon, { backgroundColor: theme.colors.colorError100 }]}>
                      <RemixIcon name="file-pdf-line" size={32} color={theme.colors.colorError600} />
                    </View>
                    <Text
                      style={[
                        styles.attachmentOptionTitle,
                        { color: theme.colors.colorTextPrimary },
                      ]}
                    >
                      {t("reimbursement.documents")}
                    </Text>
                    <Text
                      style={[
                        styles.attachmentOptionDescription,
                        { color: theme.colors.colorTextTertiary },
                      ]}
                    >
                      {t("reimbursement.documentTypes")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Recent Files Section (Optional) */}
                {attachments.length > 0 && (
                  <View style={styles.recentFilesSection}>
                    <Text
                      style={[
                        styles.recentFilesTitle,
                        { color: theme.colors.colorTextSecondary },
                      ]}
                    >
                      {t("reimbursement.recentFiles")}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {attachments.slice(-3).map((file, index) => {
                        const fileIcon = getFileIcon(file.type, theme);
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.recentFileItem,
                              {
                                backgroundColor: theme.colors.inputBg,
                                borderColor: theme.colors.border,
                              },
                            ]}
                            onPress={() => {
                              setAttachmentModalVisible(false);
                              // Optionally re-attach the file
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.recentFileIcon, { backgroundColor: fileIcon.color + '20' }]}>
                              <RemixIcon name={fileIcon.name} size={20} color={fileIcon.color} />
                            </View>
                            <Text
                              style={[
                                styles.recentFileName,
                                { color: theme.colors.colorTextPrimary },
                              ]}
                              numberOfLines={1}
                            >
                              {file.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Modal Footer */}
              <View style={styles.attachmentModalFooter}>
                <TouchableOpacity
                  style={[
                    styles.attachmentModalCancelButton,
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() => setAttachmentModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.attachmentModalCancelText,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Reimbursement Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDetailsModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: theme.colors.colorOverlay }]}>
            <View
              style={[
                styles.detailsModalContent,
                { backgroundColor: theme.colors.colorBgSurface },
              ]}
            >
              <View style={styles.detailsModalHeader}>
                <Text
                  style={[
                    styles.detailsModalTitle,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {t("reimbursement.details")}
                </Text>
                <TouchableOpacity
                  onPress={() => setDetailsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <RemixIcon
                    name="close-line"
                    size={24}
                    color={theme.colors.colorTextSecondary}
                  />
                </TouchableOpacity>
              </View>

              {selectedReimbursement && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailsSection}>
                      <View style={styles.detailsRow}>
                        <Text
                          style={[
                            styles.detailsLabel,
                            { color: theme.colors.colorTextSecondary },
                          ]}
                        >
                          {t("reimbursement.taskNumber")}:
                        </Text>
                        <Text
                          style={[
                            styles.detailsValue,
                            { color: theme.colors.colorTextPrimary },
                          ]}
                        >
                          {selectedReimbursement.taskNumber}
                        </Text>
                      </View>

                      <View style={styles.detailsRow}>
                        <Text
                          style={[
                            styles.detailsLabel,
                            { color: theme.colors.colorTextSecondary },
                          ]}
                        >
                          {t("reimbursement.amount")}:
                        </Text>
                        <Text
                          style={[
                            styles.detailsValue,
                            { color: theme.colors.colorSuccess600 },
                          ]}
                        >
                          {formatCurrency(selectedReimbursement.amount, i18n.language)}
                        </Text>
                      </View>

                      <View style={styles.detailsRow}>
                        <Text
                          style={[
                            styles.detailsLabel,
                            { color: theme.colors.colorTextSecondary },
                          ]}
                        >
                          {t("reimbursement.status")}:
                        </Text>
                        <View
                          style={[
                            styles.detailsStatusBadge,
                            { backgroundColor: getStatusBackgroundColor(selectedReimbursement.status, theme) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.detailsStatusText,
                              { color: getStatusColor(selectedReimbursement.status, theme) },
                            ]}
                          >
                            {t(`reimbursement.status.${selectedReimbursement.status.toLowerCase()}`) || selectedReimbursement.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailsRow}>
                        <Text
                          style={[
                            styles.detailsLabel,
                            { color: theme.colors.colorTextSecondary },
                          ]}
                        >
                          {t("reimbursement.createdDate")}:
                        </Text>
                        <Text
                          style={[
                            styles.detailsValue,
                            { color: theme.colors.colorTextPrimary },
                          ]}
                        >
                          {formatDate(selectedReimbursement.createdDate, i18n.language)}
                        </Text>
                      </View>

                      {selectedReimbursement.remarks && (
                        <View style={styles.detailsRemarks}>
                          <Text
                            style={[
                              styles.detailsLabel,
                              { color: theme.colors.colorTextSecondary },
                            ]}
                          >
                            {t("reimbursement.remarks")}:
                          </Text>
                          <Text
                            style={[
                              styles.detailsRemarksText,
                              { color: theme.colors.colorTextPrimary },
                            ]}
                          >
                            {selectedReimbursement.remarks}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  required: {
    color: "#FF4444",
  },
  hint: {
    fontSize: 12,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  taskSelector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  taskSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedTaskInfo: {
    flex: 1,
  },
  selectedTaskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  selectedTaskNumber: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  selectedStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedStatusText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  selectedTaskName: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    textAlignVertical: "top",
    fontFamily: 'Poppins-Regular',
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  attachmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  attachmentCount: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: 'Poppins-Medium',
  },
  attachmentList: {
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  attachmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachmentSize: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  attachmentType: {
    fontSize: 11,
    fontWeight: "500",
    fontFamily: 'Poppins-Medium',
  },
  removeButton: {
    padding: 6,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  summaryContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  summaryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  summaryStatusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  noDataText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },

  // List Section Styles
  listSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: 'Poppins-SemiBold',
  },
  listBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  listBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  listLoader: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  listLoaderText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  reimbursementList: {
    gap: 12,
    paddingBottom: 20,
  },
  reimbursementItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reimbursementHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reimbursementHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reimbursementTaskNumber: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  reimbursementStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reimbursementStatusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  reimbursementBody: {
    marginBottom: 12,
  },
  reimbursementAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  reimbursementAmountLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  reimbursementAmount: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: 'Poppins-SemiBold',
  },
  reimbursementRemarksContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reimbursementRemarksLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  reimbursementRemarks: {
    fontSize: 13,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  reimbursementFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reimbursementDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  listFooterLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  listFooterText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  emptyListText: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: 'Poppins-Regular',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: "80%",
  },
  detailsModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  detailsModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: 'Poppins-SemiBold',
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: 'Poppins-SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
  },
  taskList: {
    paddingBottom: 20,
  },
  taskItem: {
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  taskItemContent: {
    flex: 1,
  },
  taskItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  taskTransactionNumber: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  taskContactName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    fontFamily: 'Poppins-Medium',
  },
  taskDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 12,
  },
  taskDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskDetailText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: 'Poppins-Regular',
  },
  clearSearchButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  clearSearchText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: 'Poppins-Medium',
  },

  // Attachment Modal Styles
  attachmentModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  attachmentModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  attachmentModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  attachmentModalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attachmentModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: 'Poppins-SemiBold',
  },
  attachmentModalCloseButton: {
    padding: 4,
  },
  attachmentModalBody: {
    marginBottom: 20,
  },
  attachmentModalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  attachmentOptionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  attachmentOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  attachmentOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  attachmentOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  attachmentOptionDescription: {
    fontSize: 11,
    textAlign: "center",
    fontFamily: 'Poppins-Regular',
  },
  recentFilesSection: {
    marginTop: 8,
  },
  recentFilesTitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
    fontFamily: 'Poppins-Medium',
  },
  recentFileItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    gap: 6,
  },
  recentFileIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  recentFileName: {
    fontSize: 12,
    maxWidth: 100,
    fontFamily: 'Poppins-Regular',
  },
  attachmentModalFooter: {
    alignItems: "center",
  },
  attachmentModalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 20,
  },
  attachmentModalCancelText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: 'Poppins-Medium',
  },

  // Details Modal Styles
  detailsContainer: {
    paddingBottom: 20,
  },
  detailsSection: {
    gap: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  detailsStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailsStatusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  detailsRemarks: {
    marginTop: 8,
    gap: 8,
  },
  detailsRemarksText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
});