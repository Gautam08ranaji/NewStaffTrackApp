// features/interaction/interactionApi.ts
import { apiRequest } from "@/features/api/callApi";

// ================= TYPES =================
type GetInteractionsParams = {
  pageNumber?: number;
  pageSize?: number;
  assignToId: string;
  token: string;
  csrfToken?: string;
};

export type UpdateInteractionPayload = {
  id: number;
  assignToId: string;
  assignToName: string; // Required field
  statusId: number;
  statusName: string;
  subStatusId: number;
  subStatusName: string;
  closeRemarks?: string;
  fosVisitDate?: string | null;
  brandName?: string;
  nextFollowupDate?: string | null;
  isNextFollowupStatus?: string;
  secondFollowupDate?: string | null;
  isSecondVisitStatus?: string;
  thirdFollowupDate?: string | null;
  isThirdVisitStatus?: string;
  categoryId?: number;
  categoryName?: string;
  productDiscount?: string; // Should be string with % sign, e.g., "10%"
  
  // These fields are NOT in the API based on your cURL
  // Remove them or mark as optional if they're not needed
  isSellerOutOfLocation?: string;
  isInterested?: string;
  sellerVisitDate?: string | null;
  
  // These are duplicate/mapped fields - keep only the ones above
  fosSecondVisitDate?: string | null;
  fosSecondVisitStatus?: string;
  fosThirdVisitDate?: string | null;
  fosThirdVisitStatus?: string;
  fosVisitStatus?: string;
  callBack?: string | null;
};

type UpdateInteractionParams = {
  data: UpdateInteractionPayload;
  token: string;
  csrfToken?: string;
};

// ================= API FUNCTIONS =================
export const getInteractionsListByAssignToId = async ({
  pageNumber = 1,
  pageSize = 10,
  assignToId,
  token,
  csrfToken,
}: GetInteractionsParams) => {
  return apiRequest({
    method: "GET",
    url: "MobileApp/GetTaskListMobile",
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      UserId: assignToId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      Accept: "application/json",
    },
  });
};

// In interactionApi.ts, make sure the update function properly formats the data
export const updateInteraction = async ({
  data,
  token,
  csrfToken,
}: UpdateInteractionParams) => {

  const payload = {
    id: data.id,
    assignToId: data.assignToId,
    assignToName: data.assignToName,
    statusId: data.statusId,
    statusName: data.statusName,
    subStatusId: data.subStatusId,
    subStatusName: data.subStatusName,
    closeRemarks: data.closeRemarks,
    fosVisitDate: data.fosVisitDate,
    brandName: data.brandName,
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    productDiscount: data.productDiscount,
  };

  console.log("📤 Update API Payload:", JSON.stringify(payload, null, 2));

  return apiRequest({
    method: "PUT",
    url: "MobileApp/UpdateTaskMobile",
    data: payload,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
    },
  });
};