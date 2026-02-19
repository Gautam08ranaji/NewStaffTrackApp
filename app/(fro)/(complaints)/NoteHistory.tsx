import BodyLayout from "@/components/layout/BodyLayout";
import { getNotesRecordList } from "@/features/fro/complaints/noteListApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= TYPES ================= */
type NoteItem = {
  id: string;
  noteDesc: string;
  noteType: string;
  createdDate: string;
  relatedToName: string;
};

type CaseItem = {
  id: number;
  transactionNumber: string;
};

/* ================= SCREEN ================= */
export default function NotesHistoryScreen() {
  const { theme } = useTheme();
  const authState = useAppSelector((state) => state.auth);
  const params = useLocalSearchParams();
  const caseId = params.caseId ? Number(params.caseId) : null;
  const item: CaseItem | null = params.item
    ? JSON.parse(params.item as string)
    : null;

  // console.log("transactionNumber", item?.transactionNumber);

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= API ================= */
  const loadNotes = async () => {
    try {
      setLoading(true);

      const res = await getNotesRecordList({
        auth: {
          bearerToken: String(authState.token),
          antiForgeryToken: String(authState.antiforgeryToken),
        },
        relatedToId: String(caseId),
      });

      console.log("res", res?.data);

      const list = Array.isArray(res?.data?.notesList)
        ? res.data.notesList
        : [];

      setNotes(list);
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";

      if (status === 401) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(onboarding)/login"),
            },
          ],
        );
        return;
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LIFECYCLE ================= */
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, []),
  );

  /* ================= UI ================= */
  return (
    <BodyLayout type="screen" screenName="Notes">
      <View style={styles.body}>
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListHeaderComponent={
            <>
              {/* Add Button */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: theme.colors.colorPrimary600 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(fro)/(complaints)/AddNote",
                    params: {
                      caseId: String(item?.id),
                      transactionNumber: item?.transactionNumber,
                    },
                  })
                }
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={theme.colors.colorBgSurface}
                />
                <Text
                  style={[
                    styles.addButtonText,
                    { color: theme.colors.colorBgSurface },
                  ]}
                >
                  Add New Note
                </Text>
              </TouchableOpacity>

              {/* Section Title */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                Notes History
              </Text>
            </>
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.colorPrimary600}
                style={{ marginTop: 40 }}
              />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 40,
                  color: theme.colors.colorTextSecondary,
                }}
              >
                No notes found
              </Text>
            )
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.colorBgPage },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.colorHeadingH1 },
                ]}
              >
                {item.noteType === "public" ? "Public Note" : "Private Note"}
              </Text>

              <Text
                style={[
                  styles.cardAuthor,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                Case No: {item.relatedToName}
              </Text>

              <Text
                style={[
                  styles.cardDesc,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                Description: {item.noteDesc}
              </Text>
            </View>
          )}
        />
      </View>
    </BodyLayout>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: 16,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardAuthor: {
    fontSize: 13,
    marginVertical: 4,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});
