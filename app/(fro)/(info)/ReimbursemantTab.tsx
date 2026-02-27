import Card from "@/components/reusables/Card";
import { useTheme } from "@/theme/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";

interface Attachment {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface TaskOption {
  label: string;
  value: string;
}

// Helper function to get safe icon name
const getIconName = (type: string): IconName => {
  if (type.includes("pdf")) return "file-pdf-line";
  if (type.includes("image")) return "file-image-line";
  return "file-line";
};

export default function ReimbursemantTab() {
  const { theme } = useTheme();

  // State management
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [remarks, setRemarks] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mock task data - replace with actual API data
  const taskOptions: TaskOption[] = [
    { label: "Task #T2026001 - Field Visit", value: "T2026001" },
    { label: "Task #T2026002 - Document Collection", value: "T2026002" },
    { label: "Task #T2026003 - Follow-up Call", value: "T2026003" },
    { label: "Task #T2026004 - Medical Support", value: "T2026004" },
  ];

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
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
      }
    } catch (error) {
      console.log("Error picking file:", error);
      Alert.alert("Error", "Failed to pick file. Please try again.");
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images.",
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
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera permissions to take photos.",
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
      }
    } catch (error) {
      console.log("Error capturing image:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      "Add Attachment",
      "Choose an option",
      [
        { text: "Camera", onPress: handleCameraCapture },
        { text: "Gallery", onPress: handleImagePick },
        { text: "Documents (PDF)", onPress: handleFilePick },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
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
      // TODO: Replace with actual API call
      const formData = new FormData();
      formData.append("taskNumber", selectedTask);
      formData.append("remarks", remarks);
      formData.append("price", price);

      // Append attachments
      attachments.forEach((attachment, index) => {
        formData.append(`attachment_${index}`, {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.type,
        } as any);
      });

      console.log("Submitting reimbursement:", {
        taskNumber: selectedTask,
        attachments: attachments.map((a) => a.name),
        remarks,
        price,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Success", "Reimbursement submitted successfully");

      // Reset form
      setSelectedTask("");
      setAttachments([]);
      setRemarks("");
      setPrice("");
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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card
        title="Reimbursement Request"
        backgroundColor={theme.colors.colorBgPage}
        titleColor={theme.colors.colorPrimary600}
      >
        {/* Task Number Dropdown */}
        <View style={styles.fieldContainer}>
          <Text
            style={[styles.label, { color: theme.colors.colorTextPrimary }]}
          >
            Task Number <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Picker
              selectedValue={selectedTask}
              onValueChange={(itemValue) => setSelectedTask(itemValue)}
              style={{ color: theme.colors.colorTextPrimary }}
              dropdownIconColor={theme.colors.colorTextSecondary}
            >
              <Picker.Item label="Select Task Number" value="" />
              {taskOptions.map((task) => (
                <Picker.Item
                  key={task.value}
                  label={task.label}
                  value={task.value}
                />
              ))}
            </Picker>
          </View>
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
              onChangeText={setPrice}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Attachment Section */}
        <View style={styles.fieldContainer}>
          <Text
            style={[styles.label, { color: theme.colors.colorTextPrimary }]}
          >
            Attachments <Text style={styles.required}>*</Text>
          </Text>
          <Text
            style={[styles.hint, { color: theme.colors.colorTextTertiary }]}
          >
            Upload photos or PDF documents (Max 10MB each)
          </Text>

          {/* Attachment List */}
          {attachments.map((attachment, index) => (
            <View
              key={index}
              style={[
                styles.attachmentItem,
                {
                  backgroundColor: theme.colors.colorBgSurface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <RemixIcon
                name={getIconName(attachment.type)}
                size={24}
                color={theme.colors.colorPrimary600}
              />
              <View style={styles.attachmentInfo}>
                <Text
                  style={[
                    styles.attachmentName,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {attachment.name}
                </Text>
                {attachment.size && (
                  <Text
                    style={[
                      styles.attachmentSize,
                      { color: theme.colors.colorTextTertiary },
                    ]}
                  >
                    {formatFileSize(attachment.size)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeAttachment(index)}
                disabled={isSubmitting}
                style={styles.removeButton}
              >
                <RemixIcon
                  name="close-line"
                  size={20}
                  color={theme.colors.colorError600}
                />
              </TouchableOpacity>
            </View>
          ))}

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
        {attachments.length > 0 && selectedTask && price && (
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
                Task:
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
                Amount:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.colors.colorSuccess600 },
                ]}
              >
                ₹{price}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
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
    borderRadius: 8,
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
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
