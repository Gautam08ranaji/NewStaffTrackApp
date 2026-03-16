import { getReimbursementList } from "@/features/fro/Attendance/leaves/getReimbursementList";
import { getLookupMasters } from "@/features/fro/getLookupMasters";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router, useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

// Interfaces
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

// Format date
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

export default function ReimbursementHistoryScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const authState = useAppSelector((state) => state.auth);

  // State management
  const [reimbursements, setReimbursements] = useState<ReimbursementItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedReimbursement, setSelectedReimbursement] = useState<ReimbursementItem | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      loadReimbursements(1, true);
      fetchExpenses()
    }, [])
  );


  const fetchExpenses = async () => {
  try {
    const res = await getLookupMasters({
      lookupType: "expenses",
      token: String(authState.token),
      csrfToken: String(authState.antiforgeryToken),
    });

    console.log("res exp",res);
  } catch (err) {
    console.error(err);
  }
};

  const loadReimbursements = async (page: number = 1, reset: boolean = false) => {
    if (isLoading) return;

    setIsLoading(true);
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
        setHasMore(newReimbursements.length === 10);

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
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReimbursements(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadReimbursements(currentPage + 1, false);
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

  // Render list header
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
        disabled={isLoading}
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
    if (!isLoading) return null;

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
      <TouchableOpacity
        style={[
          styles.emptyListButton,
          { backgroundColor: theme.colors.colorPrimary600 },
        ]}
        onPress={() => navigation.navigate("reimbursement/add" as never)}
        activeOpacity={0.7}
      >
        <RemixIcon
          name="add-line"
          size={20}
          color={theme.colors.colorTextInverse}
        />
        <Text
          style={[
            styles.emptyListButtonText,
            { color: theme.colors.colorTextInverse },
          ]}
        >
          {t("reimbursement.addNew") || "Add New Reimbursement"} hjfkhfjhytrjhgfm
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

         <TouchableOpacity
        style={[
          styles.emptyListButton,
          { backgroundColor: theme.colors.colorPrimary600 },
        ]}
        onPress={() => {
          router.push("/(fro)/(info)/addReimbursement")
        }}
        activeOpacity={0.7}
      >
        <RemixIcon
          name="add-line"
          size={20}
          color={theme.colors.colorTextInverse}
        />
        <Text
          style={[
            styles.emptyListButtonText,
            { color: theme.colors.colorTextInverse },
          ]}
        >
          {"Add New Reimbursement"} 
        </Text>
      </TouchableOpacity>
      <FlatList
        data={reimbursements}
        renderItem={renderReimbursementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reimbursementList}
        ListHeaderComponent={renderListHeader}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        showsVerticalScrollIndicator={false}
      />

      {/* Reimbursement Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: theme.colors.colorOverlay }]}
          activeOpacity={1}
          onPress={() => setDetailsModalVisible(false)}
        >
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
        </TouchableOpacity>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reimbursementList: {
    padding: 16,
    paddingBottom: 20,
    gap: 12,
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
    textAlign: "center",
  },
  emptyListText: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
  },
  emptyListButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyListButtonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  detailsModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,

    paddingHorizontal: 20,
    paddingBottom: 60,
    maxHeight: "70%",
  },
  detailsModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: 'Poppins-SemiBold',
  },
  closeButton: {
    padding: 4,
  },
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