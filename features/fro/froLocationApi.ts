import { AddOrUpdateFROLocationPayload } from "@/features/fro/types/froLocation";
import axios from "axios";

/* ================= ADD / UPDATE FRO LOCATION ================= */

export const addAndUpdateFROLocation = async (
  payload: AddOrUpdateFROLocationPayload,
) => {
  const response = await axios.post(
    "http://43.230.203.249:89/api/MobileApp/AddAndUpdateFROLocation", // ✅ FIXED
    payload,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json-patch+json", // ✅ FIXED
      },
      timeout: 20000,
    },
  );

  return response.data;
};
