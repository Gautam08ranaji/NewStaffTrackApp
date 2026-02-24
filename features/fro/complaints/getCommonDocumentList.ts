import { apiClient } from "@/features/api/callApi";

/* ---------- TYPES ---------- */

export interface CommonDocument {
  id: number;
  documentName: string;
  documentType: string;
  documentDescription: string;
  documentSize: number;
  documentExtension: string;
  createdDate: string;
}

export interface GetCommonDocumentListParams {
  pageNumber: number;
  pageSize: number;
  relatedToId: number;
  csrfToken: string;
  authToken: string;
}

interface GetCommonDocumentListResponse {
  success: boolean;
  data: {
    documentList: CommonDocument[];
    totalRecords: number;
  };
  statusCode: number;
  errors: string[];
}

/* ---------- API ---------- */

export const getCommonDocumentList = async (
  params: GetCommonDocumentListParams
): Promise<{
  list: CommonDocument[];
  totalRecords: number;
}> => {
  const response = await apiClient.get<GetCommonDocumentListResponse>(
    "/Common/GetCommonDocumentList",
    {
      params: {
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        RelatedToId: params.relatedToId,
      },
      headers: {
        accept: "application/json",
        "X-CSRF-TOKEN": params.csrfToken,
        Authorization: `Bearer ${params.authToken}`,
      },
    }
  );

  const apiData = response.data?.data;

  return {
    list: apiData?.documentList ?? [],
    totalRecords: apiData?.totalRecords ?? 0,
  };
};