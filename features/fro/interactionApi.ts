// features/interaction/interactionApi.ts
import { apiRequest } from "@/features/api/callApi";

type GetInteractionsParams = {
  pageNumber?: number;
  pageSize?: number;
  assignToId: string;
  token: string; // ✅ passed explicitly
  csrfToken?: string; // ✅ optional
};

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

export type UpdateInteractionPayload = {
  id: number;

  statusId: number;
  statusName: string;

  subStatusId: number;
  subStatusName: string;

  closeRemarks?: string;
  callBack?: string;
  assignToId?: string;
};

type UpdateInteractionParams = {
  data: UpdateInteractionPayload;
  token: string;
  csrfToken?: string;
};

export const updateInteraction = async ({
  data,
  token,
  csrfToken,
}: UpdateInteractionParams) => {
  return apiRequest({
    method: "PUT",
    // ✅ MATCHES cURL
    url: "MobileApp/UpdateTaskMobile",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
    },
  });
};
