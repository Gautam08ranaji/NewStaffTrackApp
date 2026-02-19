import BodyLayout from "@/components/layout/BodyLayout";
import { getElderUserMemberList } from "@/features/fro/complaints/ElderMemberList";
import { getInteractionActivityHistory } from "@/features/fro/complaints/getInteractionActivityHistory";
import { getMedicationDetails } from "@/features/fro/complaints/medicalDetails";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const { width, height } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

interface FamilyMember {
  id: number;
  name: string;
  relatedTo: string;
  relatedToId: number;
  relatedToName: string;
  relationshipName: string;
  gender: string;
  profilePhoto: string | null;
  state: string;
  city: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  additionalInfo: string | null;
  phoneNumber: string;
  createdDate: string;
}

interface MedicalDetail {
  id: string;
  medicalType: string;
  medicalSubType: string;
  medicineDetails: string;
  allergies: string;
  additionalNotes: string;
  createdDate: string;
  relatedToId: number;
}

interface ActivityItem {
  activityId: number;
  activityTime: string;
  activityInteractionId: number;
  activityActionName: string;
  activityDescription: string;
  activityStatus: string;
  activityById: string;
  activityByName: string;
  activityRelatedTo: string;
  activityRelatedToId: number;
  activityRelatedToName: string;
}

const getRelationshipColors = (relationship: string, theme: any) => {
  const colors = {
    Daughter: {
      bg: theme.colors.colorError100,
      text: theme.colors.colorError600,
      icon: theme.colors.colorError400,
    },
    Son: {
      bg: theme.colors.colorPrimary50,
      text: theme.colors.colorPrimary700,
      icon: theme.colors.colorPrimary400,
    },
    Spouse: {
      bg: theme.colors.colorBgAlt,
      text: theme.colors.colorTextPrimary,
      icon: theme.colors.colorTextSecondary,
    },
    Father: {
      bg: theme.colors.colorSuccess100,
      text: theme.colors.colorSuccess600,
      icon: theme.colors.colorSuccess400,
    },
    Mother: {
      bg: theme.colors.colorError100,
      text: theme.colors.colorError600,
      icon: theme.colors.colorError400,
    },
    Brother: {
      bg: theme.colors.colorWarning100,
      text: theme.colors.colorWarning600,
      icon: theme.colors.colorWarning400,
    },
    Sister: {
      bg: theme.colors.colorWarning100,
      text: theme.colors.colorWarning600,
      icon: theme.colors.colorWarning400,
    },
    Grandson: {
      bg: theme.colors.colorPrimary50,
      text: theme.colors.colorPrimary700,
      icon: theme.colors.colorPrimary400,
    },
    Granddaughter: {
      bg: theme.colors.colorError100,
      text: theme.colors.colorError600,
      icon: theme.colors.colorError400,
    },
    Caretaker: {
      bg: theme.colors.colorPrimary50,
      text: theme.colors.colorPrimary700,
      icon: theme.colors.colorPrimary400,
    },
    Guardian: {
      bg: theme.colors.colorSuccess100,
      text: theme.colors.colorSuccess600,
      icon: theme.colors.colorSuccess400,
    },
    default: {
      bg: theme.colors.colorBgAlt,
      text: theme.colors.colorTextSecondary,
      icon: theme.colors.colorTextTertiary,
    },
  };
  return colors[relationship as keyof typeof colors] || colors.default;
};

export default function CustomerDetailScreen() {
  const params = useLocalSearchParams();
  const contactId = params?.ContactId as string;
  const caseId = params?.caseId as string;
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [medicalDetails, setMedicalDetails] = useState<MedicalDetail[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState({
    family: false,
    medical: false,
    activity: false,
  });
  const authState = useAppSelector((state) => state.auth);

  const customer = {
    name: "Rahul Sharma",
    age: 72,
    gender: "Male",
    phone: "9876543210",
    emergency: "9123456780",
    address: "Delhi, India",
    id: "CUST-1023",
  };

  const tabs = [
    "Family Details",
    "Medical Details",
    "Activity History",
    "Documents",
  ];

  useEffect(() => {
    fetchMemberList();
    fetchMedicalDetails();
    if (caseId) fetchActivityHistory();
  }, [caseId]);

  const fetchActivityHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, activity: true }));
      const res = await getInteractionActivityHistory({
        relatedToId: String(caseId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
        pageNumber: 1,
        pageSize: 11,
      });
      if (res?.data?.activityHistory) {
        setActivityHistory(res.data.activityHistory);
      }
    } catch (error) {
      console.log("Activity history error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  };

  const fetchMemberList = async () => {
    try {
      setLoading((prev) => ({ ...prev, family: true }));
      const response = await getElderUserMemberList({
        relatedToId: "1",
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        pageNumber: 1,
        pageSize: 11,
      });
      if (response?.data?.elderUserMemberList)
        setFamilyMembers(response.data.elderUserMemberList);
    } catch (error) {
      console.log("Error fetching members:", error);
    } finally {
      setLoading((prev) => ({ ...prev, family: false }));
    }
  };

  const fetchMedicalDetails = async () => {
    try {
      setLoading((prev) => ({ ...prev, medical: true }));
      const response = await getMedicationDetails({
        relatedToId: "1",
        token: String(authState?.token),
        csrfToken: String(authState?.antiforgeryToken),
        pageNumber: 1,
        pageSize: 11,
      });
      if (response?.data?.medicalDetailList) {
        setMedicalDetails(response.data.medicalDetailList);
      }
    } catch (error) {
      console.log("Medication error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, medical: false }));
    }
  };

  const handleCall = (phoneNumber: string) =>
    Linking.openURL(`tel:${phoneNumber}`);
  const handleMessage = (phoneNumber: string) =>
    Linking.openURL(`sms:${phoneNumber}`);
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getMedicalTypeColor = (type: string) => {
    const t = theme.colors;
    const typeLower = type.toLowerCase();
    if (typeLower.includes("diabetes"))
      return { bg: t.colorPrimary50, icon: t.colorPrimary600 };
    if (typeLower.includes("thyroid"))
      return { bg: t.colorError100, icon: t.colorError600 };
    if (typeLower.includes("blood pressure"))
      return { bg: t.colorWarning100, icon: t.colorWarning600 };
    if (typeLower.includes("heart"))
      return { bg: t.colorError100, icon: t.colorError600 };
    return { bg: t.colorBgAlt, icon: t.colorTextSecondary };
  };

  const getActivityStatus = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes("completed") || lower.includes("done"))
      return "completed";
    if (lower.includes("pending") || lower.includes("follow")) return "pending";
    if (lower.includes("upcoming") || lower.includes("scheduled"))
      return "upcoming";
    return "info";
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getActivityTitle = (item: ActivityItem) => {
    const desc = item.activityDescription;
    if (desc.includes("note added:")) {
      const match = desc.match(/note added: "([^"]+)"/);
      return match ? match[1] : "Note added";
    }
    if (desc.includes("follow-up")) return "Follow-up scheduled";
    return item.activityActionName === "INSERT"
      ? "Activity recorded"
      : "Activity updated";
  };

  const renderFamilyMember = ({
    item,
    index,
  }: {
    item: FamilyMember;
    index: number;
  }) => {
    const colors = getRelationshipColors(item.relationshipName, theme);
    const t = theme.colors;
    return (
      <View
        style={[
          styles.memberCard,
          {
            marginTop: index === 0 ? 0 : 10,
            backgroundColor: t.colorBgPage,
            shadowColor: t.colorShadow,
            borderWidth: 1,
            borderColor: t.border,
          },
        ]}
      >
        <View style={styles.memberCardHeader}>
          <View
            style={[styles.relationshipBadge, { backgroundColor: colors.bg }]}
          >
            <Text style={[styles.relationshipText, { color: colors.text }]}>
              {item.relationshipName}
            </Text>
          </View>
        </View>

        <View style={styles.memberInfoRow}>
          <View style={[styles.memberAvatar, { backgroundColor: colors.bg }]}>
            {item.profilePhoto ? (
              <Text style={[styles.avatarInitials, { color: colors.text }]}>
                {getInitials(item.name)}
              </Text>
            ) : (
              <RemixIcon
                name={item.gender === "Male" ? "user-3-fill" : "user-3-line"}
                size={22}
                color={colors.icon}
              />
            )}
          </View>
          <View style={styles.memberMainInfo}>
            <Text style={[styles.memberName, { color: t.colorTextPrimary }]}>
              {item.name}
            </Text>
            <View style={styles.memberMetaRow}>
              <View
                style={[styles.genderChip, { backgroundColor: t.colorBgAlt }]}
              >
                <RemixIcon
                  name="user-3-line"
                  size={12}
                  color={
                    item.gender === "Male"
                      ? t.colorPrimary600
                      : t.colorAccent500
                  }
                />
                <Text
                  style={[styles.genderText, { color: t.colorTextTertiary }]}
                >
                  {item.gender}
                </Text>
              </View>
              <Text
                style={[styles.memberSince, { color: t.colorTextTertiary }]}
              >
                {new Date(item.createdDate).getFullYear()}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.contactRow, { backgroundColor: t.colorBgAlt }]}>
          <View
            style={[styles.contactIconSmall, { backgroundColor: colors.bg }]}
          >
            <RemixIcon name="phone-line" size={14} color={colors.text} />
          </View>
          <Text
            style={[styles.contactPhone, { color: t.colorTextPrimary }]}
            numberOfLines={1}
          >
            {item.phoneNumber}
          </Text>
          <View style={styles.actionButtonsSmall}>
            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: colors.bg }]}
              onPress={() => handleCall(item.phoneNumber)}
            >
              <RemixIcon name="phone-fill" size={12} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: colors.bg }]}
              onPress={() => handleMessage(item.phoneNumber)}
            >
              <RemixIcon name="chat-1-fill" size={12} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addressRow}>
          <RemixIcon
            name="map-pin-line"
            size={12}
            color={t.colorTextTertiary}
          />
          <Text
            style={[styles.addressTextSmall, { color: t.colorTextSecondary }]}
            numberOfLines={1}
          >
            {[item.city, item.state].filter(Boolean).join(", ")} -{" "}
            {item.pincode}
          </Text>
        </View>
      </View>
    );
  };

  const renderMedicalItem = ({ item }: { item: MedicalDetail }) => {
    const t = theme.colors;
    const colors = getMedicalTypeColor(item.medicalType);
    return (
      <View
        style={[
          styles.medicalCard,
          { backgroundColor: t.colorBgSurface, borderColor: t.border },
        ]}
      >
        <View
          style={[styles.medicalCardHeader, { backgroundColor: colors.bg }]}
        >
          <View style={styles.medicalTypeContainer}>
            <RemixIcon name="heart-pulse-line" size={18} color={colors.icon} />
            <Text style={[styles.medicalType, { color: colors.icon }]}>
              {item.medicalType}
            </Text>
          </View>
          <Text style={[styles.medicalDate, { color: t.colorTextTertiary }]}>
            {new Date(item.createdDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.medicalDetails}>
          <View style={styles.medicalDetailRow}>
            <Text
              style={[
                styles.medicalDetailLabel,
                { color: t.colorTextTertiary },
              ]}
            >
              Condition
            </Text>
            <Text
              style={[styles.medicalDetailValue, { color: t.colorTextPrimary }]}
            >
              {item.medicalSubType}
            </Text>
          </View>
          {item.medicineDetails && (
            <View style={styles.medicalDetailRow}>
              <Text
                style={[
                  styles.medicalDetailLabel,
                  { color: t.colorTextTertiary },
                ]}
              >
                Medication
              </Text>
              <Text
                style={[
                  styles.medicalDetailValue,
                  { color: t.colorTextPrimary },
                ]}
              >
                {item.medicineDetails}
              </Text>
            </View>
          )}
          {item.allergies && (
            <View style={styles.medicalDetailRow}>
              <Text
                style={[
                  styles.medicalDetailLabel,
                  { color: t.colorTextTertiary },
                ]}
              >
                Allergies
              </Text>
              <Text
                style={[
                  styles.medicalDetailValue,
                  { color: t.colorTextPrimary },
                ]}
              >
                {item.allergies}
              </Text>
            </View>
          )}
          {item.additionalNotes && (
            <View style={styles.medicalDetailRow}>
              <Text
                style={[
                  styles.medicalDetailLabel,
                  { color: t.colorTextTertiary },
                ]}
              >
                Notes
              </Text>
              <Text
                style={[
                  styles.medicalDetailValue,
                  { color: t.colorTextPrimary },
                ]}
              >
                {item.additionalNotes}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderActivityItem = ({
    item,
    index,
  }: {
    item: ActivityItem;
    index: number;
  }) => {
    const t = theme.colors;
    const status = getActivityStatus(item.activityDescription);

    return (
      <View
        style={[styles.timelineCard, { backgroundColor: t.colorBgSurface }]}
      >
        <View style={styles.timelineRow}>
          <View style={styles.timelineLeft}>
            <View
              style={[
                styles.timelineDot,
                status === "completed" && {
                  backgroundColor: t.colorSuccess600,
                },
                status === "pending" && { backgroundColor: t.colorWarning600 },
                status === "upcoming" && { backgroundColor: t.colorPrimary600 },
                status === "info" && { backgroundColor: t.colorTextSecondary },
              ]}
            />
            {index < activityHistory.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  { backgroundColor: t.colorBorder },
                ]}
              />
            )}
          </View>
          <View style={styles.timelineContent}>
            <View style={styles.timelineHeader}>
              <Text
                style={[styles.timelineTitle, { color: t.colorTextPrimary }]}
              >
                {getActivityTitle(item)}
              </Text>
              <View
                style={[
                  styles.statusPill,
                  status === "completed" && {
                    backgroundColor: t.colorSuccess100,
                  },
                  status === "pending" && {
                    backgroundColor: t.colorWarning100,
                  },
                  status === "upcoming" && {
                    backgroundColor: t.colorPrimary50,
                  },
                  status === "info" && { backgroundColor: t.colorBgAlt },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    status === "completed" && { color: t.colorSuccess600 },
                    status === "pending" && { color: t.colorWarning600 },
                    status === "upcoming" && { color: t.colorPrimary600 },
                    status === "info" && { color: t.colorTextSecondary },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.activityDescription,
                { color: t.colorTextSecondary },
              ]}
              numberOfLines={2}
            >
              {item.activityDescription.replace(/^PUBLIC note added: /, "")}
            </Text>
            <View style={styles.timelineMeta}>
              <RemixIcon
                name="calendar-line"
                size={14}
                color={t.colorTextSecondary}
              />
              <Text
                style={[styles.timelineDate, { color: t.colorTextSecondary }]}
              >
                {formatActivityDate(item.activityTime)}
              </Text>
              <RemixIcon
                name="user-line"
                size={14}
                color={t.colorTextSecondary}
                style={styles.activityUserIcon}
              />
              <Text
                style={[styles.activityUser, { color: t.colorTextSecondary }]}
              >
                {item.activityByName}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    const t = theme.colors;
    switch (activeTab) {
      case 0:
        return (
          <View style={styles.tabContent}>
            {loading.family ? (
              <View style={styles.loadingContainer}>
                <View
                  style={[
                    styles.loadingCard,
                    { backgroundColor: t.colorBgSurface },
                  ]}
                >
                  <RemixIcon
                    name="loader-4-line"
                    size={40}
                    color={t.colorPrimary600}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: t.colorTextSecondary },
                    ]}
                  >
                    Loading family members...
                  </Text>
                </View>
              </View>
            ) : familyMembers.length > 0 ? (
              <View>
                <View style={styles.familySummary}>
                  <View
                    style={[
                      styles.summaryCard,
                      { backgroundColor: t.colorPrimary50 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.summaryNumber,
                        { color: t.colorPrimary600 },
                      ]}
                    >
                      {familyMembers.length}
                    </Text>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: t.colorTextSecondary },
                      ]}
                    >
                      Family Members
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.summaryCard,
                      { backgroundColor: t.colorWarning100 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.summaryNumber,
                        { color: t.colorWarning600 },
                      ]}
                    >
                      {
                        familyMembers.filter((m) =>
                          ["Daughter", "Son"].includes(m.relationshipName),
                        ).length
                      }
                    </Text>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: t.colorWarning600 },
                      ]}
                    >
                      Children
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={familyMembers}
                  renderItem={renderFamilyMember}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: t.colorBgSurface },
                  ]}
                >
                  <RemixIcon
                    name="group-line"
                    size={60}
                    color={t.colorTextSecondary}
                  />
                  <Text
                    style={[styles.emptyTitle, { color: t.colorTextPrimary }]}
                  >
                    No family members found
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: t.colorTextSecondary },
                    ]}
                  >
                    Add family members to keep track of your loved ones
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      { backgroundColor: t.colorPrimary600 },
                    ]}
                  >
                    <RemixIcon
                      name="add-line"
                      size={20}
                      color={t.colorTextInverse}
                    />
                    <Text
                      style={[
                        styles.addButtonText,
                        { color: t.colorTextInverse },
                      ]}
                    >
                      Add Family Member
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );

      case 1:
        return (
          <View style={styles.medicalContainer}>
            {loading.medical ? (
              <View style={styles.loadingContainer}>
                <View
                  style={[
                    styles.loadingCard,
                    { backgroundColor: t.colorBgSurface },
                  ]}
                >
                  <RemixIcon
                    name="loader-4-line"
                    size={40}
                    color={t.colorPrimary600}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: t.colorTextSecondary },
                    ]}
                  >
                    Loading medical details...
                  </Text>
                </View>
              </View>
            ) : medicalDetails.length > 0 ? (
              <FlatList
                data={medicalDetails}
                renderItem={renderMedicalItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.medicalList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: t.colorBgSurface },
                  ]}
                >
                  <RemixIcon
                    name="stethoscope-line"
                    size={60}
                    color={t.colorTextSecondary}
                  />
                  <Text
                    style={[styles.emptyTitle, { color: t.colorTextPrimary }]}
                  >
                    No medical records found
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: t.colorTextSecondary },
                    ]}
                  >
                    Add medical conditions and medications
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      { backgroundColor: t.colorPrimary600 },
                    ]}
                  >
                    <RemixIcon
                      name="add-line"
                      size={20}
                      color={t.colorTextInverse}
                    />
                    <Text
                      style={[
                        styles.addButtonText,
                        { color: t.colorTextInverse },
                      ]}
                    >
                      Add Medical Record
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.activityContainer}>
            {loading.activity ? (
              <View style={styles.loadingContainer}>
                <View
                  style={[
                    styles.loadingCard,
                    { backgroundColor: t.colorBgSurface },
                  ]}
                >
                  <RemixIcon
                    name="loader-4-line"
                    size={40}
                    color={t.colorPrimary600}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: t.colorTextSecondary },
                    ]}
                  >
                    Loading activity history...
                  </Text>
                </View>
              </View>
            ) : activityHistory.length > 0 ? (
              <FlatList
                data={activityHistory}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.activityId.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.activityList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: t.colorBgSurface },
                  ]}
                >
                  <RemixIcon
                    name="history-line"
                    size={60}
                    color={t.colorTextSecondary}
                  />
                  <Text
                    style={[styles.emptyTitle, { color: t.colorTextPrimary }]}
                  >
                    No activity history found
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: t.colorTextSecondary },
                    ]}
                  >
                    Activities and interactions will appear here
                  </Text>
                </View>
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.documentsContainer}>
            {[
              {
                name: "Medical History.pdf",
                size: "2.4 MB",
                date: "12 Feb 2026",
                icon: "file-pdf-line",
                color: t.colorError600,
              },
              {
                name: "Prescription_Feb2026.jpg",
                size: "1.1 MB",
                date: "15 Feb 2026",
                icon: "file-image-line",
                color: t.colorPrimary600,
              },
            ].map((doc, i) => (
              <View
                key={i}
                style={[
                  styles.documentCard,
                  { backgroundColor: t.colorBgSurface },
                ]}
              >
                <View
                  style={[
                    styles.documentIcon,
                    { backgroundColor: t.colorBgAlt },
                  ]}
                >
                  <RemixIcon
                    name={doc.icon as any}
                    size={32}
                    color={doc.color}
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text
                    style={[styles.documentName, { color: t.colorTextPrimary }]}
                  >
                    {doc.name}
                  </Text>
                  <Text
                    style={[
                      styles.documentSize,
                      { color: t.colorTextSecondary },
                    ]}
                  >
                    {doc.size} • Uploaded {doc.date}
                  </Text>
                </View>
                <TouchableOpacity style={styles.documentAction}>
                  <RemixIcon
                    name="download-line"
                    size={20}
                    color={t.colorPrimary600}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                {
                  borderColor: t.colorPrimary600,
                  backgroundColor: t.colorPrimary50,
                },
              ]}
            >
              <RemixIcon
                name="upload-2-line"
                size={20}
                color={t.colorPrimary600}
              />
              <Text
                style={[styles.uploadButtonText, { color: t.colorPrimary600 }]}
              >
                Upload New Document
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <BodyLayout type="screen" screenName="Client Details">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.colors.colorPrimary50,
              shadowColor: theme.colors.colorShadow,
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatarWrapper}>
              <View
                style={[
                  styles.profileAvatar,
                  { backgroundColor: theme.colors.colorPrimary100 },
                ]}
              >
                <RemixIcon
                  name="user-3-fill"
                  size={36}
                  color={theme.colors.colorPrimary600}
                />
              </View>
              <View
                style={[
                  styles.profileBadge,
                  { backgroundColor: theme.colors.colorPrimary600 },
                ]}
              >
                <RemixIcon
                  name="verified-badge-fill"
                  size={16}
                  color={theme.colors.colorTextInverse}
                />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {customer.name}
              </Text>
              <View style={styles.profileTags}>
                <View
                  style={[
                    styles.profileTag,
                    { backgroundColor: theme.colors.colorPrimary100 },
                  ]}
                >
                  <RemixIcon
                    name="cake-line"
                    size={14}
                    color={theme.colors.colorPrimary600}
                  />
                  <Text
                    style={[
                      styles.profileTagText,
                      { color: theme.colors.colorPrimary600 },
                    ]}
                  >
                    {customer.age} yrs
                  </Text>
                </View>
                <View
                  style={[
                    styles.profileTag,
                    { backgroundColor: theme.colors.colorPrimary100 },
                  ]}
                >
                  <RemixIcon
                    name="user-3-line"
                    size={14}
                    color={theme.colors.colorPrimary600}
                  />
                  <Text
                    style={[
                      styles.profileTagText,
                      { color: theme.colors.colorPrimary600 },
                    ]}
                  >
                    {customer.gender}
                  </Text>
                </View>
              </View>
              <View style={styles.profileContact}>
                <View style={styles.profileContactItem}>
                  <RemixIcon
                    name="phone-line"
                    size={14}
                    color={theme.colors.colorTextSecondary}
                  />
                  <Text
                    style={[
                      styles.profileContactText,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {customer.phone}
                  </Text>
                </View>
                <View style={styles.profileContactItem}>
                  <RemixIcon
                    name="map-pin-line"
                    size={14}
                    color={theme.colors.colorTextSecondary}
                  />
                  <Text
                    style={[
                      styles.profileContactText,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {customer.address}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsWrapper}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveTab(index)}
              style={[
                styles.tab,
                {
                  borderColor: theme.colors.colorBorder,
                  backgroundColor:
                    activeTab === index
                      ? theme.colors.colorPrimary600
                      : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === index
                        ? theme.colors.colorTextInverse
                        : theme.colors.colorTextSecondary,
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.tabContentContainer}>{renderTabContent()}</View>
      </ScrollView>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: verticalScale(30) },
  profileCard: {
    marginTop: verticalScale(14),
    marginHorizontal: moderateScale(16),
    padding: moderateScale(20),
    borderRadius: 24,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  profileHeader: { flexDirection: "row", alignItems: "center" },
  profileAvatarWrapper: { position: "relative", marginRight: 16 },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  profileBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  profileTags: { flexDirection: "row", marginBottom: 8 },
  profileTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  profileTagText: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  profileContact: { gap: 4 },
  profileContactItem: { flexDirection: "row", alignItems: "center" },
  profileContactText: { fontSize: 13, marginLeft: 6 },
  tabsWrapper: { marginTop: 20 },
  tabsContent: { paddingHorizontal: moderateScale(16), gap: 8 },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  tabContentContainer: { paddingHorizontal: moderateScale(16), marginTop: 20 },
  tabContent: { flex: 1 },
  familySummary: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    padding: moderateScale(16),
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    elevation: 2,
  },
  summaryLabel: { fontSize: 13, fontWeight: "500" },

  contactSection: { borderRadius: 16, padding: 12, marginBottom: 16 },
  contactItem: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactDetails: { flex: 1 },
  contactLabel: { fontSize: 11, marginBottom: 2 },
  contactValue: { fontSize: 15, fontWeight: "600" },
  actionButtons: { flexDirection: "row", gap: 8 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  addressSection: { borderRadius: 16, padding: 12 },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressLabel: { fontSize: 12, fontWeight: "600", marginLeft: 6 },
  addressText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  locationTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationTagText: { fontSize: 12, fontWeight: "500" },
  medicalContainer: { gap: 12 },
  medicalList: { gap: 12 },
  medicalCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  medicalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(12),
  },
  medicalTypeContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  medicalType: { fontSize: 14, fontWeight: "600" },
  medicalDate: { fontSize: 11 },
  medicalDetails: { padding: moderateScale(12), gap: 8 },
  medicalDetailRow: { flexDirection: "row", alignItems: "flex-start" },
  medicalDetailLabel: { fontSize: 12, width: 80 },
  medicalDetailValue: { fontSize: 13, fontWeight: "500", flex: 1 },
  activityContainer: { gap: 12 },
  activityList: { gap: 12 },
  timelineCard: { padding: moderateScale(16), borderRadius: 16 },
  timelineRow: { flexDirection: "row" },
  timelineLeft: { alignItems: "center", marginRight: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  timelineTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: "600" },
  timelineMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  timelineDate: { fontSize: 13, marginLeft: 6, marginRight: 12 },
  activityDescription: { fontSize: 13, marginTop: 4, marginBottom: 4 },
  activityUserIcon: { marginLeft: 8 },
  activityUser: { fontSize: 13, marginLeft: 6 },
  documentsContainer: { gap: 12 },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(16),
    borderRadius: 16,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  documentSize: { fontSize: 12 },
  documentAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 8,
    gap: 8,
  },
  uploadButtonText: { fontSize: 15, fontWeight: "600" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyCard: {
    alignItems: "center",
    padding: moderateScale(32),
    borderRadius: 24,
    width: "100%",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addButtonText: { fontSize: 15, fontWeight: "600" },
  loadingContainer: { paddingVertical: 40 },
  loadingCard: {
    alignItems: "center",
    padding: moderateScale(32),
    borderRadius: 24,
  },
  loadingText: { fontSize: 15, marginTop: 12 },
  // Updated styles for smaller member cards
  memberCard: {
    borderRadius: 16,
    padding: moderateScale(12),
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  memberCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  relationshipBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  relationshipText: { fontSize: 11, fontWeight: "600" },
  primaryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  primaryText: { fontSize: 10, fontWeight: "500" },
  memberInfoRow: { flexDirection: "row", marginBottom: 10 },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitials: { fontSize: 16, fontWeight: "600" },
  memberName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  memberMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  genderChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  genderText: { fontSize: 11, marginLeft: 4 },
  memberSince: { fontSize: 11 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  contactIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  contactPhone: { fontSize: 13, fontWeight: "500", flex: 1 },
  actionButtonsSmall: { flexDirection: "row", gap: 6 },
  actionButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  addressTextSmall: { fontSize: 12, flex: 1 },
  memberMainInfo: { flex: 1, justifyContent: "center" },
});
