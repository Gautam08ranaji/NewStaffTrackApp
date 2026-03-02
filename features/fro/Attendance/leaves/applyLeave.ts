// features/leave/createLeave.ts
import { apiRequest } from "@/features/api/callApi";

type CreateLeaveParams = {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  userId: string;
  createdBy: string;
  createdByName: string;
  token: string;
  csrfToken?: string;
};

export const createLeave = async ({
  leaveType,
  fromDate,
  toDate,
  reason,
  userId,
  createdBy,
  createdByName,
  token,
  csrfToken,
}: CreateLeaveParams) => {
  return apiRequest({
    method: "POST",
    url: `/Leave/CreateLeave`,
    data: {
      leaveType,
      fromDate,
      toDate,
      reason,
      userId,
      createdBy,
      createdByName,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};