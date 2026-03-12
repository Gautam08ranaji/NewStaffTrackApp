import { apiRequest } from "@/features/api/callApi";

/* ---------- RESPONSE TYPE ---------- */
interface AddCommonDocumentResponse {
  success: boolean;
  message: string;
  data?: any;
}

/* ---------- PAYLOAD TYPE ---------- */
export interface AddCommonDocumentPayload {
  relatedTo: string;
  relatedToId: number;
  documentType: string;
  documentName: string;
  documentDescription: string;
  fileName: string;
  mimeType: string;
  fileData: string;
  ownerId: string;
  ownerName: string;
  createdBy: string;
  liveType?: string;
  liveStartTime?: string;
  liveEndTime?: string;
}

/* ---------- API FUNCTION ---------- */
export const addCommonDocument = (
  payload: AddCommonDocumentPayload,
  token: string,
  csrfToken: string
): Promise<AddCommonDocumentResponse> => {
  return apiRequest<AddCommonDocumentResponse>({
    url: "/Common/AddCommonDocument",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-CSRF-TOKEN": csrfToken,
      accept: "application/json",
      "Content-Type": "application/json-patch+json",
    },
    data: JSON.stringify(payload),
  });
};