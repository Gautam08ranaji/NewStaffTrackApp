export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/Authentication/ElderUser/Login",
    VERIFY_OTP: "/api/Authentication/ElderUser/VerifyOtp",
    GET_ELDER_USER_OTP: "/api/Authentication/GetElderUserOtp",
  },
  ElderUsersActivityHistory: {
    ELDER_USER_ACTIVITY_HISTORY:
      "/api/ElderUsersActivityHistory/AddElderUsersActivityHistory",
  },

  ELDER_USER: {
    UPDATE_PROFILE: "/api/ElderUsers/UpdateElderUser",
    GET_BY_ID: "/api/ElderUsers/GetElderUserById",
    LOGOUT: "/api/ElderUsers/ElderUserLogout",
    UPDATE_IMAGE: "/api/ElderUsers/UpdateUserImage",
    GET_TICKET_LIST: "/api/ElderUsers/GetTicketList",
  },

  ELDER_USER_MEMBER: {
    ADD_ELDER_USER_FAMILY_MEMBER: "/api/ElderUserMember/AddElderUserMember",
    GET_ELDER_USER_MEMBER_LIST: "/api/ElderUserMember/GetElderUserMemberList",
    DELETE: "/api/ElderUserMember/DeleteElderUserMember",
    UPDATE_ELDER_USER_MEMBER: "/api/ElderUserMember/UpdateElderUserMember",
    UPDATE_IMAGE: "/api/ElderUserMember/UpdateElderUserMemberImage",
  },
  ElderDropdown: {
    STATE_DROPDOWN: "/api/ElderDropdown/GetStateDropdown",
    DISTRICT_DROPDOWN: "/api/ElderDropdown/GetDistrictDropdownByStateId",
    RELATION_DROPDOWN: "/api/ElderDropdown/GetSubLookUpByName/Relation",
    GENDER_DROPDOWN: "/api/ElderDropdown/GetSubLookUpByName/Gender",
    HEALTH_CATEGORY_DROPDOWN: "/api/ElderDropdown/GetHealthCategoryDropdown",
    HEALTH_SUB_CATEGORY_DROPDOWN:
      "/api/ElderDropdown/GetHealthSubCategoryDropdown",
  },

  MEDICAL: {
    ADD_MEDICATION_DETAILS: "api/MedicalDetails/AddMedicationDetails",
    GET_MEDICATION_LIST: "api/MedicalDetails/GetMedicationDetailsByRelatedToId",
    DELETE_MEDICATION_ITEM: "api/MedicalDetails/DeleteMedicationDetails",
    UPDATE_MEDICATION_DETAILS: "api/MedicalDetails/UpdateMedicationDetails",
  },

  COMMON: {
    COMMON_API: "api/MobileApp/",
  },
};
