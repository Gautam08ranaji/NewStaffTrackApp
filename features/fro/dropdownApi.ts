import { apiRequest } from "@/features/api/callApi";

/* ================= TYPES ================= */

export type DropdownItem = {
  id: string | number;
  name: string;
};

export type DropdownResponse<T = DropdownItem> = {
  success: boolean;
  data: T[];
};

/* ================= COMMON DROPDOWN ================= */

export const getDropdownByEndpoint = <T = DropdownItem>(
  endpoint: string,
  token: string,
  csrfToken?: string,
): Promise<DropdownResponse<T>> => {
  return apiRequest<DropdownResponse<T>>({
    method: "GET",
    url: `/Dropdown/${endpoint}`, // 👈 normalize here
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      accept: "application/json",
    },
  });
};

export const getDropdownByEndpointAndId = <T = DropdownItem>(
  endpoint: string, // e.g. "GetSubStatusMasterById"
  id: string | number, // e.g. 2
  token: string,
  csrfToken?: string,
): Promise<DropdownResponse<T>> => {
  return apiRequest<DropdownResponse<T>>({
    method: "GET",
    url: `/Dropdown/${endpoint}/${id}`,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      accept: "application/json",
    },
  });
};
