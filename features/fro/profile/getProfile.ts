// features/user/userApi.ts
import { apiRequest } from "@/features/api/callApi";

type GetUserDataByIdParams = {
  userId: string;
  token: string; // ✅ required
  csrfToken?: string; // ✅ optional
};

export const getUserDataById = async ({
  userId,
  token,
  csrfToken,
}: GetUserDataByIdParams) => {
  return apiRequest({
    method: "GET",
    url: `/MobileApp/GetUserDataById/${userId}`, // ✅ FIX
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      Accept: "application/json",
    },
  });
};
