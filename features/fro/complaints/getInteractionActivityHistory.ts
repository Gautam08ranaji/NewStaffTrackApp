import { apiRequest } from "@/features/api/callApi";

type GetInteractionHistoryParams = {
  relatedToId: string;
  pageNumber?: number;
  pageSize?: number;
  token: string;
  csrfToken?: string;
};

export const getInteractionActivityHistory = async ({
  relatedToId,
  pageNumber = 1,
  pageSize = 10,
  token,
  csrfToken,
}: GetInteractionHistoryParams) => {
  return apiRequest({
    method: "GET",
    url: `/InteractionActivityHistory/GetInteractionActivityHistory/list`,
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      RelatedToId: relatedToId,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};
