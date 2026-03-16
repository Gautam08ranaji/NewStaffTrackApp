import { apiRequest } from "@/features/api/callApi";

export interface AddClientPayload {
  name: string;
  pinCode: string;
  gender: string;
  stateId: number;
  stateName: string;
  districtId: number;
  districtName: string;
  pinLocation: string;
  mobileNo: string;
  emailId: string;
  alternateNo: string;
  address: string;
  userId: string;
  latitude: string;
  longitude: string;
  isMobileApp: string;
  productName: string;
}

interface AddClientParams {
  token: string;
  csrfToken: string;
  body: AddClientPayload;
  
  createdBy: string;
}

export const addClient = async ({
  token,
  csrfToken,
  body,
  createdBy,
}: AddClientParams) => {
  try {
    const response = await apiRequest({
      url: "Contact/AddClient",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-TOKEN": csrfToken,
        createdBy: createdBy,
        "Content-Type": "application/json-patch+json",
        accept: "application/json",
      },
      data: body,
    });

    return response;
  } catch (error) {
    console.error("Add Client API Error:", error);
    throw error;
  }
};