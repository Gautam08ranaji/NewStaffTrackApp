import { apiRequest } from "@/features/api/callApi";

type GetMedicationDetailsParams = {
  relatedToId: string;
  pageNumber?: number;
  pageSize?: number;
  token?: string;
  csrfToken?: string;
};

export const getMedicationDetails = async ({
  relatedToId,
  pageNumber = 1,
  pageSize = 10,
  token,
  csrfToken,
}: GetMedicationDetailsParams) => {
  return apiRequest({
    method: "GET",
    url: `/MobileApp/GetMedicationDetailsByRelatedToId`,
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      RelatedToId: relatedToId,
    },
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};
