// app/services/mobileAppMasterApi.ts

import { apiRequest } from "@/features/api/callApi";

/* ================= PAYLOAD TYPE (FRONTEND CLEAN) ================= */

export interface AddMobileAppMasterPayload {
  name: string;
  description: string;        // frontend clean
  state: string;
  stateId: number;
  district: string;           // frontend clean
  districtId: number;         // frontend clean
  city: string;
  latLong: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactWebsite: string;
  contactEmail: string;
  userId: string;
  isEnabled: boolean;
}

/* ================= PARAM TYPE ================= */

export interface AddMobileAppMasterParams {
  endpoint: string; // "AddNgoMaster" | "AddHospitalMaster" | etc.
  data: AddMobileAppMasterPayload;
  bearerToken: string;
  antiForgeryToken: string;
}

/* ================= PAYLOAD MAPPER (BACKEND FIX) ================= */

const mapMobileAppPayload = (data: AddMobileAppMasterPayload) => {
const mapped = {
  name: data.name,
  description: data.description,
  state: data.state,
  stateId: data.stateId,
  district: data.district,
  districtId: data.districtId,
  city: data.city,
  latLong: data.latLong,
  address: data.address,
  contactName: data.contactName,
  contactPhone: data.contactPhone,
  contactWebsite: data.contactWebsite,
  contactEmail: data.contactEmail,
  userId: data.userId,
  isEnabled: data.isEnabled,
};

  
  console.log('📦 [PAYLOAD MAPPING]', {
    original: data,
    mapped: mapped
  });
  
  return mapped;
};

/* ================= API FUNCTION ================= */

export const addMobileAppMaster = ({
  endpoint,
  data,
  bearerToken,
  antiForgeryToken,
}: AddMobileAppMasterParams) => {
  console.log('🔧 [API FUNCTION CALL]', {
    endpoint,
    hasBearerToken: !!bearerToken,
    hasAntiForgeryToken: !!antiForgeryToken,
    dataLength: JSON.stringify(data).length,
  });
  
  const payload = mapMobileAppPayload(data);
  
  return apiRequest({
    url: `/MobileApp/${endpoint}`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "X-CSRF-TOKEN": antiForgeryToken,
      "Content-Type": "application/json-patch+json",
      Accept: "application/json",
    },
    data: payload,
  });
};