import { apiRequest } from "@/features/api/callApi";

/* ================= TYPES ================= */

export interface AddNotesRecordPayload {
  relatedTo: string;
  relatedToId: number;
  relatedToName: string;
  noteType: string;
  noteDesc: string;
  createdBy: string;
  nextFollowUpDate: string; // ISO string
}

export interface ApiAuthContext {
  bearerToken: string;
  antiForgeryToken: string;
}

/* ================= API ================= */

export const addNotesRecord = ({
  payload,
  auth,
}: {
  payload: AddNotesRecordPayload;
  auth: ApiAuthContext;
}) => {
  return apiRequest({
    method: "POST",
    url: "/MobileApp/AddNotesRecord",
    headers: {
      Authorization: `Bearer ${auth.bearerToken}`,
      "X-CSRF-TOKEN": auth.antiForgeryToken,
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
    },
    data: payload,
  });
};
