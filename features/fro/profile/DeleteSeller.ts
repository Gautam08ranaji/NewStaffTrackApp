import { apiRequest } from "@/features/api/callApi";

interface DeleteClientParams {
  id: number;
  token: string;
  csrfToken: string;
}

export const deleteClient = async ({
  id,
  token,
  csrfToken,
}: DeleteClientParams) => {
  try {
    const response = await apiRequest({
      url: `Contact/DeleteClient?Id=${id}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-TOKEN": csrfToken,
        accept: "application/json",
      },
    });

    return response;
  } catch (error: any) {
    console.error("Delete Client API Error:", error);

    return {
      success: false,
      message: error?.message || "Failed to delete client",
    };
  }
};