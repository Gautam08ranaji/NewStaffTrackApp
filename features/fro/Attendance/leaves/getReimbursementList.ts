import { apiRequest } from "@/features/api/callApi";

type GetReimbursementListParams = {
  userId: string;
  pageNumber: number;
  pageSize: number;
  token: string;
  csrfToken?: string;
};

export const getReimbursementList = async ({
  userId,
  pageNumber,
  pageSize,
  token,
  csrfToken,
}: GetReimbursementListParams) => {
  return apiRequest({
    method: "GET",
    url: `/Reimbursement/GetReimbursementList`,
    params: {
      UserId: userId,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};