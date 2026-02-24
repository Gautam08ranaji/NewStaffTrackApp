import { apiRequest } from "@/features/api/callApi";

interface AddCommonDocumentResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface AddCommonDocumentPayload {
  relatedTo: string;
  relatedToId: number;
  documentType: string;
  documentName: string;
  documentDescription: string;
  fileName: string;
  fileData: string;
  createdBy: string;
}

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
    data: JSON.stringify(payload), // ⭐ CRITICAL FIX
  });
};