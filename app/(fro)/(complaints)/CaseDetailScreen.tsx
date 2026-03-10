import BodyLayout from "@/components/layout/BodyLayout";
import { getCommonDocumentList } from "@/features/fro/complaints/getCommonDocumentList";
import { getNotesRecordList } from "@/features/fro/complaints/noteListApi";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import RemixIcon from "react-native-remix-icon";

interface Note {
  id: string;
  noteDesc: string;
  createdDate: string;
  createdBy: string;
  noteType: string;
  nextFollowUpDate?: string;
  relatedToName: string;
}

export default function CaseDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const item = params.item ? JSON.parse(params.item as string) : null;
  const authState = useAppSelector((state) => state.auth);

  const { theme } = useTheme();
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  // Extract data with proper field names based on your actual data structure
  const ticketNo = item?.transactionNumber;
  const elderName = item?.name || item?.contactName;
  const age = item?.age;
  const gender = item?.gender;
  const ContactId = item?.contactId;

  const phone = item?.mobileNo;
  const emergencyPhone = item?.alternateNo;
  const category = item?.categoryName;
  const subCategory = item?.subCategoryName;
  const details = item?.taskDescription || item?.caseDescription;

  const address = item?.address;
  const state = item?.stateName;
  const district = item?.districtName;
  const priority = item?.priority;
  const Taskstatus = item?.statusName;
  const subStatus = item?.subStatusName;
  const source = item?.source;

  const caseId = item?.id;
  const statusId = item?.statusId;

  // Check if task is closed
  const isTaskClosed = Taskstatus === "Closed" || statusId === 4;

  // Extract coordinates with fallback (using Mumbai as default)
  const lat = item?.latitude || 19.076;
  const lng = item?.longitude || 72.8777;
  const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
  const longitude = typeof lng === "string" ? parseFloat(lng) : lng;

  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Status steps mapping based on statusId
  const getCurrentStepIndex = () => {
    const statusId = item?.statusId;
    if (statusId === 1) return 0; // Open
    if (statusId === 2) return 1; // In-Progress
    if (statusId === 4) return 2; // Closed
    return 0;
  };

  const steps = [
    { title: t("caseDetail.steps.open") || "Open", icon: "file-list-line" },
    { title: t("caseDetail.steps.inProgress") || "In-Progress", icon: "loader-3-line" },
    { title: t("caseDetail.steps.closed") || "Closed", icon: "checkbox-circle-line" },
  ];

  const completedSteps = getCurrentStepIndex();

  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: completedSteps,
      duration: 4800,
      delay: 2000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [completedSteps]);

  useFocusEffect(
    useCallback(() => {
      if (caseId) {
        loadDocuments();
        loadNotes();
      }
    }, [caseId]),
  );

  const loadNotes = async () => {
    if (!caseId) return;
    
    try {
      setLoadingNotes(true);
      const res = await getNotesRecordList({
        auth: {
          bearerToken: String(authState.token),
          antiForgeryToken: String(authState.antiforgeryToken),
        },
        relatedToId: String(caseId),
      });

      if (res?.data?.notesList && Array.isArray(res.data.notesList)) {
        setNotes(res.data.notesList);
      } else {
        setNotes([]);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("common.somethingWentWrong") || "Something went wrong. Please try again.";

      if (status === 401) {
        Alert.alert(
          t("common.sessionExpired") || "Session Expired",
          t("common.pleaseLoginAgain") || "Your session has expired. Please login again.",
          [
            {
              text: t("common.ok") || "OK",
              onPress: () => router.replace("/(onboarding)/login"),
            },
          ],
        );
        return;
      }

      Alert.alert(t("common.error") || "Error", message);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadDocuments = async (pageNumber = 1) => {
    if (!caseId) return;

    try {
      const res = await getCommonDocumentList({
        pageNumber,
        pageSize: 10,
        relatedToId: Number(caseId),
        csrfToken: String(authState?.antiforgeryToken),
        authToken: String(authState?.token),
      });

      if (res?.list) {
        setDocuments(res.list);
      }
    } catch (error) {
      console.error("Failed to load documents", error);
    }
  };

  // Helper function to get appropriate icon based on document type
  const getFileIcon = (documentType: string) => {
    if (!documentType) return "file-line";

    const type = documentType.toLowerCase();

    switch (type) {
      case "pdf":
        return "file-pdf-line";
      case "word":
      case "doc":
      case "docx":
        return "file-word-line";
      case "excel":
      case "xls":
      case "xlsx":
        return "file-excel-line";
      case "powerpoint":
      case "ppt":
      case "pptx":
        return "file-ppt-line";
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "file-image-line";
      case "text":
      case "txt":
        return "file-text-line";
      case "video":
      case "mp4":
      case "avi":
      case "mov":
        return "file-video-line";
      case "audio":
      case "mp3":
      case "wav":
        return "file-music-line";
      case "zip":
      case "rar":
      case "7z":
        return "file-zip-line";
      default:
        return "file-line";
    }
  };

  // Get file color based on document type using theme
  const getFileColor = (documentType: string) => {
    if (!documentType) return theme.colors.colorTextTertiary;

    const type = documentType.toLowerCase();

    switch (type) {
      case "pdf":
        return theme.colors.colorError600;
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
        return theme.colors.colorSuccess600;
      case "word":
      case "doc":
      case "docx":
        return theme.colors.colorPrimary600;
      case "excel":
      case "xls":
      case "xlsx":
        return theme.colors.colorSuccess600;
      case "powerpoint":
      case "ppt":
      case "pptx":
        return theme.colors.colorWarning600;
      default:
        return theme.colors.colorTextTertiary;
    }
  };

  // Get background color based on document type using theme
  const getFileBgColor = (documentType: string) => {
    if (!documentType) return theme.colors.colorBgAlt;

    const type = documentType.toLowerCase();

    switch (type) {
      case "pdf":
        return theme.colors.colorError100;
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
        return theme.colors.colorSuccess100;
      case "word":
      case "doc":
      case "docx":
        return theme.colors.colorPrimary50;
      case "excel":
      case "xls":
      case "xlsx":
        return theme.colors.colorSuccess100;
      case "powerpoint":
      case "ppt":
      case "pptx":
        return theme.colors.colorWarning100;
      default:
        return theme.colors.colorBgAlt;
    }
  };

  // Handle attachment press based on document type
  const handleAttachmentPress = (doc: any, index: number) => {
    const fileName = doc.fileName || doc.name || "";
    const documentType = doc.documentType || "";
    const type = documentType.toLowerCase();
    const hasFileData = doc.fileData && typeof doc.fileData === "string";
    const hasFileUrl = doc.fileUrl && typeof doc.fileUrl === "string";

    if (type === "pdf") {
      router.push({
        pathname: "/(fro)/(complaints)/DocumentListScreen",
        params: {
          title: fileName,
          fileUrl: hasFileData
            ? `data:application/pdf;base64,${doc.fileData}`
            : hasFileUrl
              ? doc.fileUrl
              : "",
          isPDF: "true",
          documentType: "pdf",
        },
      });
    } else if (type === "image" || type === "jpg" || type === "jpeg" || type === "png") {
      router.push({
        pathname: "/(fro)/(complaints)/DocumentListScreen",
        params: {
          caseId: caseId,
          item: JSON.stringify(item),
          selectedIndex: index,
          documentType: "image",
        },
      });
    } else {
      router.push({
        pathname: "/(fro)/(complaints)/DocumentListScreen",
        params: {
          caseId: caseId,
          item: JSON.stringify(item),
          documentType: type,
        },
      });
    }
  };

  // Render individual attachment item
  const renderAttachmentItem = (
    doc: any,
    index: number,
    isLast: boolean,
    extraCount: number,
  ) => {
    const fileName = doc.fileName || doc.name || "";
    const documentType = doc.documentType || "";
    const type = documentType.toLowerCase();
    const hasFileData = doc.fileData && typeof doc.fileData === "string";
    const hasFileUrl = doc.fileUrl && typeof doc.fileUrl === "string";

    const isImage = type === "image" || type === "jpg" || type === "jpeg" || type === "png";
    const isPDF = type === "pdf";

    const fileColor = getFileColor(documentType);
    const bgColor = getFileBgColor(documentType);
    const iconName = isPDF
      ? "file-pdf-line"
      : isImage
        ? "file-image-line"
        : getFileIcon(documentType);

    return (
      <TouchableOpacity
        key={doc.id || index}
        style={styles.attachmentThumb}
        onPress={() => handleAttachmentPress(doc, index)}
      >
        {isImage && (hasFileData || hasFileUrl) ? (
          <Image
            source={{
              uri: hasFileData
                ? `data:image/jpeg;base64,${doc.fileData}`
                : doc.fileUrl,
            }}
            style={styles.attachmentImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.fileIconContainer, { backgroundColor: bgColor, borderColor: theme.colors.border }]}
          >
            <RemixIcon name={iconName as any} size={24} color={fileColor} />
            <Text
              style={[theme.typography.fontBodySmall, styles.fileNameText, { color: fileColor }]}
              numberOfLines={1}
            >
              {fileName.length > 10
                ? fileName.substring(0, 8) + "..."
                : fileName}
            </Text>
          </View>
        )}

        {isLast && (
          <View style={[styles.extraOverlay, { backgroundColor: theme.colors.colorOverlay }]}>
            <Text style={[theme.typography.fontBody, styles.extraText, { color: theme.colors.colorTextInverse }]}>
              +{extraCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAttachments = () => {
    if (!documents?.length) {
      return (
        <View style={[styles.attachmentBox, { borderColor: theme.colors.border }]}>
          <RemixIcon name="image-2-line" size={24} color={theme.colors.colorTextTertiary} />
          <Text style={[theme.typography.fontBodySmall, styles.attachmentText, { color: theme.colors.colorTextTertiary }]}>
            {t("caseDetail.noAttachments") || "No attachments yet"}
          </Text>
        </View>
      );
    }

    const firstFour = documents.slice(0, 4);
    const extraCount = documents.length - 4;

    return (
      <View style={styles.attachmentRow}>
        {firstFour.map((doc, index) => {
          const isLast = index === 3 && extraCount > 0;
          return renderAttachmentItem(doc, index, isLast, extraCount);
        })}
      </View>
    );
  };

  // Render individual note item
  const renderNoteItem = (note: Note, index: number) => {
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString(t('common.locale') || "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        return dateString;
      }
    };

    const formatTime = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleTimeString(t('common.locale') || "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } catch (error) {
        return "";
      }
    };

    return (
      <TouchableOpacity
        key={note.id}
        style={[styles.noteItem, { 
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.colorBgAlt 
        }]}
        onPress={() => {
          router.push({
            pathname: "/(fro)/(complaints)/NoteHistory",
            params: {
              caseId: caseId,
              item: JSON.stringify(item),
            },
          });
        }}
      >
        <View style={styles.noteContent}>
          <View style={styles.noteHeader}>
            <RemixIcon
              name="sticky-note-line"
              size={16}
              color={theme.colors.colorPrimary600}
            />
            <Text
              style={[theme.typography.fontBodySmall, styles.noteType, { color: theme.colors.colorPrimary600 }]}
            >
              {note.noteType === "public" ? t("caseDetail.publicNote") || "Public Note" : t("caseDetail.privateNote") || "Private Note"}
            </Text>
            <Text style={[theme.typography.fontBodySmall, styles.noteDate, { color: theme.colors.colorTextTertiary }]}>
              {formatDate(note.createdDate)}
            </Text>
          </View>
          <Text
            style={[theme.typography.fontBody, styles.noteDesc, { color: theme.colors.colorTextPrimary }]}
            numberOfLines={2}
          >
            {note.noteDesc}
          </Text>
          <View style={styles.noteFooter}>
            <Text
              style={[
                theme.typography.fontBodySmall,
                styles.noteTime,
                { color: theme.colors.colorTextSecondary },
              ]}
            >
              {formatTime(note.createdDate)}
            </Text>
            {note.nextFollowUpDate && (
              <View style={[styles.followUpBadge, { backgroundColor: theme.colors.colorError100 }]}>
                <RemixIcon name="calendar-line" size={12} color={theme.colors.colorError600} />
                <Text style={[theme.typography.fontBodySmall, styles.followUpText, { color: theme.colors.colorError600 }]}>
                  {t("caseDetail.followUp") || "Follow-up"}: {formatDate(note.nextFollowUpDate)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNotes = () => {
    if (loadingNotes) {
      return (
        <View style={[styles.notesLoadingContainer, { borderColor: theme.colors.border }]}>
          <Text
            style={[
              theme.typography.fontBodySmall,
              styles.loadingText,
              { color: theme.colors.colorTextSecondary },
            ]}
          >
            {t("common.loading") || "Loading notes..."}
          </Text>
        </View>
      );
    }

    if (!notes?.length) {
      return (
        <TouchableOpacity
          style={[styles.noNotesContainer, { borderColor: theme.colors.border }]}
          onPress={() => {
            router.push({
              pathname: "/(fro)/(complaints)/NoteHistory",
              params: {
                caseId: caseId,
                item: JSON.stringify(item),
              },
            });
          }}
        >
          <RemixIcon name="sticky-note-line" size={24} color={theme.colors.colorTextTertiary} />
          <Text style={[theme.typography.fontBodySmall, styles.noNotesText, { color: theme.colors.colorTextTertiary }]}>
            {t("caseDetail.noNotes") || "No notes yet. Tap to add a note"}
          </Text>
        </TouchableOpacity>
      );
    }

    const firstTwo = notes.slice(0, 2);
    const extraCount = notes.length - 2;

    return (
      <View style={styles.notesContainer}>
        {firstTwo.map((note, index) => renderNoteItem(note, index))}
        {extraCount > 0 && (
          <TouchableOpacity
            style={styles.viewAllNotesBtn}
            onPress={() => {
              router.push({
                pathname: "/(fro)/(complaints)/NoteHistory",
                params: {
                  caseId: caseId,
                  item: JSON.stringify(item),
                },
              });
            }}
          >
            <Text style={[theme.typography.fontBody, styles.viewAllNotesText, { color: theme.colors.colorPrimary600 }]}>
              {t("caseDetail.viewAllNotes") || "View all"} {notes.length} {t("caseDetail.notes") || "notes"}
            </Text>
            <RemixIcon
              name="arrow-right-s-line"
              size={16}
              color={theme.colors.colorPrimary600}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Action buttons with theme colors
  const actionButtons = [
    {
      label: t("caseDetail.actions.updateStatus") || "Update Status",
      icon: "refresh-line",
      color: theme.colors.colorSuccess600,
      bgColor: theme.colors.colorSuccess100,
      onPress: () =>
        router.push({
          pathname: "/(fro)/(complaints)/updateCase",
          params: {
            item: JSON.stringify(item),
            caseId: item?.id,
          },
        }),
    },
    {
      label: t("caseDetail.actions.addAttachments") || "Add Attachments",
      icon: "attachment-line",
      color: theme.colors.colorPrimary600,
      bgColor: theme.colors.colorPrimary50,
      onPress: () =>
        router.push({
          pathname: "/(fro)/(complaints)/DocumentListScreen",
          params: {
            caseId: item?.id,
            item: JSON.stringify(item),
          },
        }),
    },
    {
      label: t("caseDetail.actions.addNote") || "Add Note",
      icon: "sticky-note-line",
      color: theme.colors.colorWarning600,
      bgColor: theme.colors.colorWarning100,
      onPress: () =>
        router.push({
          pathname: "/(fro)/(complaints)/NoteHistory",
          params: {
            caseId: item?.id,
            item: JSON.stringify(item),
          },
        }),
    },
    {
      label: t("caseDetail.actions.addVoice") || "Add Voice",
      icon: "mic-line",
      color: theme.colors.colorError600,
      bgColor: theme.colors.colorError100,
      onPress: () => {
        router.push("/(fro)/(complaints)/AddVoiceScreen")
      },
    },
  ];

  // Function to render action buttons in grid
  const renderActionButtons = () => {
    const rows = [];
    for (let i = 0; i < actionButtons.length; i += 3) {
      const rowButtons = actionButtons.slice(i, i + 3);
      rows.push(
        <View key={i} style={styles.actionRow}>
          {rowButtons.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: action.bgColor,
                  borderColor: action.color,
                },
              ]}
              onPress={action.onPress}
            >
              <RemixIcon
                name={action.icon as any}
                size={20}
                color={action.color}
              />
              <Text
                style={[theme.typography.fontBodySmall, styles.actionBtnText, { color: action.color }]}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>,
      );
    }
    return rows;
  };

  if (!item) {
    return (
      <BodyLayout type="screen" screenName={t("caseDetail.screenTitle") || "Task Details"}>
        <View style={styles.errorContainer}>
          <Text style={[theme.typography.fontBody, styles.errorText, { color: theme.colors.colorTextSecondary }]}>
            {t("caseDetail.noData") || "No task data available"}
          </Text>
        </View>
      </BodyLayout>
    );
  }

  return (
    <BodyLayout type="screen" screenName={`${t("caseDetail.screenTitle") || "Task Details"} - ${ticketNo || ''}`}>
      {/* ELDER DETAILS */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.colorPrimary50,
            borderWidth: 1,
            borderColor: theme.colors.colorPrimary200,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <RemixIcon
              name="user-heart-line"
              size={20}
              color={theme.colors.colorPrimary600}
            />
            <Text
              style={[
                theme.typography.fontH6,
                styles.cardTitle,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              {t("caseDetail.sellerDetails") || "Seller Details"}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.avatarBox,
              {
                backgroundColor: theme.colors.colorPrimary100,
                borderColor: theme.colors.colorPrimary300,
              },
            ]}
          >
            <RemixIcon
              name="user-3-fill"
              size={32}
              color={theme.colors.colorPrimary600}
            />
          </View>

          <View style={styles.elderInfo}>
            <View style={styles.keyValueRow}>
              <View style={styles.labelContainer}>
                <RemixIcon
                  name="user-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.labelKey,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("caseDetail.name") || "Name"}:
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.labelValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {elderName || '-'}
              </Text>
            </View>

            {age && (
              <View style={styles.keyValueRow}>
                <View style={styles.labelContainer}>
                  <RemixIcon
                    name="calendar-line"
                    size={14}
                    color={theme.colors.colorTextSecondary}
                  />
                  <Text
                    style={[
                      theme.typography.fontBodySmall,
                      styles.labelKey,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {t("caseDetail.age") || "Age"}:
                  </Text>
                </View>
                <Text
                  style={[
                    theme.typography.fontBody,
                    styles.labelValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {age}
                </Text>
              </View>
            )}

            {gender && (
              <View style={styles.keyValueRow}>
                <View style={styles.labelContainer}>
                  <RemixIcon
                    name="genderless-line"
                    size={14}
                    color={theme.colors.colorTextSecondary}
                  />
                  <Text
                    style={[
                      theme.typography.fontBodySmall,
                      styles.labelKey,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {t("caseDetail.gender") || "Gender"}:
                  </Text>
                </View>
                <Text
                  style={[
                    theme.typography.fontBody,
                    styles.labelValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {gender}
                </Text>
              </View>
            )}

            <View style={styles.keyValueRow}>
              <View style={styles.labelContainer}>
                <RemixIcon
                  name="phone-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.labelKey,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("caseDetail.phone") || "Phone"}:
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.labelValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {phone || '-'}
              </Text>
            </View>

            {emergencyPhone && (
              <View style={styles.keyValueRow}>
                <View style={styles.labelContainer}>
                  <RemixIcon
                    name="alert-line"
                    size={14}
                    color={theme.colors.colorTextSecondary}
                  />
                  <Text
                    style={[
                      theme.typography.fontBodySmall,
                      styles.labelKey,
                      { color: theme.colors.colorTextSecondary },
                    ]}
                  >
                    {t("caseDetail.emergency") || "Emergency"}:
                  </Text>
                </View>
                <Text
                  style={[
                    theme.typography.fontBody,
                    styles.labelValue,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {emergencyPhone}
                </Text>
              </View>
            )}

            <View style={styles.keyValueRow}>
              <View style={styles.labelContainer}>
                <RemixIcon
                  name="map-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.labelKey,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("caseDetail.address") || "Address"}:
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.labelValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {address || '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* COMPLAINT INFO */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.colorBgSurface },
          styles.cardShadow,
          { shadowColor: theme.colors.colorShadow },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <RemixIcon
              name="file-warning-line"
              size={20}
              color={theme.colors.colorPrimary600}
            />
            <Text
              style={[
                theme.typography.fontH6,
                styles.cardTitle,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              {t("caseDetail.complaintInfo") || "Complaint Information"}
            </Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <View style={styles.keyValueRow}>
            <View style={styles.labelContainer}>
              <RemixIcon
                name="folder-line"
                size={14}
                color={theme.colors.colorTextSecondary}
              />
              <Text
                style={[
                  theme.typography.fontBodySmall,
                  styles.labelKey,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {t("caseDetail.category") || "Category"}:
              </Text>
            </View>
            <View style={styles.valueContainer}>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.labelValue,
                  {
                    color: theme.colors.colorTextPrimary,
                  },
                ]}
              >
                {category || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.keyValueRow}>
            <View style={styles.labelContainer}>
              <RemixIcon
                name="file-text-line"
                size={14}
                color={theme.colors.colorTextSecondary}
              />
              <Text
                style={[
                  theme.typography.fontBodySmall,
                  styles.detailLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {t("caseDetail.details") || "Details"}:
              </Text>
            </View>
            <Text
              style={[
                theme.typography.fontBody,
                styles.detailText,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {details || '-'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.labelContainer}>
              <RemixIcon
                name="image-line"
                size={14}
                color={theme.colors.colorTextSecondary}
              />
              <Text
                style={[
                  theme.typography.fontBodySmall,
                  styles.detailLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {t("caseDetail.attachments") || "Attachments"}:
              </Text>
            </View>
            {renderAttachments()}
          </View>

          <View style={styles.detailItem}>
            <View style={styles.labelContainer}>
              <RemixIcon
                name="sticky-note-line"
                size={14}
                color={theme.colors.colorTextSecondary}
              />
              <Text
                style={[
                  theme.typography.fontBodySmall,
                  styles.detailLabel,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {t("caseDetail.notes") || "Notes"}:
              </Text>
            </View>
            {renderNotes()}
          </View>
        </View>
      </View>

      {!isTaskClosed && (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.colorBgSurface },
            styles.cardShadow,
            { shadowColor: theme.colors.colorShadow },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <RemixIcon
                name="flashlight-line"
                size={20}
                color={theme.colors.colorPrimary600}
              />
              <Text
                style={[
                  theme.typography.fontH6,
                  styles.cardTitle,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {t("caseDetail.quickActions") || "Quick Actions"}
              </Text>
            </View>
          </View>

          <View style={styles.actionsGrid}>{renderActionButtons()}</View>
        </View>
      )}

      {/* TIMELINE */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.colorBgSurface },
          styles.cardShadow,
          { shadowColor: theme.colors.colorShadow },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <RemixIcon
              name="time-line"
              size={20}
              color={theme.colors.colorPrimary600}
            />
            <Text
              style={[
                theme.typography.fontH6,
                styles.cardTitle,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              {t("caseDetail.timeline") || "Timeline"}
            </Text>
          </View>
        </View>

        <View style={styles.timelineContainer}>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            const lineProgress = animatedProgress.interpolate({
              inputRange: [index, index + 1],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            });

            const isActive = index <= completedSteps;

            return (
              <View key={index} style={styles.progressRow}>
                {/* DOT + LINE */}
                <View style={styles.progressLeft}>
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isActive
                          ? theme.colors.colorPrimary600
                          : theme.colors.border,
                        borderColor: theme.colors.colorBgSurface,
                      },
                    ]}
                  >
                    <RemixIcon
                      name={step.icon as any}
                      size={12}
                      color={theme.colors.colorTextInverse}
                    />
                  </Animated.View>

                  {!isLast && (
                    <View style={[styles.lineContainer, { backgroundColor: theme.colors.border }]}>
                      <Animated.View
                        style={[
                          styles.lineFill,
                          {
                            backgroundColor: theme.colors.colorPrimary600,
                            width: isActive ? "100%" : lineProgress,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* TEXT */}
                <View style={styles.progressContent}>
                  <Text
                    style={[
                      theme.typography.fontBody,
                      styles.progressTitle,
                      {
                        color: isActive
                          ? theme.colors.colorPrimary600
                          : theme.colors.colorTextSecondary,
                      },
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* CASE METADATA */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.colorBgSurface },
          styles.cardShadow,
          { shadowColor: theme.colors.colorShadow },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <RemixIcon
              name="database-line"
              size={20}
              color={theme.colors.colorPrimary600}
            />
            <Text
              style={[
                theme.typography.fontH6,
                styles.cardTitle,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              {t("caseDetail.taskMetadata") || "Task Metadata"}
            </Text>
          </View>
        </View>

        <View style={styles.metadataGrid}>
          {priority && (
            <View
              style={[
                styles.metadataItem,
                {
                  backgroundColor:
                    priority === "High"
                      ? theme.colors.colorError100
                      : priority === "Medium"
                        ? theme.colors.colorWarning100
                        : theme.colors.colorSuccess100,
                },
              ]}
            >
              <RemixIcon
                name="flag-line"
                size={16}
                color={
                  priority === "High"
                    ? theme.colors.colorError600
                    : priority === "Medium"
                      ? theme.colors.colorWarning600
                      : theme.colors.colorSuccess600
                }
              />
              <Text
                style={[
                  theme.typography.fontH6,
                  styles.metadataValue,
                  {
                    color:
                      priority === "High"
                        ? theme.colors.colorError600
                        : priority === "Medium"
                          ? theme.colors.colorWarning600
                          : theme.colors.colorSuccess600,
                  },
                ]}
              >
                {priority}
              </Text>
              <Text style={[theme.typography.fontBodySmall, styles.metadataLabel, { color: theme.colors.colorTextSecondary }]}>
                {t("caseDetail.priority") || "Priority"}
              </Text>
            </View>
          )}

          {Taskstatus && (
            <View
              style={[
                styles.metadataItem,
                { backgroundColor: theme.colors.colorPrimary50 },
              ]}
            >
              <RemixIcon
                name="checkbox-circle-line"
                size={16}
                color={theme.colors.colorPrimary600}
              />
              <Text
                style={[
                  theme.typography.fontH6,
                  styles.metadataValue,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {Taskstatus}
              </Text>
              <Text style={[theme.typography.fontBodySmall, styles.metadataLabel, { color: theme.colors.colorTextSecondary }]}>
                {t("caseDetail.status") || "Status"}
              </Text>
            </View>
          )}

          {subStatus && (
            <View
              style={[
                styles.metadataItem,
                { backgroundColor: theme.colors.colorWarning100 },
              ]}
            >
              <RemixIcon
                name="flag-line"
                size={16}
                color={theme.colors.colorWarning600}
              />
              <Text
                style={[
                  theme.typography.fontH6,
                  styles.metadataValue,
                  { color: theme.colors.colorWarning600 },
                ]}
              >
                {subStatus}
              </Text>
              <Text style={[theme.typography.fontBodySmall, styles.metadataLabel, { color: theme.colors.colorTextSecondary }]}>
                {t("caseDetail.subStatus") || "Sub Status"}
              </Text>
            </View>
          )}

          {source && (
            <View
              style={[
                styles.metadataItem,
                { backgroundColor: theme.colors.colorPrimary50 },
              ]}
            >
              <RemixIcon
                name="phone-line"
                size={16}
                color={theme.colors.colorPrimary600}
              />
              <Text
                style={[
                  theme.typography.fontH6,
                  styles.metadataValue,
                  { color: theme.colors.colorPrimary600 },
                ]}
              >
                {source}
              </Text>
              <Text style={[theme.typography.fontBodySmall, styles.metadataLabel, { color: theme.colors.colorTextSecondary }]}>
                {t("caseDetail.source") || "Source"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metadataDetails}>
          {item?.teamName && (
            <View style={styles.metadataDetailRow}>
              <View style={styles.labelContainer}>
                <RemixIcon
                  name="team-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.metadataKey,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("caseDetail.team") || "Team"}:
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.metadataDetailValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {item.teamName}
              </Text>
            </View>
          )}

          {item?.assignToName && (
            <View style={styles.metadataDetailRow}>
              <View style={styles.labelContainer}>
                <RemixIcon
                  name="user-star-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.metadataKey,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("caseDetail.assignedTo") || "Assigned To"}:
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.metadataDetailValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {item.assignToName}
              </Text>
            </View>
          )}

          {item?.callBack === "Yes" && item?.callBackDateTime && (
            <View style={styles.metadataDetailRow}>
              <View style={styles.labelContainer}>
                <RemixIcon
                  name="history-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.metadataKey,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("caseDetail.callback") || "Callback"}:
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.metadataDetailValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {new Date(item.callBackDateTime).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* LOCATION */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.colorBgSurface },
          styles.cardShadow,
          { shadowColor: theme.colors.colorShadow },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <RemixIcon
              name="map-pin-line"
              size={20}
              color={theme.colors.colorPrimary600}
            />
            <Text
              style={[
                theme.typography.fontH6,
                styles.cardTitle,
                { color: theme.colors.colorPrimary600 },
              ]}
            >
              {t("caseDetail.location") || "Location"}
            </Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <View style={styles.keyValueRow}>
            <View style={styles.labelContainer}>
              <RemixIcon
                name="home-3-line"
                size={14}
                color={theme.colors.colorTextSecondary}
              />
              <Text
                style={[
                  theme.typography.fontBodySmall,
                  styles.labelKey,
                  { color: theme.colors.colorTextSecondary },
                ]}
              >
                {t("caseDetail.address") || "Address"}:
              </Text>
            </View>
            <Text
              style={[
                theme.typography.fontBody,
                styles.labelValue,
                { color: theme.colors.colorTextPrimary },
              ]}
            >
              {address || '-'}
            </Text>
          </View>

          {(state || district) && (
            <View style={styles.keyValueRow}>
              <View style={styles.labelContainer}>
                <RemixIcon
                  name="map-line"
                  size={14}
                  color={theme.colors.colorTextSecondary}
                />
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    styles.labelKey,
                    { color: theme.colors.colorTextSecondary },
                  ]}
                >
                  {t("caseDetail.location") || "Location"}:
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.fontBody,
                  styles.labelValue,
                  { color: theme.colors.colorTextPrimary },
                ]}
              >
                {district && state
                  ? `${district}, ${state}`
                  : state || district}
              </Text>
            </View>
          )}

          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={initialRegion}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={false}
              pitchEnabled={false}
              loadingEnabled={true}
              loadingIndicatorColor={theme.colors.colorPrimary600}
            >
              <Marker
                coordinate={{ latitude, longitude }}
                title={elderName || t("caseDetail.location") || 'Location'}
                description={address}
              >
                <View style={styles.markerContainer}>
                  <View
                    style={[
                      styles.markerPin,
                      { backgroundColor: theme.colors.colorError600, borderColor: theme.colors.colorBgSurface },
                    ]}
                  >
                    <RemixIcon name="map-pin-fill" size={16} color={theme.colors.colorTextInverse} />
                  </View>
                  <View
                    style={[
                      styles.markerTail,
                      { borderTopColor: theme.colors.colorError600 },
                    ]}
                  />
                </View>
              </Marker>
            </MapView>

            <TouchableOpacity
              style={[styles.mapOverlayButton, { 
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.colorSuccess600 
              }]}
              onPress={() => {
                router.push({
                  pathname: "/FullMapScreen",
                  params: {
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    title: elderName || t("caseDetail.location") || 'Location',
                    description: address,
                  },
                });
              }}
            >
              <RemixIcon name="fullscreen-line" size={16} color={theme.colors.colorSuccess600} />
              <Text style={[theme.typography.fontBodySmall, styles.mapOverlayText, { color: theme.colors.colorSuccess600 }]}>
                {t("caseDetail.fullMap") || "Full Map"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.navBtn,
              { backgroundColor: theme.colors.colorPrimary600 },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(fro)/(complaints)/StartNavigationScreen",
                params: { item: JSON.stringify(item) },
              })
            }
          >
            <RemixIcon name="navigation-line" size={20} color={theme.colors.colorTextInverse} />
            <Text style={[theme.typography.fontButton, styles.navBtnText, { color: theme.colors.colorTextInverse }]}>
              {t("caseDetail.startNavigation") || "Start Navigation"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BodyLayout>
  );
}

/* IMPROVED STYLES */
const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  cardShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    marginLeft: 8,
  },
  viewMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  elderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  keyValueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
    marginRight: 8,
  },
  labelKey: {
    marginLeft: 4,
  },
  labelValue: {
    flex: 1,
    flexWrap: "wrap",
  },
  valueContainer: {
    flex: 1,
  },
  categoryValue: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    fontWeight: "700",
  },
  detailSection: {
    marginTop: 4,
  },
  detailItem: {
    marginTop: 12,
  },
  detailLabel: {
    marginLeft: 4,
  },
  detailText: {
    marginTop: -20,
    marginBottom: 8,
    lineHeight: 20,
  },
  attachmentBox: {
    height: 80,
    borderRadius: 12,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  attachmentText: {
    marginTop: 6,
  },
  mapContainer: {
    height: 140,
    borderRadius: 12,
    marginTop: 16,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerTail: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
  mapOverlayButton: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  mapOverlayText: {
    marginLeft: 4,
  },
  navBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  navBtnText: {
    marginLeft: 8,
  },
  timelineContainer: {
    marginTop: 8,
  },
  progressRow: {
    flexDirection: "row",
    minHeight: 48,
  },
  progressLeft: {
    width: 28,
    alignItems: "center",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    zIndex: 2,
  },
  lineContainer: {
    width: 2,
    height: 40,
    overflow: "hidden",
    marginTop: -2,
  },
  lineFill: {
    height: "100%",
  },
  progressContent: {
    paddingLeft: 12,
    paddingBottom: 8,
    flex: 1,
    justifyContent: "center",
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginBottom: 12,
  },
  metadataItem: {
    flex: 1,
    minWidth: "45%",
    margin: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  metadataLabel: {
    marginTop: 2,
    opacity: 0.8,
  },
  metadataValue: {
    marginTop: 4,
  },
  metadataDetails: {
    marginTop: 8,
  },
  metadataDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 4,
  },
  metadataKey: {
    marginLeft: 4,
    opacity: 0.8,
  },
  metadataDetailValue: {
    flex: 1,
    textAlign: "right",
  },
  actionsGrid: {
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    minHeight: 70,
    justifyContent: "center",
  },
  actionBtnText: {
    textAlign: "center",
    marginTop: 4,
  },
  attachmentRow: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  attachmentThumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  extraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  extraText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fileIconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
  },
  fileNameText: {
    fontSize: 8,
    marginTop: 2,
    textAlign: "center",
    fontWeight: "500",
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLoadingContainer: {
    height: 80,
    borderRadius: 12,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  loadingText: {
    fontSize: 12,
    marginTop: 6,
  },
  noNotesContainer: {
    height: 80,
    borderRadius: 12,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  noNotesText: {
    fontSize: 12,
    marginTop: 6,
  },
  noteItem: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  noteType: {
    flex: 1,
    fontWeight: "600",
  },
  noteDate: {
    fontSize: 11,
    fontWeight: "500",
  },
  noteDesc: {
    marginBottom: 6,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteTime: {
    fontSize: 11,
  },
  followUpBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  followUpText: {
    fontSize: 10,
    fontWeight: "500",
  },
  viewAllNotesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  viewAllNotesText: {
    marginRight: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
  },
});