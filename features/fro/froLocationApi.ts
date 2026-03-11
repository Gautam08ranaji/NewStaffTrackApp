import { AddOrUpdateFROLocationPayload } from "@/features/fro/types/froLocation";
import axios from "axios";

/* ================= ADD / UPDATE FRO LOCATION ================= */

export const addAndUpdateFROLocation = async (
  payload: AddOrUpdateFROLocationPayload,
  token: string,
  csrfToken: string
) => {
  const response = await axios.post(
    "http://43.230.203.249:89/api/FROUsersLocations/AddAndUpdateFROLocation",
    payload,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json-patch+json",
        Authorization: `Bearer ${token}`,
        "X-CSRF-TOKEN": csrfToken,
      },
      timeout: 20000,
    }
  );

  return response.data;
};
