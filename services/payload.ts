// utils/form-payloads.ts

// NGO Form Payload
export const NGO_FORM_PAYLOAD = {
  name: "",
  descriptions: "",
  state: "",
  stateId: null as number | null,
  district: "",
  districtId: null as number | null,
  latLong: "",
  address: "",
  contactName: "",
  contactPhone: "",
  contactWebsite: "",
  contactEmail: "",
  isEnabled: true
};

// Hospital Form Payload
export const HOSPITAL_FORM_PAYLOAD = {
  name: "",
  descriptions: "",
  state: "",
  stateId: null as number | null,
  district: "",
  districtId: null as number | null,
  city: "",
  latLong: "",
  address: ""
};

// Helper function to get payload by centre type
export const getFormPayload = (centreType: string) => {
  switch (centreType) {

    case "ngos":
      return { ...NGO_FORM_PAYLOAD };
    case "old_age_homes":
      return { ...HOSPITAL_FORM_PAYLOAD }; // Assuming same as hospital or create specific one
    default:
      return { ...HOSPITAL_FORM_PAYLOAD };
  }
};

// TypeScript types
export type NgoFormPayload = typeof NGO_FORM_PAYLOAD;
export type HospitalFormPayload = typeof HOSPITAL_FORM_PAYLOAD;