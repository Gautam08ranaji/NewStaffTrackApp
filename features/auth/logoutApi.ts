// app/services/logoutApi.ts
import { callApi } from "../api/apiClient";

export const logoutUser = (
  userId: string,
  bearerToken: string,
  antiForgeryToken: string
) => {
  return callApi({
    url: `/User/Logout/${userId}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "X-CSRF-TOKEN": antiForgeryToken,
    },
  });
};
