import axios from "axios";

export const updateLeave = async (payload: any) => {
  try {
    const res = await axios.put(
      "http://43.230.203.249:89/api/Leave/UpdateLeave",
      {
        id: payload.id,
        leaveType: payload.leaveType,
        fromDate: payload.fromDate,
        toDate: payload.toDate,
        reason: payload.reason,
        status: payload.status,
        userId: payload.userId,
        modifiedBy: payload.modifiedBy,
        modifiedByName: payload.modifiedByName,
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
    console.log("❌ Update Leave API Error:", error?.response || error);
    throw error;
  }
};