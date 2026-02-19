import BodyLayout from "@/components/layout/BodyLayout";
import { getCommonDocumentList } from "@/features/fro/complaints/getCommonDocumentList";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CommonDocument {
  id: number;
  documentName: string;
  documentType: string;
  documentDescription: string;
  documentSize: number;
  documentExtension: string;
  createdDate: string;
}

export default function CommonDocumentListScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const caseId = params.caseId ? Number(params.caseId) : null;
  const [documents, setDocuments] = useState<CommonDocument[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const authState = useAppSelector((state) => state.auth);

  // console.log("caseiddd", caseId);

  const PAGE_SIZE = 10;

  const loadDocuments = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const res = await getCommonDocumentList({
        pageNumber,
        pageSize: PAGE_SIZE,
        relatedToId: Number(caseId),
      });

      console.log("cmn", caseId);

      setDocuments((prev) =>
        pageNumber === 1 ? res.list : [...prev, ...res.list],
      );
      setTotal(res.totalRecords);
      setPage(pageNumber);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, []),
  );

  const loadMore = () => {
    if (documents.length < total && !loading) {
      loadDocuments(page + 1);
    }
  };

  const onAddDocument = () => {
    console.log("Add Document Pressed");

    router.push({
      pathname: "/(fro)/(complaints)/AddPhotoScreen",
      params: {
        caseId: caseId,
      },
    });
  };

  const renderItem = ({ item }: { item: CommonDocument }) => {
    const isPdf = item.documentType === "PDF";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/(fro)/(complaints)/preview",
            params: {
              id: item.id,
              name: item.documentName,
              type: item.documentType,
            },
          })
        }
      >
        <View style={styles.iconBox}>
          <Ionicons
            name={isPdf ? "document-text" : "image"}
            size={26}
            color={theme.colors.colorPrimary500}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.documentName}
          </Text>

          <Text style={styles.desc} numberOfLines={2}>
            {item.documentDescription}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {(item.documentSize / 1024).toFixed(1)} KB
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>
              {new Date(item.createdDate).toDateString()}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.colorTextSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <BodyLayout type="screen" screenName="Documents">
      {/* ---------- ADD DOCUMENT BUTTON ---------- */}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: theme.colors.colorPrimary500 },
        ]}
        onPress={onAddDocument}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={20} color={theme.colors.colorBgSurface} />
        <Text
          style={[styles.addButtonText, { color: theme.colors.colorBgSurface }]}
        >
          Add Document
        </Text>
      </TouchableOpacity>

      {/* ---------- DOCUMENT LIST ---------- */}
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No documents found</Text> : null
        }
      />
    </BodyLayout>
  );
}
const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },

  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F4F6FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E1E4EA",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  desc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  metaText: {
    fontSize: 11,
    color: "#888",
  },

  metaDot: {
    marginHorizontal: 6,
    color: "#888",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
});
