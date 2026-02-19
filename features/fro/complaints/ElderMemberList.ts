// features/user/userApi.ts
import { apiRequest } from "@/features/api/callApi";

type GetElderUserMemberListParams = {
  relatedToId: string;
  pageNumber?: number;
  pageSize?: number;
  token?: string;
  csrfToken?: string;
};

export const getElderUserMemberList = async ({
  relatedToId,
  pageNumber = 1,
  pageSize = 10,
  token,
  csrfToken,
}: GetElderUserMemberListParams) => {
  return apiRequest({
    method: "GET",
    url: `/MobileApp/GetElderUserMemberList`,
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      RelatedToId: relatedToId,
    },
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};
