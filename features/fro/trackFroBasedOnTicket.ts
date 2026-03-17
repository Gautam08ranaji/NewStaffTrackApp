import axios from "axios";

export const createFROUsersTicketLocation = async (payload: any) => {
  try {
    const res = await axios.post(
      "http://43.230.203.249:89/api/FROUsersTicketLocation/AddFROUsersTicketLocation",
      {
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        description: payload.description,
        froPinLocation: payload.froPinLocation,
        froStatus: payload.froStatus,
        froStatusId: payload.froStatusId,
        ticketNumber: payload.ticketNumber,
        userId: payload.userId,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json-patch+json",
          Authorization: `Bearer ${payload.token}`,
          "X-CSRF-TOKEN": payload.csrfToken,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.log("❌ Create Ticket Location Error:", error?.response || error);
    throw error;
  }
};