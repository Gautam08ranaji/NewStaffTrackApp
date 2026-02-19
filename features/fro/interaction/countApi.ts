// features/user/userApi.ts
import { apiRequest } from "@/features/api/callApi";

type GetDashCountParams = {
  userId: string;
  token: string;
  csrfToken?: string;
};

export const getDashCount = async ({
  userId,
  token,
  csrfToken,
}: GetDashCountParams) => {
  return apiRequest({
    method: "GET",
    url: `/MobileApp/GetInteractionAssignToIdWiseCount`,
    params: {
      assignToId: userId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};
