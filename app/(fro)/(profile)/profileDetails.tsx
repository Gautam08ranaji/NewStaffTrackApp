import BodyLayout from "@/components/layout/BodyLayout";
import { baseUrlApi } from "@/features/api/baseUrl.ts";
import { getUserDataById } from "@/features/fro/profile/getProfile";
import { updateUser } from "@/features/fro/profile/updateUser";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getDropdownByEndpoint,
  getDropdownByEndpointAndId,
} from "@/features/fro/dropdownApi";
import { showApiError } from "@/utils/showApiError";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import RemixIcon from "react-native-remix-icon";

/* ================= TYPES ================= */

type ApiDropdownItem = {
  id: string | number;
  name: string;
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
  photoBase64: string | null;
};

export type UpdateUserPayload = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  stateName: string;
  cityName: string;
  pinCode: string;

  isImageUpdate: boolean;
  imgSrc: string;

  address: string;
  isActive: boolean;
  userLevel: number;
  userLevelName: string;
  department: string;
  maxAssignInteraction: number;
  stateId: number;
  cityId: number;
  userType: string;
  userRoles: any[];
};

type TextInputKey =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "gender"
  | "state"
  | "city"
  | "pincode"
  | "address";

type DropdownKey = "gender" | "state" | "city";

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

type DropdownItem = {
  label: string;
  value: number;
};

/* ================= COMPONENT ================= */

export default function OfficerDetailsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const authState = useAppSelector((state) => state.auth);

  /* ================= REFS ================= */

  const scrollRef = useRef<ScrollView>(null);

  const inputRefs = useRef<Record<TextInputKey, View | null>>({
    firstName: null,
    lastName: null,
    phone: null,
    email: null,
    gender: null,
    state: null,
    city: null,
    pincode: null,
    address: null,
  });

  /* ================= STATE ================= */
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
    photoBase64: null,
  });

  const [errors, setErrors] = useState<Partial<Record<TextInputKey, string>>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const [dropdownKey, setDropdownKey] = useState<DropdownKey | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [genderDropdown, setGenderDropdown] = useState<any[]>([]);
  const [stateDropdown, setStateDropdown] = useState<any[]>([]);
  const [cityDropdown, setCityDropdown] = useState<any[]>([]);

  /* ================= FETCH USER ================= */
  const getProfileImageUrl = (photoPath: string | null) => {
    if (!photoPath) return null;
    console.log("photoPath", photoPath);

    const normalizedPath = photoPath.replace(/\\/g, "/");
    return `${baseUrlApi}/${normalizedPath}`;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const response = await getUserDataById({
        userId: String(authState.userId),
        token: String(authState.token),
        csrfToken: String(authState.antiforgeryToken),
      });

      const data: UserApiResponse = response?.data;
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
        photo: getProfileImageUrl(data?.profilePhoto),
        photoBase64: null,
      });

      console.log(data);

      if (data?.stateId) {
        fetchDistrictDropdown(data.stateId);
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
      showApiError(error)
    } finally {
      setLoading(false);
    }
  };

  /* ================= DROPDOWN API FUNCTIONS ================= */

  const fetchGenderDropdown = async () => {
    try {
       const res = await getDropdownByEndpoint(
      "GetGenderDropdown",
      String(authState.token),
      String(authState.antiforgeryToken),
    );

    setGenderDropdown(res.data ?? []);
    } catch (error) {
      showApiError(error)
    }
   
  };

  const fetchStateDropdown = async () => {

    try {
        const res = await getDropdownByEndpoint(
      "GetStateDropdown",
      String(authState.token),
      String(authState.antiforgeryToken),
    );

    setStateDropdown(res.data ?? []);
    } catch (error) {
      showApiError(error)
    }
  
  };

  const fetchDistrictDropdown = async (stateId: number) => {
    try {
       const res = await getDropdownByEndpointAndId(
      "GetDistrictDropdownByStateId",
      stateId,
      String(authState.token),
      String(authState.antiforgeryToken),
    );

    setCityDropdown(res.data ?? []);
    } catch (error) {
      showApiError(error)
    }
   
  };

  useEffect(() => {
    if (authState?.userId && authState?.token) {
      fetchUserData();
      fetchGenderDropdown();
      fetchStateDropdown();
    }
  }, [authState]);

  /* ================= IMAGE PICKER ================= */

  const openCamera = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: true,
        quality: 0.7,
        cameraType: 'back',
      },
      (res) => {
        setImagePickerVisible(false);
        if (res.assets?.length) {
          const asset = res.assets[0];

          setForm((prev) => ({
            ...prev,
            photo: asset.uri ?? null,
            photoBase64: asset.base64
              ? `data:${asset.type};base64,${asset.base64}`
              : null,
          }));
        }
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: true,
        quality: 0.7,
      },
      (res) => {
        setImagePickerVisible(false);
        if (res.assets?.length) {
          const asset = res.assets[0];

          setForm((prev) => ({
            ...prev,
            photo: asset.uri ?? null,
            photoBase64: asset.base64
              ? `data:${asset.type};base64,${asset.base64}`
              : null,
          }));
        }
      },
    );
  };

  /* ================= KEYBOARD AUTO SCROLL ================= */

  const scrollToField = (key: TextInputKey) => {
    const fieldRef = inputRefs.current[key];
    if (!fieldRef || !scrollRef.current) return;

    fieldRef.measureInWindow((x, y) => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 20),
        animated: true,
      });
    });
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newErrors: Partial<Record<TextInputKey, string>> = {};

    if (!form.firstName.trim()) newErrors.firstName = t("officerDetails.errors.firstNameRequired");
    if (!form.lastName.trim()) newErrors.lastName = t("officerDetails.errors.lastNameRequired");
    if (!/^\d{10}$/.test(form.phone))
      newErrors.phone = t("officerDetails.errors.phoneInvalid");
    if (!/^\d{6}$/.test(form.pincode))
      newErrors.pincode = t("officerDetails.errors.pincodeInvalid");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = t("officerDetails.errors.emailInvalid");
    if (!form.state) newErrors.state = t("officerDetails.errors.stateRequired");
    if (!form.city) newErrors.city = t("officerDetails.errors.cityRequired");

    setErrors(newErrors);

    const firstErrorKey = Object.keys(newErrors)[0] as TextInputKey | undefined;

    if (firstErrorKey) {
      scrollToField(firstErrorKey);
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */

  const onSave = () => {
    if (!validate()) return;
    handleUpdateUser();
  };

  /* ================= DROPDOWN ================= */

  const openDropdown = (key: DropdownKey) => {
    setDropdownKey(key);
    setDropdownVisible(true);
  };

  const getDropdownData = () => {
    switch (dropdownKey) {
      case "gender":
        return genderDropdown;
      case "state":
        return stateDropdown;
      case "city":
        return cityDropdown;
      default:
        return [];
    }
  };

  const handleDropdownSelect = (item: { label: string; value: number }) => {
    if (!dropdownKey) return;

    switch (dropdownKey) {
      case "gender":
        setForm((prev) => ({
          ...prev,
          gender: item.label,
          genderValue: item.value,
        }));
        break;

      case "state":
        setForm((prev) => ({
          ...prev,
          state: item.label,
          stateValue: item.value,
          city: "",
          cityValue: 0,
        }));
        fetchDistrictDropdown(item.value);
        break;

      case "city":
        setForm((prev) => ({
          ...prev,
          city: item.label,
          cityValue: item.value,
        }));
        break;
    }

    setDropdownVisible(false);
  };

  const buildUpdatePayload = (): UpdateUserPayload => {
    if (!userProfile) {
      throw new Error("User profile not loaded");
    }

    const isImageUpdated = Boolean(form.photoBase64);

    return {
      id: String(authState.userId),

      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phone,
      gender: form.gender,
      stateName: form.state,
      cityName: form.city,
      pinCode: form.pincode,

      isImageUpdate: isImageUpdated,
      imgSrc: isImageUpdated
        ? form.photoBase64!
        : (userProfile.profilePhoto ?? ""),

      address: form.address,
      isActive: userProfile.isActive ?? true,
      userLevel: userProfile.userLevel ?? 0,
      userLevelName: userProfile.userLevelName ?? "",
      department: userProfile.department ?? "",
      maxAssignInteraction: userProfile.maxAssignInteraction ?? 0,
      stateId: form.stateValue,
      cityId: form.cityValue,
      userType: userProfile.userType ?? "",
      userRoles: userProfile.userRoles ?? [],
    };
  };

  const handleUpdateUser = async () => {
    if (!validate()) return;
    if (!userProfile) return;

    try {
      setSaving(true);

      const response = await updateUser({
        token: authState.token!,
        csrfToken: String(authState.antiforgeryToken),
        data: buildUpdatePayload(),
      });

      console.log("updt yser", response);

      if (response?.success) {
        fetchUserData();
        // router.push("/(fro)/(profile)")
      }
    } catch (error: any) {
      showApiError(error)
      console.error("Update failed:", error?.response?.data ?? error.message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <BodyLayout
      type="screen"
      screenName={t("officerDetails.screenTitle")}
      enableScroll={false}
    >
      {(loading || saving) && (
        <View style={[styles.overlay, { backgroundColor: theme.colors.colorOverlay }]}>
          <ActivityIndicator
            size="large"
            color={theme.colors.colorPrimary600}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 210}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          <View
            style={[styles.card, { backgroundColor: theme.colors.colorBgSurface }]}
          >
            {/* PROFILE */}
            <View style={styles.profileWrapper}>
              <View
                style={[
                  styles.profileCircle,
                  {
                    backgroundColor: theme.colors.colorPrimary50,
                    borderColor: theme.colors.colorPrimary200,
                  },
                ]}
              >
                {form.photo ? (
                  <Image
                    source={{ uri: form.photo }}
                    style={styles.profileImage}
                  />
                ) : (
                  <RemixIcon
                    name="user-3-line"
                    size={42}
                    color={theme.colors.colorPrimary600}
                  />
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.editIcon,
                  { backgroundColor: theme.colors.btnPrimaryBg },
                ]}
                onPress={() => setImagePickerVisible(true)}
              >
                <RemixIcon name="camera-line" size={16} color={theme.colors.btnPrimaryText} />
              </TouchableOpacity>
            </View>

            {renderInput(
              t("officerDetails.firstName"),
              "firstName",
              t("officerDetails.enterFirstName")
            )}
            {renderInput(
              t("officerDetails.lastName"),
              "lastName",
              t("officerDetails.enterLastName")
            )}
            {renderInput(
              t("officerDetails.phone"),
              "phone",
              t("officerDetails.enterPhone"),
              true
            )}
            {renderInput(
              t("officerDetails.email"),
              "email",
              t("officerDetails.enterEmail")
            )}
            {renderDropdown(
              t("officerDetails.gender"),
              "gender",
              t("officerDetails.selectGender")
            )}
            {renderDropdown(
              t("officerDetails.state"),
              "state",
              t("officerDetails.selectState")
            )}
            {renderDropdown(
              t("officerDetails.city"),
              "city",
              t("officerDetails.selectCity")
            )}
            {renderInput(
              t("officerDetails.pincode"),
              "pincode",
              t("officerDetails.enterPincode"),
              true
            )}
            {renderInput(
              t("officerDetails.address"),
              "address",
              t("officerDetails.enterAddress")
            )}

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: saving ? theme.colors.btnDisabledBg : theme.colors.btnPrimaryBg,
                  opacity: saving ? 0.6 : 1,
                },
              ]}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={[styles.saveText, { color: theme.colors.btnPrimaryText }]}>
                {saving ? t("common.saving") : t("common.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DROPDOWN MODAL */}
      <Modal transparent visible={dropdownVisible} animationType="slide">
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: theme.colors.colorOverlay }]}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.colorBgSurface }]}>
            {getDropdownData().map((item: { label: string; value: number }) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.modalItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => handleDropdownSelect(item)}
              >
                <Text style={[styles.modalText, { color: theme.colors.colorTextPrimary }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* IMAGE PICKER MODAL */}
      <Modal
        transparent
        visible={imagePickerVisible}
        animationType="slide"
        onRequestClose={() => setImagePickerVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: theme.colors.colorOverlay }]}
          activeOpacity={1}
          onPress={() => setImagePickerVisible(false)}
        >
          <View style={[styles.imagePickerContent, { backgroundColor: theme.colors.colorBgSurface }]}>
            <View style={[styles.imagePickerHandle, { backgroundColor: theme.colors.border }]} />
            
            <Text style={[styles.imagePickerTitle, { color: theme.colors.colorTextPrimary }]}>
              {t("officerDetails.choosePhoto")}
            </Text>

            <TouchableOpacity
              style={[styles.imagePickerOption, { backgroundColor: theme.colors.colorPrimary50 }]}
              onPress={openCamera}
            >
              <View style={[styles.imagePickerIconContainer, { backgroundColor: theme.colors.btnPrimaryBg }]}>
                <RemixIcon name="camera-line" size={24} color={theme.colors.btnPrimaryText} />
              </View>
              <View style={styles.imagePickerOptionContent}>
                <Text style={[styles.imagePickerOptionText, { color: theme.colors.colorTextPrimary }]}>
                  {t("officerDetails.camera")}
                </Text>
                <Text style={[styles.imagePickerOptionSubtext, { color: theme.colors.colorTextSecondary }]}>
                  {t("officerDetails.cameraDescription")}
                </Text>
              </View>
              <RemixIcon name="arrow-right-s-line" size={20} color={theme.colors.colorTextSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imagePickerOption, { backgroundColor: theme.colors.colorPrimary50 }]}
              onPress={openGallery}
            >
              <View style={[styles.imagePickerIconContainer, { backgroundColor: theme.colors.btnPrimaryBg }]}>
                <RemixIcon name="image-line" size={24} color={theme.colors.btnPrimaryText} />
              </View>
              <View style={styles.imagePickerOptionContent}>
                <Text style={[styles.imagePickerOptionText, { color: theme.colors.colorTextPrimary }]}>
                  {t("officerDetails.gallery")}
                </Text>
                <Text style={[styles.imagePickerOptionSubtext, { color: theme.colors.colorTextSecondary }]}>
                  {t("officerDetails.galleryDescription")}
                </Text>
              </View>
              <RemixIcon name="arrow-right-s-line" size={20} color={theme.colors.colorTextSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imagePickerCancel, { borderColor: theme.colors.border }]}
              onPress={() => setImagePickerVisible(false)}
            >
              <Text style={[styles.imagePickerCancelText, { color: theme.colors.colorPrimary600 }]}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </BodyLayout>
  );

  /* ================= HELPERS ================= */

  function renderInput(
    label: string,
    key: TextInputKey,
    placeholder: string,
    numeric = false,
  ) {
    return (
      <View
        ref={(ref) => {
          inputRefs.current[key] = ref;
        }}
        collapsable={false}
      >
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.inputText,
            },
          ]}
          value={form[key] as string}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inputPlaceholder}
          keyboardType={numeric ? "numeric" : "default"}
          onFocus={() => scrollToField(key)}
          onChangeText={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
        />
        {errors[key] && <Text style={[styles.error, { color: theme.colors.colorError600 }]}>{errors[key]}</Text>}
      </View>
    );
  }

  function renderDropdown(
    label: string,
    key: DropdownKey,
    placeholder: string,
  ) {
    const displayValue = form[key] ? String(form[key]) : placeholder;
    const hasValue = Boolean(form[key]);

    return (
      <View>
        <Text style={[styles.label, { color: theme.colors.colorTextSecondary }]}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          onPress={() => openDropdown(key)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ 
              color: hasValue ? theme.colors.inputText : theme.colors.inputPlaceholder,
              fontFamily: hasValue ? 'Poppins-Medium' : 'Poppins-Regular',
            }}>
              {displayValue}
            </Text>
            <RemixIcon name="arrow-down-s-line" size={20} color={theme.colors.colorTextTertiary} />
          </View>
        </TouchableOpacity>
        {errors[key] && <Text style={[styles.error, { color: theme.colors.colorError600 }]}>{errors[key]}</Text>}
      </View>
    );
  }
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  profileWrapper: {
    alignSelf: "center",
    marginBottom: 20,
    position: 'relative',
  },
  profileCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  saveBtn: {
    marginTop: 30,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "50%",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  // Image Picker Styles
  imagePickerContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  imagePickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  imagePickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  imagePickerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  imagePickerOptionContent: {
    flex: 1,
  },
  imagePickerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  imagePickerOptionSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  imagePickerCancel: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  imagePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});