// features/user/userApi.ts
import { apiRequest } from "@/features/api/callApi";

type GetFROMonthPerformanceParams = {
  year: number;
  userId: string;
  token: string;
  csrfToken?: string;
};

export const getFROMonthCasePerformanceDayWise = async ({
  year,
  userId,
  token,
  csrfToken,
}: GetFROMonthPerformanceParams) => {
  return apiRequest({
    method: "GET",
    url: `/MobileApp/GetFROMonthCasePerformanceDayWise`,
    params: {
      Year: year,
      AssignToId: userId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};