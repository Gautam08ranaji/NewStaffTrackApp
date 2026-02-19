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
  fileData: string; // base64 string
  createdBy: string; // GUID
}

export const addCommonDocument = (
  payload: AddCommonDocumentPayload,
): Promise<AddCommonDocumentResponse> => {
  return apiRequest<AddCommonDocumentResponse>({
    url: "/MobileApp/AddCommonDocument",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    data: payload,
  });
};
