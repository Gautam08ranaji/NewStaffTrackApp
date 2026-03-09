import { apiRequest } from "@/features/api/callApi";

type GetLeaveListParams = {
  PageNumber: number;
  PageSize: number;
  Userid: string;
  token: string;
  csrfToken?: string;
};

export const getLeaveList = async ({
  PageNumber,
  PageSize,
  Userid,
  token,
  csrfToken,
}: GetLeaveListParams) => {
  return apiRequest({
    url: "/Leave/GetLeaveList",
    method: "GET",
    params: {
      PageNumber,
      PageSize,
      Userid,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "X-CSRF-TOKEN": csrfToken || "",
      Accept: "application/json",
    },
  });
};