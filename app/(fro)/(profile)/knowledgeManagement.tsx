import BodyLayout from "@/components/layout/BodyLayout";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddNewCentreTab from "./AddNewCentreTab";
import SubmittedCentreTab from "./SubmittedCentreTab";

type TabType = "add" | "submitted";

export default function KnowledgeBaseScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("add");

  return (
    <BodyLayout type="screen" screenName="Knowledge Base">
      {/* ================= TABS ================= */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "add" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("add")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "add" && styles.activeTabText,
            ]}
          >
            Add New Centre
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "submitted" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("submitted")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "submitted" && styles.activeTabText,
            ]}
          >
            Submitted Centre
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= TAB CONTENT ================= */}
      {activeTab === "add" ? (
        <AddNewCentreTab />
      ) : (
        <SubmittedCentreTab />
      )}
    </BodyLayout>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0F2F1",
    borderRadius: 12,
    margin: 16,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#00695C",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#00695C",
  },

  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
