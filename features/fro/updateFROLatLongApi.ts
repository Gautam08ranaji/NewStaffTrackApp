import { apiRequest } from "../api/callApi";
type UpdateLatLongParams = {
  ticketNumber: string;
  latitude: string;
  longitude: string;
  token: string;
  csrfToken?: string;
  name?: string;
  userId?: string;
};

export const updateFROLatLong = async ({
  ticketNumber,
  latitude,
  longitude,
  token,
  csrfToken,
  name,
  userId,
}: UpdateLatLongParams) => {
  const data = {
    tikcetNumber: ticketNumber, // backend spelling correct
    latitude,
    longitude,
    userId,
    name,
  };

  // 👉 Log payload you are sending
  // console.log(
  //   "Payload sent to UpdateFROLatLong API:",
  //   JSON.stringify(data, null, 2),
  // );

  return apiRequest({
    url: "/MobileApp/UpdateFROLatLong",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      silent: true,
    },
    data,
  });
};
