// app/api/apiClient.ts
import axios, { Method } from "axios";
import { baseUrl } from "./baseUrl.ts";

type ApiRequest<T = any> = {
  url: string;
  method?: Method;
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
};

export const callApi = async <R = any, T = any>({
  url,
  method = "GET",
  data,
  params,
  headers,
}: ApiRequest<T>): Promise<R> => {
  try {
    const response = await axios({
      baseURL: baseUrl,
      url,
      method,
      data,
      params,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      timeout: 20000,
    });

    return response.data;
  } catch (error: any) {
    throw {
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "API Error",
      data: error?.response?.data,
    };
  }
};
