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
    url: "MobileApp/GetInteractionsListMobile",
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

  TaskstatusId: number;
  TaskstatusName: string;

  subStatusId: number;
  subStatusName: string;

  comment?: string;
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
    url: "MobileApp/UpdateInteractionMobile",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
    },
  });
};
