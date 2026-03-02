// features/leave/getLeaveList.ts
import { apiRequest } from "@/features/api/callApi";

type GetLeaveListParams = {
  pageNumber: number;
  pageSize: number;
  userId: string;
  token: string;
  csrfToken?: string;
};

export const getLeaveList = async ({
  pageNumber,
  pageSize,
  userId,
  token,
  csrfToken,
}: GetLeaveListParams) => {
  return apiRequest({
    method: "POST",
    url: `/Leave/GetLeaveList`,
    data: {
      pageNumber,
      pageSize,
      userid: userId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};