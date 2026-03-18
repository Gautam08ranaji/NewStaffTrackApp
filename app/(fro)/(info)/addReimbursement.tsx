import Card from "@/components/reusables/Card";
import { AttachmentPayload, createReimbursement, ExpenseTypePayload } from "@/features/fro/Attendance/leaves/createReimbursement";
import { getLookupMasters } from "@/features/fro/getLookupMasters";
import { getInteractionsListByAssignToId } from "@/features/fro/interactionApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { showApiError } from "@/utils/showApiError";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
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
import RemixIcon, { IconName } from "react-native-remix-icon";

const { height } = Dimensions.get("window");

interface Attachment {
  uri: string;
  name: string;
  type: string;
  size?: number;
  base64?: string;
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

interface ExpenseTypeOption {
  id: number;
  name: string;
  value: string;
  isEnabled: boolean;
}

// Expense item interface matching API expenseTypes
interface ExpenseItem {
  id: string;
  expenseType: string;
  expenseTypeId?: number;
  amount: string;
  expenseDate: string;
  remarks: string;
  attachment: Attachment | null;
  errors?: {
    expenseType?: string;
    amount?: string;
    expenseDate?: string;
    attachment?: string; 
    remarks?: string;
  };
}

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

// Format date
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format date for display
const formatDisplayDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Format short date
const formatDateShort = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
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

// Convert file to base64
const fileToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error("Error converting file to base64:", error);
    throw error;
  }
};

// Create initial expense item
const createExpenseItem = (): ExpenseItem => ({
  id: Date.now().toString() + Math.random().toString(),
  expenseType: "",
  amount: "",
  expenseDate: formatDate(new Date()),
  remarks: "",
  attachment: null,
  errors: {},
});

export default function AddReimbursementScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const authState = useAppSelector((state) => state.auth);

  // State management for the form
  const [taskNumber, setTaskNumber] = useState<string>("");
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<TaskOption | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([createExpenseItem()]);
  const [activeExpenseIndex, setActiveExpenseIndex] = useState<number>(0);
  
  // Task related states
  const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskOption[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  
  // Expense type related states
  const [expenseTypeOptions, setExpenseTypeOptions] = useState<ExpenseTypeOption[]>([]);
  const [isLoadingExpenseTypes, setIsLoadingExpenseTypes] = useState<boolean>(false);
  
  // Modal visibility states
  const [taskModalVisible, setTaskModalVisible] = useState<boolean>(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState<boolean>(false);
  const [expenseTypeModalVisible, setExpenseTypeModalVisible] = useState<boolean>(false);
  
  // Search and submission states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Date picker state
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);

  // Animation for attachment modal
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Load tasks and expense types on mount
  useEffect(() => {
    fetchInteractions();
    fetchExpenseTypes();
  }, []);

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
        // Filter for Open or In-Progress tasks only
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
      showApiError(error)
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchExpenseTypes = async () => {
    setIsLoadingExpenseTypes(true);
    try {
      const res = await getLookupMasters({
        lookupType: "expenses",
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      console.log("Expense types response:", res);
      
      if (Array.isArray(res) && res.length > 0) {
        // Transform the response to our interface
        const options: ExpenseTypeOption[] = res.map((item: any) => ({
          id: item.id,
          name: item.name,
          value: item.value,
          isEnabled: item.isEnabled,
        }));
        setExpenseTypeOptions(options);
      } 
    } catch (error) {
      console.error("❌ Failed to fetch Expense Types:", error);
      // Set fallback options
     showApiError(error)
    } finally {
      setIsLoadingExpenseTypes(false);
    }
  };

  // Add new expense
  const addNewExpense = () => {
    setExpenses([...expenses, createExpenseItem()]);
    setActiveExpenseIndex(expenses.length);
  };

  // Remove expense
  const removeExpense = (index: number) => {
    if (expenses.length === 1) {
      Alert.alert(
        "Error",
        "Cannot remove the last expense item"
      );
      return;
    }

    Alert.alert(
      "Remove Expense",
      "Are you sure you want to remove this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updated = expenses.filter((_, i) => i !== index);
            setExpenses(updated);
            if (activeExpenseIndex >= updated.length) {
              setActiveExpenseIndex(updated.length - 1);
            }
          },
        },
      ]
    );
  };

  // Update expense field with error clearing
 const updateExpenseField = <K extends keyof ExpenseItem>(
  index: number,
  field: K,
  value: ExpenseItem[K]
) => {
  const updated = [...expenses];

  updated[index] = {
    ...updated[index],
    [field]: value,
    errors: {
      ...updated[index].errors,
      [field]: undefined,
      ...(field === "attachment" ? { attachment: undefined } : {}),
      ...(field === "remarks" ? { remarks: undefined } : {}),
    }
  };

  setExpenses(updated);
};

  // Validate a single expense
 const validateExpense = (expense: ExpenseItem, index: number): boolean => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  if (!expense.expenseType) {
    errors.expenseType = "Expense type is required";
    isValid = false;
  }

  if (!expense.amount) {
    errors.amount = "Amount is required";
    isValid = false;
  } else if (isNaN(Number(expense.amount)) || Number(expense.amount) <= 0) {
    errors.amount = "Please enter a valid amount";
    isValid = false;
  }

  if (!expense.expenseDate) {
    errors.expenseDate = "Expense date is required";
    isValid = false;
  }

  if (!expense.attachment) {
    errors.attachment = "Attachment is required";
    isValid = false;
  }

  // ✅ NEW VALIDATION
  if (!expense.remarks || expense.remarks.trim().length === 0) {
    errors.remarks = "Remarks is required";
    isValid = false;
  }

  const updated = [...expenses];
  updated[index] = { ...expense, errors };
  setExpenses(updated);

  return isValid;
};

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    if (!taskNumber) {
      Alert.alert(
        "Validation Error",
        "Please select a task number"
      );
      return false;
    }

    let isValid = true;
    for (let i = 0; i < expenses.length; i++) {
      if (!validateExpense(expenses[i], i)) {
        isValid = false;
      }
    }

    if (!isValid) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly"
      );
    }

    return isValid;
  }, [taskNumber, expenses]);

  const handleTaskSelect = (task: TaskOption) => {
    setTaskNumber(task.value);
    setSelectedTaskDetails(task);
    setTaskModalVisible(false);
    setSearchQuery("");
  };

  const handleExpenseTypeSelect = (type: ExpenseTypeOption) => {
    updateExpenseField(activeExpenseIndex, "expenseType", type.value);
    setExpenseTypeModalVisible(false);
  };

  // Handle price input - only allow numbers
  const handleAmountChange = (index: number, text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    updateExpenseField(index, "amount", cleaned);
  };

  const handleFilePick = async (index: number) => {
    setAttachmentModalVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Convert file to base64
        const base64 = await fileToBase64(file.uri);
        
        const newAttachment: Attachment = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
          size: file.size,
          base64: base64,
        };
        
        updateExpenseField(index, "attachment", newAttachment);
        
        Alert.alert(
          "File Added",
          `${file.name} has been attached successfully.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Error picking file:", error);
      showApiError(error)
    }
  };

  const handleImagePick = async (index: number) => {
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
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const image = result.assets[0];
        const newAttachment: Attachment = {
          uri: image.uri,
          name: image.fileName || `image_${Date.now()}.jpg`,
          type: "image/jpeg",
          base64: String(image.base64),
        };
        
        updateExpenseField(index, "attachment", newAttachment);
        
        Alert.alert(
          "Image Added",
          "Image has been attached successfully.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to pick image. Please try again."
      );
    }
  };

  const handleCameraCapture = async (index: number) => {
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
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const image = result.assets[0];
        const newAttachment: Attachment = {
          uri: image.uri,
          name: `camera_${Date.now()}.jpg`,
          type: "image/jpeg",
          base64: String(image.base64),
        };
        
        updateExpenseField(index, "attachment", newAttachment);
        
        Alert.alert(
          "Photo Added",
          "Photo has been captured and attached successfully.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Error capturing image:", error);
      Alert.alert(
        "Error",
        "Failed to capture image. Please try again."
      );
    }
  };

  const removeAttachment = (expenseIndex: number) => {
    Alert.alert(
      "Remove Attachment",
      "Are you sure you want to remove this attachment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            updateExpenseField(expenseIndex, "attachment", null);
          },
        },
      ]
    );
  };

  const showAttachmentOptions = (index: number) => {
    setActiveExpenseIndex(index);
    setAttachmentModalVisible(true);
  };

  const showExpenseTypeOptions = (index: number) => {
    setActiveExpenseIndex(index);
    setExpenseTypeModalVisible(true);
  };

  const showDatePicker = (index: number) => {
    setSelectedDateIndex(index);
    setDatePickerVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      updateExpenseField(selectedDateIndex, "expenseDate", formattedDate);
    }
  };

  const prepareExpenseTypes = async (): Promise<ExpenseTypePayload[]> => {
    const expenseTypes: ExpenseTypePayload[] = [];

    for (const expense of expenses) {
      let attachmentPayload: AttachmentPayload | undefined;

      if (expense.attachment) {
        attachmentPayload = {
          fileName: expense.attachment.name,
          filePath: "",
          fileSize: expense.attachment.size || 0,
          contentType: expense.attachment.type,
          documentType: "Expense",
          documentName: expense.attachment.name,
          mimeType: expense.attachment.type,
          fileData: expense.attachment.base64 || "",
        };
      }

      expenseTypes.push({
        expenseType: expense.expenseType,
        amount: Number(expense.amount),
        expenseDate: new Date(expense.expenseDate).toISOString(),
        remarks: expense.remarks || "Expense",
        attachment: attachmentPayload,
      });
    }

    return expenseTypes;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const expenseTypes = await prepareExpenseTypes();
      const totalAmount = expenseTypes.reduce((sum, exp) => sum + exp.amount, 0);

      const response = await createReimbursement({
        taskNumber: taskNumber,
        amount: totalAmount,
        remarks: "Reimbursement request",
        userId: String(authState?.userId),
        expenseTypes: expenseTypes,
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken)
      });

      console.log("Reimbursement Success:", response);
      
      Alert.alert(
        "Success",
        `${expenseTypes.length} expense(s) submitted successfully`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.log("Reimbursement Error:", error);
      showApiError(error)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals using useMemo for optimization
  const totals = useMemo(() => {
    const totalAmount = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const attachmentsCount = expenses.filter(e => e.attachment).length;
    return { totalAmount, attachmentsCount };
  }, [expenses]);

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
            numberOfLines={1}
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
              {item.statusName || "Unknown"}
            </Text>
          </View>
        </View>
        
        <Text
          style={[
            styles.taskContactName,
            { color: theme.colors.colorTextPrimary },
          ]}
          numberOfLines={1}
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
              numberOfLines={1}
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

  const renderExpenseItem = (item: ExpenseItem, index: number) => (
    <Card
      key={item.id}
      title={`Expense ${index + 1}`}
      backgroundColor={theme.colors.colorBgPage}
      titleColor={theme.colors.colorPrimary600}
      rightComponent={
        <TouchableOpacity
          onPress={() => removeExpense(index)}
          disabled={isSubmitting}
          style={styles.removeItemButton}
          activeOpacity={0.7}
        >
          <RemixIcon
            name="delete-bin-line"
            size={20}
            color={theme.colors.colorError600}
          />
        </TouchableOpacity>
      }
    >
      {/* Expense Type Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.colorTextPrimary }]}>
          Expense Type <Text style={[styles.required, { color: theme.colors.colorError600 }]}>*</Text>
        </Text>
        
        <TouchableOpacity
          style={[
            styles.selector,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: item.errors?.expenseType ? theme.colors.colorError600 : theme.colors.inputBorder,
            },
          ]}
          onPress={() => showExpenseTypeOptions(index)}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <View style={styles.selectorContent}>
            {item.expenseType ? (
              <Text
                style={[
                  styles.selectedText,
                  { color: theme.colors.colorTextPrimary },
                ]}
                numberOfLines={1}
              >
                {item.expenseType}
              </Text>
            ) : (
              <Text
                style={[
                  styles.placeholderText,
                  { color: theme.colors.inputPlaceholder },
                ]}
              >
                Select expense type
              </Text>
            )}
            <RemixIcon
              name="arrow-down-s-line"
              size={24}
              color={theme.colors.colorTextSecondary}
            />
          </View>
        </TouchableOpacity>
        {item.errors?.expenseType && (
          <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
            {item.errors.expenseType}
          </Text>
        )}
      </View>

      {/* Amount Field */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.colorTextPrimary }]}>
          Amount <Text style={[styles.required, { color: theme.colors.colorError600 }]}>*</Text>
        </Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: item.errors?.amount ? theme.colors.colorError600 : theme.colors.inputBorder,
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
            placeholder="Enter amount"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={item.amount}
            onChangeText={(text) => handleAmountChange(index, text)}
            keyboardType="numeric"
            editable={!isSubmitting}
            returnKeyType="done"
            maxLength={10}
          />
        </View>
        {item.errors?.amount && (
          <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
            {item.errors.amount}
          </Text>
        )}
      </View>

      {/* Expense Date Field */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.colorTextPrimary }]}>
          Expense Date <Text style={[styles.required, { color: theme.colors.colorError600 }]}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.selector,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: item.errors?.expenseDate ? theme.colors.colorError600 : theme.colors.inputBorder,
            },
          ]}
          onPress={() => showDatePicker(index)}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <View style={styles.selectorContent}>
            <Text
              style={[
                styles.selectedText,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {formatDisplayDate(item.expenseDate)}
            </Text>
            <RemixIcon
              name="calendar-line"
              size={24}
              color={theme.colors.colorTextSecondary}
            />
          </View>
        </TouchableOpacity>
        {item.errors?.expenseDate && (
          <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
            {item.errors.expenseDate}
          </Text>
        )}
      </View>

      {/* Attachment Section */}
      <View style={styles.fieldContainer}>
        <View style={styles.attachmentHeader}>
          <Text style={[styles.label, { color: theme.colors.colorTextPrimary }]}>
            Attachment
          </Text>
        </View>
        
        <Text style={[styles.hint, { color: theme.colors.colorTextTertiary }]}>
          Upload receipt or supporting document
        </Text>

        {/* Attachment Preview */}
        {item.attachment && (
          <View style={styles.attachmentList}>
            <View
              style={[
                styles.attachmentItem,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {(() => {
                const fileIcon = getFileIcon(item.attachment!.type, theme);
                return (
                  <>
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
                        {item.attachment!.name}
                      </Text>
                      <View style={styles.attachmentMeta}>
                        {item.attachment!.size && (
                          <Text
                            style={[
                              styles.attachmentSize,
                              { color: theme.colors.colorTextTertiary },
                            ]}
                          >
                            {formatFileSize(item.attachment!.size)}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.attachmentType,
                            { color: theme.colors.colorTextTertiary },
                          ]}
                        >
                          {item.attachment!.type.split('/')[1]?.toUpperCase() || 'FILE'}
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
                  </>
                );
              })()}
            </View>
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
          onPress={() => showAttachmentOptions(index)}
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
            {item.attachment ? "Change Attachment" : "Add Attachment"}
          </Text>
        </TouchableOpacity>

        {item.errors?.attachment && (
  <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
    {item.errors.attachment}
  </Text>
)}
      </View>

      {/* Remarks Field */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.colorTextPrimary }]}>
          Remarks
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
          placeholder="Add any remarks"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={item.remarks}
          onChangeText={(text) => updateExpenseField(index, "remarks", text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
      </View>
      {item.errors?.remarks && (
  <Text style={[styles.errorText, { color: theme.colors.colorError600 }]}>
    {item.errors.remarks}
  </Text>
)}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Task Selection Card */}
        <Card
          title="Task Details"
          backgroundColor={theme.colors.colorBgPage}
          titleColor={theme.colors.colorPrimary600}
        >
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.colorTextPrimary }]}>
              Task Number <Text style={[styles.required, { color: theme.colors.colorError600 }]}>*</Text>
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
                        numberOfLines={1}
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
                    {isLoadingTasks ? "Loading..." : "Select task"}
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
        </Card>

        {/* Header with expense count */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.colorTextPrimary }]}>
            Expenses
          </Text>
          <View style={[styles.countBadge, { backgroundColor: theme.colors.colorPrimary100 }]}>
            <Text style={[styles.countText, { color: theme.colors.colorPrimary600 }]}>
              {expenses.length} {expenses.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
        </View>

        {/* Expense Items */}
        {expenses.map((item, index) => renderExpenseItem(item, index))}

        {/* Add Another Expense Button */}
        <TouchableOpacity
          style={[
            styles.addAnotherButton,
            {
              backgroundColor: theme.colors.colorBgSurface,
              borderColor: theme.colors.colorPrimary600,
            },
          ]}
          onPress={addNewExpense}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <RemixIcon
            name="add-line"
            size={24}
            color={theme.colors.colorPrimary600}
          />
          <Text
            style={[
              styles.addAnotherButtonText,
              { color: theme.colors.colorPrimary600 },
            ]}
          >
            Add Another Expense
          </Text>
        </TouchableOpacity>

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
              <ActivityIndicator size="small" color={theme.colors.btnPrimaryText} />
              <Text
                style={[
                  styles.submitText,
                  { color: theme.colors.btnPrimaryText },
                ]}
              >
                Submitting...
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.submitText,
                { color: theme.colors.btnPrimaryText },
              ]}
            >
              Submit Reimbursement ({expenses.length})
            </Text>
          )}
        </TouchableOpacity>

        {/* Summary Section */}
        {expenses.length > 0 && (
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
                Total Expenses:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {expenses.length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Total Amount:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.colors.colorSuccess600 },
                ]}
              >
                ₹{totals.totalAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                With Attachments:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {totals.attachmentsCount}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Date Picker */}
      {datePickerVisible && (
        <DateTimePicker
          value={new Date(expenses[selectedDateIndex]?.expenseDate || new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

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
                  placeholder="Search tasks..."
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

              {isLoadingTasks ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.colorPrimary600} />
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
                      ? "No matching tasks found"
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
                        Clear
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

      {/* Expense Type Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={expenseTypeModalVisible}
        onRequestClose={() => setExpenseTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalOverlay, { backgroundColor: theme.colors.colorOverlay }]}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.colorBgSurface },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  Select Expense Type
                </Text>
                <TouchableOpacity
                  onPress={() => setExpenseTypeModalVisible(false)}
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

              {isLoadingExpenseTypes ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.colorPrimary600} />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    Loading expense types...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={expenseTypeOptions.filter(type => type.isEnabled)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.typeItem,
                        { borderBottomColor: theme.colors.border },
                      ]}
                      onPress={() => handleExpenseTypeSelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeItemText,
                          { color: theme.colors.colorTextPrimary },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <RemixIcon
                        name="arrow-right-s-line"
                        size={20}
                        color={theme.colors.colorTextSecondary}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.typeList}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Attachment Picker Modal */}
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

              <View style={styles.attachmentModalBody}>
                <Text
                  style={[
                    styles.attachmentModalSubtitle,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  Choose source
                </Text>

                <View style={styles.attachmentOptionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.attachmentOption,
                      {
                        backgroundColor: theme.colors.inputBg,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handleCameraCapture(activeExpenseIndex)}
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

                  <TouchableOpacity
                    style={[
                      styles.attachmentOption,
                      {
                        backgroundColor: theme.colors.inputBg,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handleImagePick(activeExpenseIndex)}
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

                  <TouchableOpacity
                    style={[
                      styles.attachmentOption,
                      {
                        backgroundColor: theme.colors.inputBg,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handleFilePick(activeExpenseIndex)}
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
                      Documents
                    </Text>
                    <Text
                      style={[
                        styles.attachmentOptionDescription,
                        { color: theme.colors.colorTextTertiary },
                      ]}
                    >
                      PDF, Word, etc.
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: 'Poppins-Bold',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
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
  selector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  selectorContent: {
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
    flex: 1,
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
  selectedText: {
    fontSize: 14,
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
    minHeight: 80,
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
  removeItemButton: {
    padding: 8,
  },
  addAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
    marginBottom: 16,
    marginTop:16
  },
  addAnotherButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom:60,
    paddingHorizontal: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 18,
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
  typeList: {
    paddingBottom: 20,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  typeItemText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
});