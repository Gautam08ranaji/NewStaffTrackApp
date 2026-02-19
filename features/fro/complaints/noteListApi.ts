import { apiRequest } from "@/features/api/callApi";

/* ================= API CONTEXT ================= */

export interface ApiAuthContext {
  bearerToken: string;
  antiForgeryToken: string;
}

/* ================= PARAM TYPES ================= */

interface GetNotesRecordListParams {
  auth: ApiAuthContext;
  relatedToId: string; // ✅ maps to RelatedToId
  pageNumber?: number;
  pageSize?: number;
}

/* ================= API FUNCTION ================= */

export const getNotesRecordList = ({
  auth,
  relatedToId,
  pageNumber = 1,
  pageSize = 11,
}: GetNotesRecordListParams) => {
  return apiRequest({
    method: "GET",
    url: "/MobileApp/GetNotesRecordList",
    headers: {
      Authorization: `Bearer ${auth.bearerToken}`,
      "X-CSRF-TOKEN": auth.antiForgeryToken,
      Accept: "application/json",
    },
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      RelatedToId: relatedToId,
    },
  });
};
