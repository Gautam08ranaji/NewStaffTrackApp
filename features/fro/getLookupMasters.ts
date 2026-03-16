// features/common/getLookupMasters.ts

import { apiRequest } from "@/features/api/callApi";

type GetLookupMastersParams = {
  lookupType: string;
  token: string;
  csrfToken?: string;
};

export const getLookupMasters = async ({
  lookupType,
  token,
  csrfToken,
}: GetLookupMastersParams) => {
  return apiRequest({
    method: "GET",
    url: `/GetLookupMasters`,
    params: {
      lookupType,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};