import ConfirmationAlert from "@/components/reusables/ConfirmationAlert";
import { baseUrlApi } from "@/features/api/baseUrl.ts";
import { logout } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/logoutApi";
import { getUserDataById } from "@/features/fro/profile/getProfile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

type AvailabilityStatus = "available" | "busy" | "in_meeting" | "unavailable";

type UserApiResponse = {
  id: string | null;

  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;

  gender: string | null;
  stateName: string | null;
  cityName: string | null;
  pinCode: string | null;

  profilePhoto: string | null;

  address: string | null;
  isActive: boolean | null;
  userLevel: number | null;
  userLevelName: string | null;
  department: string | null;
  maxAssignInteraction: number | null;
  stateId: number | null;
  cityId: number | null;
  userType: string | null;
  userRoles: any[];
};

type OfficerForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  genderValue: number;
  state: string;
  stateValue: number;
  city: string;
  cityValue: number;
  pincode: string;
  address: string;
  photo: string | null;
  department: string;
  photoBase64: string | null;
};

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const authState = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [userProfile, setUserProfile] = useState<UserApiResponse | null>(null);

  const [form, setForm] = useState<OfficerForm>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    genderValue: 0,
    state: "",
    stateValue: 0,
    city: "",
    cityValue: 0,
    pincode: "",
    address: "",
    photo: null,
    department: "",
    photoBase64: null,
  });

  const [showAlert, setShowAlert] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [availability, setAvailability] =
    useState<AvailabilityStatus>("available");

  const antiforgeryToken = useAppSelector(
    (state) => state.auth.antiforgeryToken,
  );

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, []),
  );

  /* ================= FETCH USER ================= */
  const getProfileImageUrl = (photoPath: string | null) => {
    if (!photoPath) return null;
    console.log("photoPath", photoPath);

    const normalizedPath = photoPath.replace(/\\/g, "/");
    return `${baseUrlApi}/${normalizedPath}`;
  };

  const fetchUserData = async () => {
    try {
      const response = await getUserDataById({
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      const data: UserApiResponse = response?.data;

      console.log("data", data);

      setUserProfile(data);

      setForm({
        firstName: data?.firstName ?? "",
        lastName: data?.lastName ?? "",
        phone: data?.phoneNumber ?? "",
        email: data?.email ?? "",
        gender: data?.gender ?? "",
        genderValue: 0,
        state: data?.stateName ?? "",
        stateValue: data?.stateId ?? 0,
        city: data?.cityName ?? "",
        cityValue: data?.cityId ?? 0,
        pincode: data?.pinCode ?? "",
        address: data?.address ?? "",
        department: data?.department ?? "",
        photo: getProfileImageUrl(data?.profilePhoto),
        photoBase64: null,
      });

      // console.log("response", response);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
    }
  };

  const logOutApi = async () => {
    try {
      const response = await logoutUser(
        String(authState.userId),
        String(authState.token),
        String(antiforgeryToken),
      );

      console.log("Logout API response:", response);

      // ✅ Normal logout
      dispatch(logout());
      router.replace("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);

      const status = error?.status || error?.response?.status;
      const message =
        error?.data?.data ||
        error?.response?.data?.data ||
        t("common.sessionExpiredMessage") || "Your session has expired. Please login again.";

      // ✅ Handle Session Expired / Logged in elsewhere
      if (status === 440) {
        Alert.alert(
          t("common.sessionExpired") || "Session Expired", 
          message, 
          [{ text: t("common.ok") || "OK" }], 
          {
            cancelable: false,
          }
        );

        // ⏳ Wait 3 seconds → clear auth → go to login
        setTimeout(() => {
          dispatch(logout()); // clear redux auth
          router.replace("/login"); // redirect
        }, 3000);

        return;
      }

      // ❌ Fallback error
      Alert.alert(
        t("profile.logoutFailed") || "Logout Failed", 
        t("common.somethingWentWrong") || "Something went wrong. Please try again."
      );
    }
  };

  const availabilityOptions = [
    {
      key: "available" as AvailabilityStatus,
      label: t("profile.availability.available") || "Available",
      color: theme.colors.colorSuccess600,
      icon: "checkbox-circle-line",
    },
    {
      key: "busy" as AvailabilityStatus,
      label: t("profile.availability.busy") || "Busy",
      color: theme.colors.colorWarning600,
      icon: "time-line",
    },
    {
      key: "in_meeting" as AvailabilityStatus,
      label: t("profile.availability.inMeeting") || "In Meeting",
      color: theme.colors.validationInfoText,
      icon: "group-line",
    },
    {
      key: "unavailable" as AvailabilityStatus,
      label: t("profile.availability.unavailable") || "Unavailable",
      color: theme.colors.colorError600,
      icon: "close-circle-line",
    },
  ];

  const selectedAvailability = availabilityOptions.find(
    (a) => a.key === availability,
  );

  const renderItem = (
    label: string,
    icon: string,
    onPress: () => void,
    iconColor?: string,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.item, 
        { 
          backgroundColor: theme.colors.colorBgSurface,
          shadowColor: theme.colors.colorShadow,
        }
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            padding: 10,
            borderRadius: 10,
            backgroundColor: theme.colors.colorBgAlt,
          }}
        >
          <RemixIcon
            name={icon as any}
            size={26}
            color={iconColor || theme.colors.colorPrimary600}
          />
        </View>

        <Text
          style={[styles.itemText, { color: theme.colors.colorTextPrimary }]}
        >
          {label}
        </Text>
      </View>

      <RemixIcon
        name="arrow-right-s-line"
        size={26}
        color={theme.colors.colorTextTertiary}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* ================= HEADER ================= */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.colorPrimary600 },
        ]}
      >
        <View style={styles.avatarWrapper}>
          <View
            style={[
              styles.avatarContainer,
              { 
                backgroundColor: theme.colors.colorBgSurface,
                borderColor: theme.colors.colorBgSurface,
              },
            ]}
          >
            {form.photo ? (
              <Image source={{ uri: form.photo }} style={styles.profileImage} />
            ) : (
              <RemixIcon
                name="user-3-line"
                size={38}
                color={theme.colors.colorPrimary600}
              />
            )}
          </View>
          
          {/* Edit Icon Button */}
          <TouchableOpacity 
            style={[
              styles.editIconContainer,
              { 
                backgroundColor: theme.colors.colorPrimary600,
                borderColor: theme.colors.colorBgSurface,
              }
            ]}
            onPress={() => router.push("/profileDetails")}
          >
            <RemixIcon
              name="edit-line"
              size={16}
              color={theme.colors.colorTextInverse}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.name, { color: theme.colors.colorTextInverse }]}>
          {form.firstName} {form.lastName}
        </Text>
        <Text style={[styles.code, { color: theme.colors.colorTextInverse, opacity: 0.9 }]}>
          {form.email}
        </Text>
        <Text style={[styles.role, { color: theme.colors.colorTextInverse, opacity: 0.9 }]}>
          {form.phone}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Availability Dropdown Card ===== */}
        <View>
          <TouchableOpacity
            onPress={() => setShowAvailability(!showAvailability)}
            style={[
              styles.item, 
              { 
                backgroundColor: theme.colors.colorBgSurface,
                shadowColor: theme.colors.colorShadow,
              }
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: theme.colors.colorBgAlt,
                }}
              >
                <RemixIcon
                  name="user-settings-line"
                  size={26}
                  color={selectedAvailability?.color}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.itemText,
                    { color: theme.colors.colorTextPrimary },
                  ]}
                >
                  {t("profile.availability.title") || "Availability"}
                </Text>
                <Text
                  style={[
                    styles.availabilityStatus,
                    { color: selectedAvailability?.color }
                  ]}
                >
                  {selectedAvailability?.label}
                </Text>
              </View>
            </View>

            <RemixIcon
              name={showAvailability ? "arrow-up-s-line" : "arrow-down-s-line"}
              size={26}
              color={theme.colors.colorTextTertiary}
            />
          </TouchableOpacity>

          {showAvailability && (
            <View
              style={[
                styles.availabilityDropdown,
                { 
                  backgroundColor: theme.colors.colorBgSurface,
                  shadowColor: theme.colors.colorShadow,
                }
              ]}
            >
              {availabilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setAvailability(option.key);
                    setShowAvailability(false);
                  }}
                  style={[
                    styles.availabilityOption,
                    { 
                      borderBottomColor: theme.colors.border,
                      backgroundColor: option.key === availability 
                        ? theme.colors.colorPrimary50 
                        : 'transparent'
                    }
                  ]}
                >
                  <RemixIcon
                    name={option.icon as any}
                    size={22}
                    color={option.color}
                  />
                  <Text
                    style={[
                      styles.availabilityOptionText,
                      { 
                        color: theme.colors.colorTextPrimary,
                        fontFamily: option.key === availability 
                          ? 'Poppins-SemiBold' 
                          : 'Poppins-Regular'
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.key === availability && (
                    <RemixIcon
                      name="check-line"
                      size={18}
                      color={theme.colors.colorSuccess600}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {renderItem(
          t("profile.menuPerformance") || "My Performance",
          "bar-chart-line",
          () => router.push("/(fro)/(profile)/teamOverView"),
          theme.colors.colorWarning400,
        )}

        {renderItem(
          t("profile.menuLanguage"),
          "translate-2",
          () => router.push("/languageSelect"),
          theme.colors.validationInfoText,
        )}

        {renderItem(
          t("profile.menuSettings"),
          "settings-3-line",
          () => router.push("/setting"),
          theme.colors.colorError400,
        )}

        {renderItem(
          t("profile.menuChangePassword"),
          "lock-password-line",
          () => router.push("/changePassword"),
          theme.colors.colorError600,
        )}

        {/* ===== Logout ===== */}
        <TouchableOpacity
          onPress={() => setShowAlert(true)}
          style={[
            styles.logoutBtn,
            { 
              backgroundColor: theme.colors.colorError100,
              shadowColor: theme.colors.colorShadow,
            }
          ]}
        >
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <RemixIcon
              name="login-box-line"
              size={26}
              color={theme.colors.colorError600}
            />
            <Text
              style={[styles.logoutText, { color: theme.colors.colorError600 }]}
            >
              {t("profile.logout")}
            </Text>
          </View>
        </TouchableOpacity>

        <ConfirmationAlert
          visible={showAlert}
          icon="login-box-line"
          title={t("profile.logoutTitle")}
          description={t("profile.logoutDescription")}
          confirmText={t("profile.logoutConfirm")}
          cancelText={t("profile.logoutCancel")}
          onConfirm={() => {
            setShowAlert(false);
            logOutApi();
          }}
          onCancel={() => setShowAlert(false)}
          confirmColor={theme.colors.colorPrimary600}
          cancelColor={theme.colors.colorBgSurface}
          subtitleColor={theme.colors.colorTextSecondary}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  avatarWrapper: {
    position: 'relative',
    marginTop: 30,
  },

  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  name: { 
    fontSize: 20, 
    fontWeight: "600", 
    marginTop: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  code: { 
    fontSize: 14, 
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  role: { 
    fontSize: 14, 
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  itemText: { 
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },

  availabilityStatus: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },

  availabilityDropdown: {
    marginTop: -8,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  availabilityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 0.5,
  },

  availabilityOptionText: {
    fontSize: 15,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },

  logoutBtn: {
    marginTop: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  profileImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
});