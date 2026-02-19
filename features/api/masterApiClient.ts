import { store } from "@/store/index";
import axios from "axios";
import { ENDPOINTS } from "./endpoints";

const apiClient = axios.create({
  baseURL: "http://43.230.203.249:89",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Attach Bearer Token Automatically
 */
apiClient.interceptors.request.use(
  (config) => {
    // const token = store.getState().auth.token;
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;

export const stateDropDown = async () => {
  const { data } = await apiClient.get(
    `${ENDPOINTS.ElderDropdown.STATE_DROPDOWN}`,
  );

  return data;
};

export const districtDropDown = async (id: number) => {
  const { data } = await apiClient.get(
    `${ENDPOINTS.ElderDropdown.DISTRICT_DROPDOWN}/${id}`,
  );
  return data;
};
