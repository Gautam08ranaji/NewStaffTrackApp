import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CentreType = {
  id: string;
  label: string;
};

type Props = {
  data: CentreType[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function AddCentreTab({
  data,
  selectedId,
  onSelect,
}: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Centre Type</Text>
      <Text style={styles.subtitle}>
        Choose the category that best matches the service provided
      </Text>

      {/* ✅ SCROLLABLE LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 16,
        }}
        renderItem={({ item }) => {
          const selected = selectedId === item.id;

          return (
            <TouchableOpacity
              style={[
                styles.optionCard,
                {
                  backgroundColor: selected
                    ? theme.colors.colorPrimary100
                    : "#EAF7F5",
                },
              ]}
              onPress={() => onSelect(item.id)}
            >
              <Text style={styles.optionText}>{item.label}</Text>

              <View
                style={[
                  styles.radio,
                  { borderColor: theme.colors.primary },
                ]}
              >
                {selected && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* ✅ FIXED BOTTOM BUTTON (NO OVERLAP) */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={()=>{
            router.push('/(fro)/(profile)/universalFormScreen')
          }}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },

  optionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "500",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  footer: {
    // paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
  },

  continueBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
