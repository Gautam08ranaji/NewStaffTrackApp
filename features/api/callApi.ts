import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { Alert } from "react-native";
import { baseUrl } from "./baseUrl.ts";

/* ================= AXIOS INSTANCE ================= */

export const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 20000,
});

/* ================= REQUEST INTERCEPTOR ================= */

apiClient.interceptors.request.use(
  (config) => {
    // Add token here if needed later
    return config;
  },
  (error) => Promise.reject(error),
);

/* ================= RESPONSE INTERCEPTOR ================= */

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const normalizedError = normalizeAxiosError(error);

    // 🔔 GLOBAL ALERT (status + message)
    const title = normalizedError.status
      ? `Error ${normalizedError.status}`
      : "Error";

    let message = normalizedError.message;

    if (normalizedError.isNetworkError) {
      message = "Network error. Please check your internet connection.";
    }

    if (normalizedError.isTimeout) {
      message = "Request timeout. Please try again.";
    }

    // 🔕 optional silent flag
    if (!(error.config?.headers as any)?.silent) {
      Alert.alert(title, message, [{ text: "OK" }]);
    }

    return Promise.reject(normalizedError);
  },
);

/* ================= ERROR NORMALIZER ================= */

export interface ApiError {
  status: number | null;
  message: string;
  data?: any;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

const normalizeAxiosError = (error: AxiosError): ApiError => {
  if (axios.isCancel(error)) {
    return {
      status: null,
      message: "Request cancelled",
    };
  }

  if (error.code === "ECONNABORTED") {
    return {
      status: null,
      message: "Request timeout. Please try again.",
      isTimeout: true,
    };
  }

  if (!error.response) {
    return {
      status: null,
      message: "Network error. Please check your internet connection.",
      isNetworkError: true,
    };
  }

  const { status, data } = error.response;

  return {
    status,
    message:
      (data as any)?.message ||
      (data as any)?.error ||
      (data as any)?.errors?.[0] ||
      getStatusMessage(status),
    data,
  };
};

/* ================= STATUS FALLBACK MESSAGES ================= */

const getStatusMessage = (status?: number): string => {
  switch (status) {
    case 400:
      return "Bad request";
    case 401:
      return "Unauthorized. Please login again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "Requested resource not found.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "Something went wrong.";
  }
};

/* ================= GENERIC API REQUEST ================= */

export const apiRequest = async <R = any>(
  config: AxiosRequestConfig,
): Promise<R> => {
  try {
    const response = await apiClient.request<R>(config);
    return response.data;
  } catch (error) {
    console.log("error", error);

    throw error as ApiError;
  }
};
