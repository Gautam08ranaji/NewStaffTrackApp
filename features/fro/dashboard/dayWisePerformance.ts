import { apiRequest } from "@/features/api/callApi";

type DayWiseParams = {
  Year: number;
  Month: string;
  AssignToId: string;
  token: string;
  csrfToken?: string;
};

export const getFROCasePerformanceDayWise = async ({
  Year,
  Month,
  AssignToId,
  token,
  csrfToken,
}: DayWiseParams) => {
  return apiRequest({
    url: `/MobileApp/GetFROCasePerformanceDayWise?Year=${Year}&Month=${Month}&AssignToId=${AssignToId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-CSRF-TOKEN": csrfToken || "",
      Accept: "application/json",
    },
  });
};