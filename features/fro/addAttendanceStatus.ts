// src/features/fro/addAttendance.ts

import { apiRequest } from "@/features/api/callApi";
import { AddAttendanceRequest } from "@/features/fro/types/attendance";

interface AddAttendanceParams {
  data: AddAttendanceRequest;
  token: string;
  csrfToken: string;
  checkInLocation:string
  checkOutLocation:string
  userId:string
}

export const addAttendance = ({
  data,
  token,
  csrfToken,
  checkInLocation,
  checkOutLocation,
  userId,
}: AddAttendanceParams) => {
  return apiRequest<void>({
    method: "POST",
    url: "/MobileApp/AddAttendance",
    data: {
      ...data,
      checkInLocation,
      checkOutLocation,
      userId,
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
      "X-CSRF-TOKEN": csrfToken,
      Authorization: `Bearer ${token}`,
    },
  });
};
