import { apiRequest } from "@/features/api/callApi";

type UpdateUserPayload = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  address: string;
  isImageUpdate: boolean;
  imgSrc: string;
  userLevel: number;
  userLevelName: string;
  department: string;
  maxAssignInteraction: number;
  stateId: number;
  cityId: number;
  stateName: string;
  cityName: string;
  gender: string;
  pinCode: string;
  userType: string;
  userRoles: any[];
};

// features/user/userApi.ts

type UpdateUserParams = {
  data: UpdateUserPayload;
  token: string;
  csrfToken?: string;
};

export const updateUser = async ({
  data,
  token,
  csrfToken,
}: UpdateUserParams) => {
  return apiRequest({
    method: "PUT",
    url: "/MobileApp/UpdateUser",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
    },
    data,
  });
};
