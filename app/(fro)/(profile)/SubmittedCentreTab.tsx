import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

import {
  ApiAuthContext,
  getListStatic,
} from "@/features/fro/getKnowledgeListApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";

/* ================= UPDATED TYPES ================= */
type ListItemType =
  | "FAQ"
  | "NGO"
  | "HOSPITAL"
  | "PALLIATIVE"
  | "DAYCARE"
  | "CAREGIVER"
  | "PRODUCT"
  | "PSYCHIATRIC"
  | "ORGAN_DONATION"
  | "COUNSELLING"
  | "DIAGNOSTIC";

type FilterType = ListItemType | "ALL";

interface ListItem {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  createdDate?: string;
  type: ListItemType;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  district?: string;
  state?: string;
  distance?: string;
  hospitalType?: string;
  status?: "Open" | "Closed";
  category?: string;
  isEnabled?: boolean;
  price?: string;
  productCategory?: string;
}

/* ================= UPDATED HOSPITAL CARD COMPONENT ================= */
const UnifiedCard = ({
  name,
  type,
  status = "Open",
  address,
  phone,
  distance,
  email,
  onViewDetails,
  onCall,
  category = "General",
  price,
  productCategory,
}: {
  name: string;
  type: string;
  status?: "Open" | "Closed";
  address?: string;
  phone?: string;
  distance?: string;
  email?: string;
  onViewDetails?: () => void;
  onCall?: () => void;
  category?: string;
  price?: string;
  productCategory?: string;
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "FAQ":
        return "#3B82F6"; // Blue
      case "NGO":
        return "#10B981"; // Emerald
      case "HOSPITAL":
        return "#8B5CF6"; // Violet
      case "PALLIATIVE":
        return "#F59E0B"; // Amber
      case "DAYCARE":
        return "#10B981";
      case "CAREGIVER":
        return "#8B5CF6";
      case "PRODUCT":
        return "#EC4899";
      case "PSYCHIATRIC":
        return "#6366F1";
      case "ORGAN_DONATION":
        return "#DC2626";
      case "COUNSELLING":
        return "#F59E0B";

      // Pink for products
      default:
        return "#6B7280"; // Gray
    }
  };

  const categoryColor = getCategoryColor(category);

  return (
    <View style={cardStyles.card}>
      {/* ================= HEADER ================= */}
      <View style={cardStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.title}>{name}</Text>
          <View style={cardStyles.typeRow}>
            <View
              style={[
                cardStyles.categoryBadge,
                { backgroundColor: `${categoryColor}15` },
              ]}
            >
              <Text style={[cardStyles.categoryText, { color: categoryColor }]}>
                {category}
              </Text>
            </View>
            {productCategory && (
              <View style={cardStyles.productCategoryBadge}>
                <Text style={cardStyles.productCategoryText}>
                  {productCategory}
                </Text>
              </View>
            )}
            <Text style={cardStyles.subTitle} numberOfLines={1}>
              {type}
            </Text>
          </View>
        </View>

        {status && category !== "PRODUCT" && (
          <View
            style={[
              cardStyles.statusBadge,
              status === "Closed"
                ? cardStyles.closedBadge
                : cardStyles.openBadge,
            ]}
          >
            <Text
              style={[
                cardStyles.statusText,
                status === "Closed"
                  ? cardStyles.closedText
                  : cardStyles.openText,
              ]}
            >
              {status}
            </Text>
          </View>
        )}

        {/* Price for products */}
        {price && category === "PRODUCT" && (
          <View style={cardStyles.priceBadge}>
            <Text style={cardStyles.priceText}>₹{price}</Text>
          </View>
        )}
      </View>

      {/* ================= DESCRIPTION/ADDRESS ================= */}
      <View style={cardStyles.row}>
        <RemixIcon
          name={
            category === "PRODUCT"
              ? "shopping-bag-line"
              : address
                ? "map-pin-line"
                : "information-line"
          }
          size={14}
          color="#6B7280"
        />
        <Text style={cardStyles.addressText}>
          {address || "Details available upon request"}
          {phone && (
            <Text style={cardStyles.phoneText}>
              {address ? " • " : ""}Ph: {phone}
            </Text>
          )}
        </Text>
      </View>

      {/* ================= EMAIL (IF AVAILABLE) ================= */}
      {email && (
        <View style={cardStyles.row}>
          <RemixIcon name="mail-line" size={14} color="#6B7280" />
          <Text style={cardStyles.emailText}>{email}</Text>
        </View>
      )}

      {/* ================= DISTANCE (NOT FOR PRODUCTS) ================= */}
      {distance && category !== "PRODUCT" && (
        <View style={cardStyles.distanceBadge}>
          <Text style={cardStyles.distanceText}>Distance: {distance} Away</Text>
        </View>
      )}

      {/* ================= PRODUCT AVAILABILITY ================= */}
      {category === "PRODUCT" && (
        <View style={cardStyles.availabilityRow}>
          <View style={cardStyles.availabilityDot} />
          <Text style={cardStyles.availabilityText}>Available</Text>
        </View>
      )}

      {/* ================= ACTION BUTTONS ================= */}
      <View style={cardStyles.actions}>
        <TouchableOpacity
          style={[
            cardStyles.viewBtn,
            category === "PRODUCT" && cardStyles.productViewBtn,
          ]}
          onPress={onViewDetails}
          activeOpacity={0.8}
        >
          <Text
            style={[
              cardStyles.viewBtnText,
              category === "PRODUCT" && cardStyles.productViewBtnText,
            ]}
          >
            {category === "PRODUCT" ? "View Product" : "View Details"}
          </Text>
        </TouchableOpacity>

        {phone && category !== "PRODUCT" && (
          <TouchableOpacity
            style={cardStyles.callBtn}
            onPress={onCall}
            activeOpacity={0.8}
          >
            <RemixIcon name={"phone-fill"} size={16} color="#FFFFFF" />
            <Text style={cardStyles.callBtnText}>Call</Text>
          </TouchableOpacity>
        )}

        {category === "PRODUCT" && (
          <TouchableOpacity
            style={cardStyles.buyBtn}
            onPress={onViewDetails}
            activeOpacity={0.8}
          >
            <RemixIcon name={"shopping-cart-fill"} size={16} color="#FFFFFF" />
            <Text style={cardStyles.buyBtnText}>Buy</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productCategoryBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  productCategoryText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#8B5CF6",
  },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  closedBadge: {
    backgroundColor: "#FEE2E2",
  },
  openBadge: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  closedText: {
    color: "#DC2626",
  },
  openText: {
    color: "#16A34A",
  },
  priceBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D97706",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  addressText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#374151",
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 18,
  },
  phoneText: {
    color: "#374151",
    fontWeight: "500",
  },
  emailText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#374151",
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 18,
  },
  distanceBadge: {
    marginTop: 10,
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  distanceText: {
    fontSize: 13,
    color: "#0284C7",
    fontWeight: "500",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#0EA5A4",
    justifyContent: "center",
    alignItems: "center",
  },
  productViewBtn: {
    borderColor: "#EC4899",
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0EA5A4",
  },
  productViewBtnText: {
    color: "#EC4899",
  },
  callBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#047857",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  callBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buyBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#EC4899",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buyBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

/* ================= UPDATED PROFESSIONAL UI CONFIG ================= */
const UI_CONFIG = {
  FAQ: {
    color: "#3B82F6", // Blue
    lightColor: "#EFF6FF",
    icon: "question-line" as const,
    title: "FAQs",
    gradient: ["#3B82F6", "#60A5FA"],
  },
  NGO: {
    color: "#10B981", // Emerald
    lightColor: "#ECFDF5",
    icon: "community-line" as const,
    title: "NGOs",
    gradient: ["#10B981", "#34D399"],
  },
  HOSPITAL: {
    color: "#8B5CF6", // Violet
    lightColor: "#F5F3FF",
    icon: "hospital-line" as const,
    title: "Hospitals",
    gradient: ["#8B5CF6", "#A78BFA"],
  },
  PALLIATIVE: {
    color: "#F59E0B", // Amber
    lightColor: "#FFFBEB",
    icon: "heart-pulse-line" as const,
    title: "Palliative Care",
    gradient: ["#F59E0B", "#FBBF24"],
  },
  CAREGIVER: {
    color: "#10B981", // Emerald
    lightColor: "#ECFDF5",
    icon: "community-line" as const,
    title: "Caregiver",
    gradient: ["#10B981", "#34D399"],
  },
  DAYCARE: {
    color: "#3B82F6", // Blue
    lightColor: "#EFF6FF",
    icon: "home-heart-line" as const,
    title: "Day Care",
    gradient: ["#3B82F6", "#60A5FA"],
  },
  PRODUCT: {
    color: "#EC4899", // Pink
    lightColor: "#FDF2F8",
    icon: "shopping-bag-line" as const,
    title: "Products",
    gradient: ["#EC4899", "#F472B6"],
  },
  ALL: {
    color: "#6B7280", // Gray
    lightColor: "#F9FAFB",
    icon: "apps-line" as const,
    title: "All",
    gradient: ["#6B7280", "#9CA3AF"],
  },
  PSYCHIATRIC: {
    color: "#6366F1", // Indigo
    lightColor: "#EEF2FF",
    icon: "mental-health-line" as const,
    title: "Psychiatric Clinics",
    gradient: ["#6366F1", "#818CF8"],
  },
  ORGAN_DONATION: {
    color: "#DC2626", // Red
    lightColor: "#FEF2F2",
    icon: "heart-add-line" as const,
    title: "Organ Donation",
    gradient: ["#DC2626", "#EF4444"],
  },
  COUNSELLING: {
    color: "#0EA5E9", // Sky Blue
    lightColor: "#E0F2FE",
    icon: "chat-heart-line" as const,
    title: "Counselling",
    gradient: ["#0EA5E9", "#38BDF8"],
  },
  DIAGNOSTIC: {
    color: "#14B8A6", // Teal
    lightColor: "#ECFEFF",
    icon: "microscope-line" as const,
    title: "Diagnostic Centres",
    gradient: ["#14B8A6", "#2DD4BF"],
  },
};

/* ================= MAIN COMPONENT ================= */
export default function KnowledgeCenterTab() {
  const { theme } = useTheme();
  const authState = useAppSelector((state) => state.auth);

  const [allItems, setAllItems] = useState<ListItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(false);

  /* ================= AUTH MEMO ================= */
  const apiAuth = useMemo<ApiAuthContext | null>(() => {
    if (!authState.token || !authState.antiforgeryToken) return null;
    return {
      bearerToken: authState.token,
      antiForgeryToken: authState.antiforgeryToken,
    };
  }, [authState.token, authState.antiforgeryToken]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!apiAuth || !authState.userId) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel including the new product data
        const [
          faqRes,
          ngoRes,
          hospitalListRes,
          palliativeListRes,
          dayCareCentres,
          caregiversRes,
          productsRes,
          psychiatricRes,
          organDonationRes,
          counsellingRes,
        ] = await Promise.all([
          getListStatic({
            endpoint: "GetFaqList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
          getListStatic({
            endpoint: "GetNgoMasterList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
          getListStatic({
            endpoint: "GetHospitalMasterList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
          getListStatic({
            endpoint: "GetPalliativeCaresList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
          getListStatic({
            endpoint: "GetDayCareCentreList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
          getListStatic({
            endpoint: "GetCaregiversList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
          getListStatic({
            endpoint: "GetElderFriendlyProductList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
          getListStatic({
            endpoint: "GetPsychiatricClinicsList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),

          getListStatic({
            endpoint: "GetOrganDonationOrgList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),

          getListStatic({
            endpoint: "GetCounsellingCentresList",
            auth: apiAuth,
            userId: authState.userId as string,
          }),
        ]);

        if (!isMounted) return;

        const faqItems: ListItem[] =
          faqRes?.data?.faqs?.map((faq: any) => ({
            id: faq.id,
            title: faq.name,
            description: faq.description,
            createdDate: faq.createdDate,
            type: "FAQ",
            category: "FAQ",
            status: "Open",
            address: faq.address || "Knowledge Base",
            hospitalType: "Information",
          })) ?? [];

        const ngoItems: ListItem[] =
          ngoRes?.data?.ngoMasterList?.map((ngo: any) => ({
            id: String(ngo.id),
            title: ngo.name,
            description: ngo.discriptions,
            subtitle: `${ngo.distrinct}, ${ngo.state}`,
            address: ngo.address || ngo.location,
            contactPhone: ngo.contactPhone,
            contactEmail: ngo.contactEmail,
            category: "NGO",
            type: "NGO",
            status: "Open",
            distance: "N/A",
            hospitalType: ngo.ngoType || "NGO",
          })) ?? [];

        const hospitalItems: ListItem[] =
          hospitalListRes?.data?.hospitalMasterList?.map((hospital: any) => ({
            id: String(hospital.id),
            title: hospital.name,
            description: hospital.discriptions,
            subtitle: `${hospital.distrinct || hospital.city || ""}`,
            address: hospital.address,
            contactPhone: hospital.contactPhone,
            contactEmail: hospital.contactEmail,
            category: "HOSPITAL",
            hospitalType: hospital.type || "Hospital",
            status: hospital.isActive ? "Open" : "Closed",
            distance: "5 km",
            type: "HOSPITAL",
          })) ?? [];

        const palliativeItems: ListItem[] =
          palliativeListRes?.data?.palliativeCares?.map((palliative: any) => ({
            id: String(palliative.id),
            title: palliative.name,
            description: palliative.description,
            subtitle: `${palliative.district || ""}, ${palliative.state || ""}`,
            address: palliative.address,
            contactPhone: palliative.contactPhone,
            contactEmail: palliative.contactEmail,
            district: palliative.district,
            state: palliative.state,
            createdDate: palliative.createdDate,
            category: "PALLIATIVE",
            type: "PALLIATIVE",
            status: "Open",
            distance: "5 km",
            hospitalType: palliative.serviceType || "Palliative Care",
          })) ?? [];

        const caregiverItems: ListItem[] =
          caregiversRes?.data?.caregivers?.map((cg: any) => ({
            id: String(cg.id),
            title: cg.name,
            description: cg.description,
            subtitle: `${cg.district || ""}, ${cg.state || ""}`,
            address: cg.address || "Address not available",
            contactPhone: cg.contactPhone,
            contactEmail: cg.contactEmail,
            district: cg.district,
            state: cg.state,
            createdDate: cg.createdDate,
            category: "CAREGIVER",
            type: "CAREGIVER",
            status: cg.isEnabled ? "Open" : "Closed",
            distance: "Distance not available",
            hospitalType: "Care Giver / Care Centre",
          })) ?? [];

        const dayCareItems: ListItem[] =
          dayCareCentres?.data?.dayCareCentres?.map((dc: any) => ({
            id: String(dc.id),
            title: dc.name,
            description: dc.description,
            subtitle: `${dc.district || ""}, ${dc.state || ""}`,
            address: dc.address || "Address not available",
            contactPhone: dc.contactPhone,
            contactEmail: dc.contactEmail,
            district: dc.district,
            state: dc.state,
            createdDate: dc.createdDate,
            category: "DAYCARE",
            type: "DAYCARE",
            status: dc.isEnabled ? "Open" : "Closed",
            distance: "Distance not available",
            hospitalType: "Day Care Centre",
          })) ?? [];
        const psychiatricItems: ListItem[] =
          psychiatricRes?.data?.psychiatricClinics?.map((pc: any) => ({
            id: String(pc.id),
            title: pc.name,
            description: pc.description,
            subtitle: `${pc.district}, ${pc.state}`,
            address: pc.address,
            contactPhone: pc.contactPhone,
            contactEmail: pc.contactEmail,
            district: pc.district,
            state: pc.state,
            createdDate: pc.createdDate,
            type: "PSYCHIATRIC",
            category: "PSYCHIATRIC",
            status: pc.isEnabled ? "Open" : "Closed",
            distance: "Distance not available",
            hospitalType: "Psychiatric Clinic",
          })) ?? [];

        const productItems: ListItem[] =
          productsRes?.data?.elderFriendlyProducts?.map((product: any) => ({
            id: String(product.id),
            title: product.name,
            description: product.description,
            category: "PRODUCT",
            type: "PRODUCT",
            status: product.isEnabled ? "Open" : "Closed",
            isEnabled: product.isEnabled,
            createdDate: product.createdDate,
            price: "999", // Default price, adjust based on API response if available
            productCategory: "Elder Care", // Default category
            hospitalType: "Elder Friendly Product",
          })) ?? [];

        const organDonationItems: ListItem[] =
          organDonationRes?.data?.organDonationOrgs?.map((org: any) => ({
            id: String(org.id),
            title: org.name,
            description: org.description,
            subtitle: `${org.district}, ${org.state}`,
            district: org.district,
            state: org.state,
            createdDate: org.createdDate,
            type: "ORGAN_DONATION",
            category: "ORGAN_DONATION",
            status: org.isEnabled ? "Open" : "Closed",
            address: "Organization details available",
            hospitalType: "Organ Donation Organization",
            distance: "Distance not available",
          })) ?? [];

        const counsellingItems: ListItem[] =
          counsellingRes?.data?.counsellingCentres?.map((cc: any) => ({
            id: String(cc.id),
            title: cc.name,
            description: cc.description,
            subtitle: `${cc.district}, ${cc.state}`,
            address: cc.address,
            contactPhone: cc.contactPhone,
            contactEmail: cc.contactEmail,
            district: cc.district,
            state: cc.state,
            createdDate: cc.createdDate,
            type: "COUNSELLING",
            category: "COUNSELLING",
            status: cc.isEnabled ? "Open" : "Closed",
            distance: "Distance not available",
            hospitalType: "Counselling Centre",
          })) ?? [];

        setAllItems([
          ...faqItems,
          ...ngoItems,
          ...hospitalItems,
          ...palliativeItems,
          ...dayCareItems,
          ...caregiverItems,
          ...productItems,
          ...psychiatricItems,
          ...organDonationItems,
          ...counsellingItems,
        ]);
      } catch (error) {
        console.error("❌ API error", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [apiAuth, authState.userId]);

  /* ================= FILTERING ================= */
  const filteredItems = useMemo(() => {
    if (filter === "ALL") return allItems;
    return allItems.filter((i) => i.type === filter);
  }, [allItems, filter]);

  const getFilteredCount = (type: FilterType) => {
    if (type === "ALL") return allItems.length;
    return allItems.filter((i) => i.type === type).length;
  };

  /* ================= HANDLERS ================= */
  const handleViewDetails = (item: ListItem) => {
    console.log("View details:", item);
    router.push({
      pathname: "/(fro)/(profile)/knowledgeCentreDetailScreen",
      params: { item: JSON.stringify(item) },
    });
  };

  const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) return;
    console.log("Calling:", phoneNumber);
    // Implement calling functionality
    // Linking.openURL(`tel:${phoneNumber}`);
  };

  /* ================= UI COMPONENTS ================= */
  const FilterButton = ({ filterType }: { filterType: FilterType }) => {
    const isActive = filter === filterType;
    const config = UI_CONFIG[filterType];
    const count = getFilteredCount(filterType);

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive
              ? config.color
              : theme.colors.colorBgSurface,
            borderColor: isActive ? config.color : theme.colors.colorBorder,
          },
        ]}
        onPress={() => setFilter(filterType)}
      >
        <RemixIcon
          name={config.icon}
          size={16}
          color={isActive ? "#FFFFFF" : config.color}
        />
        <Text
          style={[
            styles.filterText,
            {
              color: isActive ? "#FFFFFF" : config.color,
              fontWeight: isActive ? "600" : "400",
            },
          ]}
        >
          {config.title}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.countBadge,
              { backgroundColor: isActive ? "#FFFFFF" : config.color },
            ]}
          >
            <Text
              style={[
                styles.countText,
                { color: isActive ? config.color : "#FFFFFF" },
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const RenderItem = ({ item }: { item: ListItem }) => {
    // Determine appropriate status
    const getStatus = (item: ListItem): "Open" | "Closed" => {
      if (item.status) return item.status;
      if (item.type === "FAQ") return "Open";
      if (item.type === "PRODUCT") return item.isEnabled ? "Open" : "Closed";
      if (item.contactPhone || item.contactEmail) return "Open";
      return "Closed";
    };

    // Determine type text to display
    const getTypeText = (item: ListItem): string => {
      if (item.hospitalType) return item.hospitalType;
      if (item.type === "FAQ") return "Frequently Asked Question";
      if (item.type === "NGO") return "Non-Governmental Organization";
      if (item.type === "PALLIATIVE") return "Palliative Care Service";
      if (item.type === "PRODUCT") return "Elder Friendly Product";
      if (item.type === "PSYCHIATRIC") return "Psychiatric Clinic";
      if (item.type === "ORGAN_DONATION") return "Organ Donation Organization";
      if (item.type === "COUNSELLING") return "Counselling Centre";

      return "Service";
    };

    // For products, determine address/description
    const getDisplayAddress = (item: ListItem): string => {
      if (item.address) return item.address;
      if (item.subtitle) return item.subtitle;
      if (item.description) return item.description;
      return "Product details available";
    };

    return (
      <UnifiedCard
        name={item.title}
        type={getTypeText(item)}
        status={item.type !== "PRODUCT" ? getStatus(item) : undefined}
        address={getDisplayAddress(item)}
        phone={item.contactPhone}
        distance={item.distance}
        email={item.contactEmail}
        category={item.type}
        price={item.price}
        productCategory={item.productCategory}
        onViewDetails={() => handleViewDetails(item)}
        onCall={
          item.contactPhone && item.type !== "PRODUCT"
            ? () => handleCall(item.contactPhone)
            : undefined
        }
      />
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <RemixIcon
          name="folder-open-line"
          size={64}
          color={theme.colors.colorBorder}
        />
      </View>
      <Text
        style={[styles.emptyTitle, { color: theme.colors.colorTextPrimary }]}
      >
        No Items Found
      </Text>
      <Text
        style={[
          styles.emptyDescription,
          { color: theme.colors.colorTextSecondary },
        ]}
      >
        {filter === "ALL"
          ? "No knowledge items available"
          : `No ${UI_CONFIG[filter].title.toLowerCase()} found`}
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.colorPrimary600} />
      <Text
        style={[styles.loadingText, { color: theme.colors.colorTextSecondary }]}
      >
        Loading knowledge base...
      </Text>
    </View>
  );

  /* ================= RENDER ================= */
  if (loading) {
    return <LoadingState />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.colorBgPage }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { color: theme.colors.colorTextPrimary }]}
        >
          Knowledge Center
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: theme.colors.colorTextSecondary },
          ]}
        >
          {allItems.length} resources available
        </Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <FlatList
          data={
            [
              "ALL",
              "FAQ",
              "NGO",
              "HOSPITAL",
              "PALLIATIVE",
              "DAYCARE",
              "CAREGIVER",
              "PRODUCT",
              "PSYCHIATRIC",
              "ORGAN_DONATION",
              "COUNSELLING",
            ] as FilterType[]
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => <FilterButton filterType={item} />}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RenderItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <Text
              style={[
                styles.listHeader,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              Showing {filteredItems.length} of {allItems.length} items
            </Text>
          }
        />
      )}
    </View>
  );
}

/* ================= PROFESSIONAL STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },

  /* Filter */
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* Loading State */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 40,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  /* List */
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  listHeader: {
    fontSize: 12,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  separator: {
    height: 16,
  },
});
