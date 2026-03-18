import BodyLayout from "@/components/layout/BodyLayout";
import ConfirmationAlert from "@/components/reusables/ConfirmationAlert";
import { deleteClient } from "@/features/fro/profile/DeleteSeller";
import { getClientList } from "@/features/fro/profile/GetClientList";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { showApiError } from "@/utils/showApiError";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
import RemixIcon from "react-native-remix-icon";

interface ClientData {
    id: number;
    name: string;
    mobileNo: string;
    alternateNo?: string;
    emailId?: string;
    address?: string;
    pinCode?: string;
    pinLocation?: string;
    districtName?: string;
    stateName?: string;
    gender?: string;
    isMobileApp?: string;
    latitude?: string;
    longitude?: string;
    productName?: string;
    transactionNumber?: string;
}

interface ApiResponse {
    contactList: ClientData[];
    totalRecords: number;
}

export default function ClientListScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const authState = useAppSelector((state) => state.auth);

    const [clients, setClients] = useState<ClientData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [deleteAlert, setDeleteAlert] = useState<{ visible: boolean; client: ClientData | null }>({
        visible: false,
        client: null,
    });

    useFocusEffect(
        useCallback(() => {
            fetchClients();
        }, [])
    );


    const handleDeleteConfirm = async () => {
        if (!deleteAlert.client) return;

        try {
            const res = await deleteClient({
                id: deleteAlert.client.id,
                token: String(authState.token),
                csrfToken: String(authState.antiforgeryToken),
            });

            if (res?.success) {
                setClients((prev) =>
                    prev.filter((c) => c.id !== deleteAlert.client!.id)
                );
                Alert.alert("Success", "Client deleted successfully");
            } else {
                Alert.alert("Error", res?.message || "Delete failed");
            }
        } catch (error) {
            showApiError(error, dispatch);
        } finally {
            setDeleteAlert({ visible: false, client: null });
        }
    };

    const fetchClients = async (pageNumber: number = 1, pageSize: number = 50) => {
        try {
            const res = await getClientList({
                pageNumber: pageNumber,
                pageSize: pageSize,
                token: String(authState.token),
                csrfToken: String(authState.antiforgeryToken),
            });

            console.log("list api response:", res);

            if (res?.success && res?.data) {
                // Handle the response structure with contactList array
                if (res.data.contactList && Array.isArray(res.data.contactList)) {
                    setClients(res.data.contactList);
                    setTotalRecords(res.data.totalRecords || 0);
                } else if (Array.isArray(res.data)) {
                    // Fallback if data is directly an array
                    setClients(res.data);
                } else {
                    setClients([]);
                }
            } else {
                Alert.alert("Error", res?.message || "Failed to fetch clients");
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            showApiError(error, dispatch);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchClients();
    };

    const handleAddSeller = () => {
        router.push("/(fro)/(profile)/SellerOnboardingScreen");
    };

    const handleDeletePress = (client: ClientData) => {
        setDeleteAlert({ visible: true, client });
    };



    const handleDeleteCancel = () => {
        setDeleteAlert({ visible: false, client: null });
    };

    const handleEdit = (clientId: number) => {
        router.push({
            pathname: "/(fro)/(profile)/UpdateSeller",
            params: { id: clientId }
        });
    };

    const renderClientItem = ({ item, index }: { item: ClientData; index: number }) => (
        <View
            style={[
                styles.clientCard,
                {
                    backgroundColor: theme.colors.colorBgSurface,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.clientName, { color: theme.colors.colorTextPrimary }]} numberOfLines={1}>
                    {item.name || `Client ${index + 1}`}
                </Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.colorPrimary100 }]}
                        onPress={() => handleEdit(item.id)}
                    >
                        <RemixIcon name="pencil-line" size={18} color={theme.colors.colorPrimary600} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeletePress(item)}
                        style={[styles.actionButton, { backgroundColor: theme.colors.colorError100 }]}
                    >
                        <RemixIcon name="delete-bin-line" size={18} color={theme.colors.colorError600} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.clientInfo}>
                {item.transactionNumber && (
                    <View style={styles.infoRow}>
                        <RemixIcon name="file-list-line" size={16} color={theme.colors.colorTextSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.colorTextSecondary }]} numberOfLines={1}>
                            {item.transactionNumber}
                        </Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <RemixIcon name="phone-line" size={16} color={theme.colors.colorTextSecondary} />
                    <Text style={[styles.infoText, { color: theme.colors.colorTextPrimary }]}>
                        {item.mobileNo}
                    </Text>
                </View>
                {item.emailId && (
                    <View style={styles.infoRow}>
                        <RemixIcon name="mail-line" size={16} color={theme.colors.colorTextSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.colorTextSecondary }]} numberOfLines={1}>
                            {item.emailId}
                        </Text>
                    </View>
                )}
                {item.productName && (
                    <View style={styles.infoRow}>
                        <RemixIcon name="shopping-bag-line" size={16} color={theme.colors.colorTextSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.colorTextSecondary }]} numberOfLines={1}>
                            {item.productName}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <BodyLayout type="screen" screenName="Seller List" enableScroll={false}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.colorPrimary600} />
                </View>
            </BodyLayout>
        );
    }

    return (
        <BodyLayout type="screen" screenName="Seller List">
            <TouchableOpacity
                style={[styles.addSellerButton, {
                    backgroundColor: theme.colors.colorPrimary600
                }]}
                onPress={handleAddSeller}
            >
                <Text style={{ color: theme.colors.btnPrimaryText, fontFamily: "Poppins-Medium" }}>
                    Add Seller
                </Text>
            </TouchableOpacity>

            {/* {totalRecords > 0 && (
                <Text style={[styles.totalRecords, { color: theme.colors.colorTextSecondary }]}>
                    Total Sellers: {totalRecords}
                </Text>
            )} */}

            <FlatList
                data={clients}
                renderItem={renderClientItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.colorPrimary600]}
                        tintColor={theme.colors.colorPrimary600}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <RemixIcon name="user-search-line" size={64} color={theme.colors.colorTextTertiary} />
                        <Text style={[styles.emptyText, { color: theme.colors.colorTextSecondary }]}>
                            No sellers found
                        </Text>
                    </View>
                }
            />

            <ConfirmationAlert
                visible={deleteAlert.visible}
                icon="delete-bin-line"
                title="Delete Seller"
                description={`Are you sure you want to delete ${deleteAlert.client?.name || 'this seller'}?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmColor={theme.colors.colorError600}
                cancelColor={theme.colors.colorBgSurface}
                subtitleColor={theme.colors.colorTextSecondary}
            />
        </BodyLayout>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    clientCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginBottom: 12,
    },
    clientName: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        flex: 1,
        marginRight: 8,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    clientInfo: {
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        fontFamily: "Poppins-Regular",
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        marginTop: 12,
    },
    addSellerButton: {
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        margin: 16,
        borderRadius: 10,
    },
    totalRecords: {
        fontSize: 14,
        fontFamily: "Poppins-Medium",
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
});