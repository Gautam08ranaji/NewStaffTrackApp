import { apiRequest } from "@/features/api/callApi";

interface GetClientByIdParams {
  id: number;
  token: string;
  csrfToken: string;
}

export const getClientDataById = async ({
  id,
  token,
  csrfToken,
}: GetClientByIdParams) => {
  try {
    const response = await apiRequest({
      url: `Contact/GetClientDataById/${id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-TOKEN": csrfToken,
        accept: "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Get Client Data API Error:", error);
    throw error;
  }
};