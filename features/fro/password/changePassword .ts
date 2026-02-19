import { apiRequest } from "@/features/api/callApi";

export type ChangePasswordParams = {
  userId: string;
  oldPassword: string;
  newPassword: string;
  token: string;
  csrfToken?: string;
};

export const changePassword = async (params: ChangePasswordParams) => {
  const { userId, oldPassword, newPassword, token, csrfToken } = params;

  return apiRequest({
    method: "PUT",
    url: "/MobileApp/ChangePassword",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: {
      userId,
      oldPassword,
      newPassword,
    },
  });
};
