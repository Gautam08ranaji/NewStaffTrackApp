import { apiRequest } from "@/features/api/callApi";

/* ================= API CONTEXT ================= */

export interface ApiAuthContext {
  bearerToken: string;
  antiForgeryToken: string;
}

/* ================= PARAM TYPES ================= */

interface GetStaticListParams {
  endpoint: string;        // after /MobileApp
  auth: ApiAuthContext;
  userId: string;          // ✅ passed from screen
}

/* ================= API FUNCTION ================= */

export const getListStatic = ({
  endpoint,
  auth,
  userId,
}: GetStaticListParams) => {
  const finalUrl = `/MobileApp/${endpoint}`;

  const params = {
    PageNumber: 1,
    PageSize: 10,
    UserId: userId,
  };



  return apiRequest({
    url: finalUrl,
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.bearerToken}`,
      "X-CSRF-TOKEN": auth.antiForgeryToken,
      Accept: "application/json",
    },
    params,
  });
};
