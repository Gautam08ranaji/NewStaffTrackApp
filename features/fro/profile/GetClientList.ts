import { apiRequest } from "@/features/api/callApi";

interface GetClientListParams {
  pageNumber: number;
  pageSize: number;
  token: string;
  csrfToken: string;
}

export const getClientList = async ({
  pageNumber,
  pageSize,
  token,
  csrfToken,
}: GetClientListParams) => {
  try {
    const response = await apiRequest({
      url: `Contact/GetClientList?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-TOKEN": csrfToken,
        accept: "application/json",
      },
    });

    return response;
  } catch (error: any) {
    console.error("Get Client List API Error:", error);

    // Normalize error message
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch client list";

    // Return a safe error structure so UI does not crash
    return {
      success: false,
      message,
      data: [],
    };
  }
};