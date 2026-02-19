import { apiRequest } from "@/features/api/callApi";
import { AttendanceApiResponse } from "@/features/fro/types/attendance";

interface GetAttendanceParams {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
  token: string;
  csrfToken: string;
}

export const getAttendanceHistory = ({
  userId,
  pageNumber = 1,
  pageSize = 11,
  token,
  csrfToken,
}: GetAttendanceParams) => {
  return apiRequest<AttendanceApiResponse>({
    method: "GET",
    url: "/AttendanceHistory/GetAttendance/list",
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      UserId: userId,
    },
    headers: {
      Accept: "application/json",
      "X-CSRF-TOKEN": csrfToken,
      Authorization: `Bearer ${token}`,
    },
  });
};
