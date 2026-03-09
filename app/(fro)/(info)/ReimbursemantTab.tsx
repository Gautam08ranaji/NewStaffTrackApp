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

// Helper function to get file icon and color
const getFileIcon = (type: string): { name: IconName; color: string } => {
  if (type.includes("pdf")) {
    return { name: "file-pdf-line", color: "#FF4444" };
  }
  if (type.includes("image")) {
    return { name: "file-image-line", color: "#4CAF50" };
  }
  if (type.includes("word") || type.includes("document")) {
    return { name: "file-word-line", color: "#2196F3" };
  }
  if (type.includes("excel") || type.includes("sheet")) {
    return { name: "file-excel-line", color: "#4CAF50" };
  }
  return { name: "file-line", color: "#757575" };
};

// Helper function to get status color
const getStatusColor = (statusName?: string): string => {
  switch (statusName?.toLowerCase()) {
    case "open":
      return "#4CAF50"; // Green
    case "in-progress":
      return "#FFA000"; // Orange/Amber
    case "closed":
      return "#9E9E9E"; // Grey
    case "pending":
      return "#FF4444"; // Red
    case "approved":
      return "#4CAF50"; // Green
    case "rejected":
      return "#FF4444"; // Red
    default:
      return "#757575"; // Grey
  }
};

// Helper function to get status background color (lighter version)
const getStatusBackgroundColor = (statusName?: string): string => {
  switch (statusName?.toLowerCase()) {
    case "open":
      return "#4CAF5020"; // Green with opacity
    case "in-progress":
      return "#FFA00020"; // Orange with opacity
    case "closed":
      return "#9E9E9E20"; // Grey with opacity
    case "pending":
      return "#FF444420"; // Red with opacity
    case "approved":
      return "#4CAF5020"; // Green with opacity
    case "rejected":
      return "#FF444420"; // Red with opacity
    default:
      return "#75757520"; // Grey with opacity
  }
};

// Format currency
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
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

export default function ReimbursemantTab() {
  const { theme } = useTheme();
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
      Alert.alert("Error", "Failed to load tasks. Please try again.");
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
      Alert.alert("Error", "Failed to load reimbursement list");
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
        Alert.alert("Error", "Please add at least one attachment");
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
        remarks: remarks || "Reimbursement request",
        userId: String(authState?.userId),
        attachment: fileToUpload,
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken)
      });

      console.log("Reimbursement Success:", response);
      
      Alert.alert(
        "Success",
        "Reimbursement submitted successfully",
        [{ text: "OK" }]
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
      Alert.alert("Error", "Failed to submit reimbursement. Please try again.");
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
          "File Added",
          `${file.name} has been attached successfully.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Error picking file:", error);
      Alert.alert("Error", "Failed to pick file. Please try again.");
    }
  };

  const handleImagePick = async () => {
    setAttachmentModalVisible(false);
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images."
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
          "Image Added",
          `Image has been attached successfully.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleCameraCapture = async () => {
    setAttachmentModalVisible(false);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera permissions to take photos."
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
          "Photo Added",
          `Photo has been captured and attached successfully.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Error capturing image:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  const removeAttachment = (index: number) => {
    Alert.alert(
      "Remove Attachment",
      "Are you sure you want to remove this attachment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
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
      Alert.alert("Validation Error", "Please select a task number");
      return false;
    }
    if (attachments.length === 0) {
      Alert.alert("Validation Error", "Please upload at least one attachment");
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid price amount");
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
      Alert.alert("Error", "Failed to submit reimbursement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDateShort = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
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
            { backgroundColor: getStatusBackgroundColor(item.status) },
          ]}
        >
          <Text
            style={[
              styles.reimbursementStatusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status}
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
            Amount:
          </Text>
          <Text
            style={[
              styles.reimbursementAmount,
              { color: theme.colors.colorSuccess600 },
            ]}
          >
            {formatCurrency(item.amount)}
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
              Remarks: 
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
          {formatDateShort(item.createdDate)}
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
          Reimbursement History
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
          Loading more...
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
        No Reimbursements Yet
      </Text>
      <Text
        style={[
          styles.emptyListText,
          { color: theme.colors.colorTextSecondary },
        ]}
      >
        Your submitted reimbursements will appear here
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
              { backgroundColor: getStatusBackgroundColor(item.statusName) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.statusName) },
              ]}
            >
              {item.statusName || "Unknown"}
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
              {formatDateShort(item.createdDate)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAttachmentItem = ({ item, index }: { item: Attachment; index: number }) => {
    const fileIcon = getFileIcon(item.type);
    
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
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Reimbursement Request Form Card */}
        <Card
          title="Reimbursement Request"
          backgroundColor={theme.colors.colorBgPage}
          titleColor={theme.colors.colorPrimary600}
        >
          {/* Task Number Dropdown - Custom Trigger */}
          <View style={styles.fieldContainer}>
            <Text
              style={[styles.label, { color: theme.colors.colorTextPrimary }]}
            >
              Task Number <Text style={styles.required}>*</Text>
            </Text>
            
            <TouchableOpacity
              style={[
                styles.taskSelector,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.border,
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
                          { backgroundColor: getStatusBackgroundColor(selectedTaskDetails.statusName) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.selectedStatusText,
                            { color: getStatusColor(selectedTaskDetails.statusName) },
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
                      { color: theme.colors.colorTextTertiary },
                    ]}
                  >
                    {isLoadingTasks ? "Loading tasks..." : "Select Task Number"}
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
              Amount (₹) <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.border,
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
                style={[styles.input, { color: theme.colors.colorTextPrimary }]}
                placeholder="Enter amount"
                placeholderTextColor={theme.colors.colorTextTertiary}
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
                Attachments <Text style={styles.required}>*</Text>
              </Text>
              <Text style={[styles.attachmentCount, { color: theme.colors.colorPrimary600 }]}>
                {attachments.length} file(s)
              </Text>
            </View>
            
            <Text
              style={[styles.hint, { color: theme.colors.colorTextTertiary }]}
            >
              Upload photos, PDF, or documents (Max 10MB each)
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
                Add Attachment
              </Text>
            </TouchableOpacity>
          </View>

          {/* Remarks Field */}
          <View style={styles.fieldContainer}>
            <Text
              style={[styles.label, { color: theme.colors.colorTextPrimary }]}
            >
              Remarks
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.border,
                  color: theme.colors.colorTextPrimary,
                },
              ]}
              placeholder="Enter any additional remarks..."
              placeholderTextColor={theme.colors.colorTextTertiary}
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
                  ? theme.colors.colorTextTertiary
                  : theme.colors.colorPrimary600,
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
                  color={theme.colors.colorTextInverse}
                />
                <Text
                  style={[
                    styles.submitText,
                    { color: theme.colors.colorTextInverse },
                  ]}
                >
                  Submitting...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.submitText,
                  { color: theme.colors.colorTextInverse },
                ]}
              >
                Submit Reimbursement
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
                Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  Transaction No:
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
                  Contact:
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
                  Category:
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
                  Status:
                </Text>
                <View
                  style={[
                    styles.summaryStatusBadge,
                    { backgroundColor: getStatusBackgroundColor(selectedTaskDetails.statusName) },
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryStatusText,
                      { color: getStatusColor(selectedTaskDetails.statusName) },
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
                  Amount:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.colorSuccess600 },
                  ]}
                >
                  ₹{Number(price).toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  Attachments:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {attachments.length} file(s)
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
                Loading reimbursements...
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
          <View style={styles.modalOverlay}>
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
                  Select Task
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
                    backgroundColor: theme.colors.colorBgPage,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <RemixIcon
                  name="search-line"
                  size={20}
                  color={theme.colors.colorTextTertiary}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                  placeholder="Search by transaction, contact, category..."
                  placeholderTextColor={theme.colors.colorTextTertiary}
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
                      color={theme.colors.colorTextTertiary}
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
                    Loading tasks...
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
                      ? "No tasks match your search"
                      : "No tasks available"}
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
                        Clear Search
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
          <View style={styles.attachmentModalOverlay}>
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
                    Add Attachment
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
                  Choose a source to upload from
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
                    <View style={[styles.attachmentOptionIcon, { backgroundColor: '#2196F320' }]}>
                      <RemixIcon name="camera-line" size={32} color="#2196F3" />
                    </View>
                    <Text
                      style={[
                        styles.attachmentOptionTitle,
                        { color: theme.colors.colorTextPrimary },
                      ]}
                    >
                      Camera
                    </Text>
                    <Text
                      style={[
                        styles.attachmentOptionDescription,
                        { color: theme.colors.colorTextTertiary },
                      ]}
                    >
                      Take a photo
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
                    <View style={[styles.attachmentOptionIcon, { backgroundColor: '#4CAF5020' }]}>
                      <RemixIcon name="image-line" size={32} color="#4CAF50" />
                    </View>
                    <Text
                      style={[
                        styles.attachmentOptionTitle,
                        { color: theme.colors.colorTextPrimary },
                      ]}
                    >
                      Gallery
                    </Text>
                    <Text
                      style={[
                        styles.attachmentOptionDescription,
                        { color: theme.colors.colorTextTertiary },
                      ]}
                    >
                      Choose from library
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
                    <View style={[styles.attachmentOptionIcon, { backgroundColor: '#FF444420' }]}>
                      <RemixIcon name="file-pdf-line" size={32} color="#FF4444" />
                    </View>
                    <Text
                      style={[
                        styles.attachmentOptionTitle,
                        { color: theme.colors.colorTextPrimary },
                      ]}
                    >
                      Documents
                    </Text>
                    <Text
                      style={[
                        styles.attachmentOptionDescription,
                        { color: theme.colors.colorTextTertiary },
                      ]}
                    >
                      PDF, DOC, etc.
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
                      Recent Files
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {attachments.slice(-3).map((file, index) => {
                        const fileIcon = getFileIcon(file.type);
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
                    Cancel
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
          <View style={styles.modalOverlay}>
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
                  Reimbursement Details
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
                          Task Number
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
                          Amount
                        </Text>
                        <Text
                          style={[
                            styles.detailsValue,
                            { color: theme.colors.colorSuccess600 },
                          ]}
                        >
                          {formatCurrency(selectedReimbursement.amount)}
                        </Text>
                      </View>

                      <View style={styles.detailsRow}>
                        <Text
                          style={[
                            styles.detailsLabel,
                            { color: theme.colors.colorTextSecondary },
                          ]}
                        >
                          Status
                        </Text>
                        <View
                          style={[
                            styles.detailsStatusBadge,
                            { backgroundColor: getStatusBackgroundColor(selectedReimbursement.status) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.detailsStatusText,
                              { color: getStatusColor(selectedReimbursement.status) },
                            ]}
                          >
                            {selectedReimbursement.status}
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
                          Created Date
                        </Text>
                        <Text
                          style={[
                            styles.detailsValue,
                            { color: theme.colors.colorTextPrimary },
                          ]}
                        >
                          {formatDate(selectedReimbursement.createdDate)}
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
                            Remarks
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
  },
  required: {
    color: "#FF4444",
  },
  hint: {
    fontSize: 12,
    marginBottom: 12,
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
  },
  selectedStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  selectedTaskName: {
    fontSize: 12,
  },
  placeholderText: {
    fontSize: 14,
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
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    textAlignVertical: "top",
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
  },
  attachmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachmentSize: {
    fontSize: 11,
  },
  attachmentType: {
    fontSize: 11,
    fontWeight: "500",
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
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  summaryStatusText: {
    fontSize: 11,
    fontWeight: "600",
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
  },
  noDataText: {
    fontSize: 12,
    marginTop: 4,
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
  },
  reimbursementList: {
    gap: 12,
    paddingBottom: 20,
  },
  reimbursementItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
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
  },
  reimbursementStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reimbursementStatusText: {
    fontSize: 11,
    fontWeight: "600",
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
  },
  reimbursementAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  reimbursementRemarksContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reimbursementRemarksLabel: {
    fontSize: 13,
  },
  reimbursementRemarks: {
    fontSize: 13,
    flex: 1,
  },
  reimbursementFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reimbursementDate: {
    fontSize: 12,
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
  },
  emptyListText: {
    fontSize: 13,
    textAlign: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: "700",
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  taskContactName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
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
  },

  // Attachment Modal Styles
  attachmentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  },
  attachmentOptionDescription: {
    fontSize: 11,
    textAlign: "center",
  },
  recentFilesSection: {
    marginTop: 8,
  },
  recentFilesTitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
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
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailsStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsRemarks: {
    marginTop: 8,
    gap: 8,
  },
  detailsRemarksText: {
    fontSize: 14,
    lineHeight: 20,
  },
});