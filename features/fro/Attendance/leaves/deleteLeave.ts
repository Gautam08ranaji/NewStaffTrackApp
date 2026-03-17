import axios from "axios";

export const deleteLeave = async (payload: any) => {
  try {
    const url = `http://43.230.203.249:89/api/Leave/DeleteLeave?Id=${payload.id}&DeletedBy=${payload.deletedBy}&DeletedByName=${encodeURIComponent(payload.deletedByName)}`;

    const res = await axios.delete(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${payload.token}`,
        "X-CSRF-TOKEN": payload.csrfToken,
      },
    });

    return res.data;
  } catch (error: any) {
    console.log("❌ Delete Leave API Error:", error?.response || error);
    throw error;
  }
};