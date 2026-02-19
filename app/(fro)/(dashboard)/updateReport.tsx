import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

export default function UpdateTodayReportScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [selectedTask, setSelectedTask] = useState("");
  const [taskUpdate, setTaskUpdate] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // NEW STATE
  const [showDropdown, setShowDropdown] = useState(false);
  const taskList = ["Task 1", "Task 2", "Task 3", "Task 4"];

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploadedFile(result.assets[0].uri);
    }
  };

  return (
    <BodyLayout type="screen" screenName="update report">
      <View style={[styles.card, { backgroundColor: theme.colors.colorBgPage }]}>
        
        {/* -------------------- Select Task -------------------- */}
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
          {t("Select Task (From Assigned)")}
        </Text>

        <TouchableOpacity
          style={[styles.dropdown, { borderColor: theme.colors.border }]}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text
            style={{
              color: selectedTask
                ? theme.colors.colorTextSecondary
                : theme.colors.inputPlaceholder,
            }}
          >
            {selectedTask || t("Select Task")}
          </Text>
          <RemixIcon
            name="arrow-down-s-line"
            size={22}
            color={theme.colors.navActive}
          />
        </TouchableOpacity>

        {/* ------- Dropdown List ------- */}
        {showDropdown && (
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 10,
              marginTop: -12,
              marginBottom: 18,
              backgroundColor: theme.colors.colorBgPage,
              overflow: "hidden",
            }}
          >
            {taskList.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 14,
                  borderBottomWidth: index === taskList.length - 1 ? 0 : 1,
                  borderColor: theme.colors.border,
                }}
                onPress={() => {
                  setSelectedTask(item);
                  setShowDropdown(false);
                }}
              >
                <Text style={{ color: theme.colors.colorTextSecondary }}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* -------------------- Add Update of Task -------------------- */}
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
          {t("Add Update of Task")}
        </Text>

        <TextInput
          style={[
            styles.textArea,
            { borderColor: theme.colors.border, color: theme.colors.colorTextSecondary },
          ]}
          placeholder={t("Explain in Detail...")}
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={taskUpdate}
          onChangeText={setTaskUpdate}
          multiline
        />

        {/* -------------------- Upload Photo / File -------------------- */}
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>
          {t("Add Photo / Document")}
        </Text>

        <TouchableOpacity
          style={[styles.uploadBox, { borderColor: theme.colors.border }]}
          onPress={handlePickImage}
        >
          {uploadedFile ? (
            <Image
              source={{ uri: uploadedFile }}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <RemixIcon
                name="upload-2-line"
                size={26}
                color={theme.colors.navActive}
              />
              <Text style={[styles.uploadText, { color: theme.colors.navActive }]}>
                {t("Upload File")}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* -------------------- Add Task Button -------------------- */}
        <TouchableOpacity
          style={[
            styles.addTaskBtn,
            { backgroundColor: theme.colors.colorPrimary600 },
          ]}
        >
          <RemixIcon name="add-line" size={20} color="#fff" />
          <Text style={styles.addTaskText}>{t("Add Task")}</Text>
        </TouchableOpacity>

      </View>

      {/* -------------------- Add New Task Text -------------------- */}
      <TouchableOpacity>
        <Text style={[styles.addNewTaskText, { color: theme.colors.colorPrimary600 }]}>
          {t("Add New Task")}
        </Text>
      </TouchableOpacity>

      {/* -------------------- Submit Button -------------------- */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.colors.colorPrimary600 }]}
        onPress={()=>{
            router.push('/(fro)/(dashboard)')
        }}
      >
        <Text style={styles.submitText}>{t("Submit Report")}</Text>
      </TouchableOpacity>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 1,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },

  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 110,
    textAlignVertical: "top",
    marginBottom: 18,
    fontSize: 14,
  },

  uploadBox: {
    borderWidth: 1,
    borderRadius: 10,
    height: 130,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    overflow: "hidden",
  },

  uploadText: {
    marginTop: 4,
    fontSize: 13,
  },

  addTaskBtn: {
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  addTaskText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
  },

  addNewTaskText: {
    fontSize: 15,
    textAlign: "center",
    marginVertical: 18,
    fontWeight: "500",
  },

  submitBtn: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
