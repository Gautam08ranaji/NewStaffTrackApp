import BodyLayout from "@/components/layout/BodyLayout";
import { getCommonDocumentList } from "@/features/fro/complaints/getCommonDocumentList";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const caseId = params.caseId ? Number(params.caseId) : null;
  const [documents, setDocuments] = useState<CommonDocument[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authState = useAppSelector((state) => state.auth);

  console.log("caseId:", caseId);

  const PAGE_SIZE = 10;

  const loadDocuments = async (pageNumber = 1, isRefreshing = false) => {
    // Check if we have caseId
    if (!caseId) {
      setError(t("documents.missingCaseId") || "Case ID is missing");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Check if we have auth token
    if (!authState?.token) {
      setError(t("documents.authError") || "Authentication error. Please login again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      console.log("Loading documents for caseId:", caseId, "page:", pageNumber);

      const res = await getCommonDocumentList({
        pageNumber,
        pageSize: PAGE_SIZE,
        relatedToId: caseId,
        csrfToken: String(authState?.antiforgeryToken || ""),
        authToken: String(authState?.token),
      });

      console.log("API Response:", res);

      // Check if response has the expected structure
      if (res && res.list) {
        setDocuments((prev) =>
          pageNumber === 1 ? res.list : [...prev, ...res.list]
        );
        setTotal(res.totalRecords || 0);
        setPage(pageNumber);
      } else {
        // Handle unexpected response structure
        console.error("Unexpected API response structure:", res);
        setError(t("documents.invalidResponse") || "Invalid response from server");
      }
    } catch (error: any) {
      console.error("Failed to load documents:", error);
      
      // Handle different types of errors
      let errorMessage = t("documents.loadError") || "Failed to load documents";
      
      if (error.message) {
        if (error.message.includes("Network error") || error.isNetworkError) {
          errorMessage = t("documents.networkError") || "Network error. Please check your internet connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = t("documents.timeoutError") || "Request timeout. Please try again.";
        } else if (error.response?.status === 401) {
          errorMessage = t("documents.unauthorized") || "Unauthorized. Please login again.";
        } else if (error.response?.status === 404) {
          errorMessage = t("documents.notFound") || "Documents not found.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Show alert for critical errors
      if (error.isNetworkError || error.response?.status === 401) {
        Alert.alert(
          t("common.error") || "Error",
          errorMessage,
          [
            { 
              text: t("common.ok") || "OK",
              onPress: () => {
                if (error.response?.status === 401) {
                  // Navigate to login if unauthorized
                  router.replace("/(auth)/login");
                }
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDocuments(1, true);
  }, [caseId, authState?.token]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [caseId, authState?.token])
  );

  const loadMore = () => {
    if (documents.length < total && !loading && !error) {
      loadDocuments(page + 1);
    }
  };

  const onAddDocument = () => {
    if (!caseId) {
      Alert.alert(
        t("common.error") || "Error",
        t("documents.missingCaseId") || "Case ID is missing"
      );
      return;
    }

    console.log("Add Document Pressed for caseId:", caseId);

    router.push({
      pathname: "/(fro)/(complaints)/AddPhotoScreen",
      params: {
        caseId: caseId,
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString(t("common.locale") || "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderItem = ({ item }: { item: CommonDocument }) => {
    const isPdf = item.documentType?.toUpperCase() === "PDF";

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { 
            backgroundColor: theme.colors.colorBgSurface,
            borderColor: theme.colors.border,
          }
        ]}
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
        <View style={[styles.iconBox, { 
          backgroundColor: theme.colors.colorBgAlt,
          borderColor: theme.colors.border,
        }]}>
          <Ionicons
            name={isPdf ? "document-text" : "image"}
            size={26}
            color={theme.colors.colorPrimary500}
          />
        </View>

        <View style={styles.info}>
          <Text 
            style={[styles.name, { color: theme.colors.colorTextPrimary }]} 
            numberOfLines={1}
          >
            {item.documentName || "Unnamed"}
          </Text>

          <Text 
            style={[styles.desc, { color: theme.colors.colorTextSecondary }]} 
            numberOfLines={2}
          >
            {item.documentDescription || t("common.noDescription") || "No description"}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.colors.colorTextTertiary }]}>
              {formatFileSize(item.documentSize)}
            </Text>
            <Text style={[styles.metaDot, { color: theme.colors.colorTextTertiary }]}>•</Text>
            <Text style={[styles.metaText, { color: theme.colors.colorTextTertiary }]}>
              {formatDate(item.createdDate)}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.colorTextTertiary}
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading && documents.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.colorPrimary600} />
          <Text style={[styles.loadingText, { color: theme.colors.colorTextSecondary }]}>
            {t("common.loading") || "Loading..."}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons 
            name="cloud-offline-outline" 
            size={50} 
            color={theme.colors.colorTextTertiary} 
          />
          <Text style={[styles.errorText, { color: theme.colors.colorTextSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.btnPrimaryBg }]}
            onPress={() => loadDocuments()}
          >
            <Text style={[styles.retryText, { color: theme.colors.btnPrimaryText }]}>
              {t("common.retry") || "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons 
          name="document-text-outline" 
          size={50} 
          color={theme.colors.colorTextTertiary} 
        />
        <Text style={[styles.emptyText, { color: theme.colors.colorTextTertiary }]}>
          {t("documents.noDocuments") || "No documents found"}
        </Text>
      </View>
    );
  };

  return (
    <BodyLayout type="screen" screenName={t("documents.screenTitle") || "Documents"} enableScroll={false}>
      {/* ---------- ADD DOCUMENT BUTTON ---------- */}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: theme.colors.btnPrimaryBg },
          !caseId && styles.disabledButton,
        ]}
        onPress={onAddDocument}
        activeOpacity={0.9}
        disabled={!caseId}
      >
        <Ionicons name="add" size={20} color={theme.colors.btnPrimaryText} />
        <Text
          style={[styles.addButtonText, { color: theme.colors.btnPrimaryText }]}
        >
          {t("documents.addDocument") || "Add Document"}
        </Text>
      </TouchableOpacity>

      {/* ---------- DOCUMENT LIST ---------- */}
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ 
          paddingBottom: 20,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.colorPrimary600]}
            tintColor={theme.colors.colorPrimary600}
          />
        }
        ListFooterComponent={
          loading && documents.length > 0 ? (
            <ActivityIndicator 
              style={{ marginVertical: 16 }} 
              color={theme.colors.colorPrimary600}
            />
          ) : null
        }
        ListEmptyComponent={renderEmptyState()}
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
    marginHorizontal: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
  },
  desc: {
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    fontSize: 11,
  },
  metaDot: {
    marginHorizontal: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
  errorText: {
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});