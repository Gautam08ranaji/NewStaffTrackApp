// src/features/fro/addAttendance.ts

import { apiRequest } from "@/features/api/callApi";
import { AddAttendanceRequest } from "@/features/fro/types/attendance";

interface AddAttendanceParams {
  data: AddAttendanceRequest;
  token: string;
  csrfToken: string;
}

export const addAttendance = ({
  data,
  token,
  csrfToken,
}: AddAttendanceParams) => {
  return apiRequest<void>({
    method: "POST",
    url: "/MobileApp/AddAttendance",
    data,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
      "X-CSRF-TOKEN": csrfToken,
      Authorization: `Bearer ${token}`,
    },
  });
};
