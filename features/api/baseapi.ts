// app/api/baseApi.ts
import type { RootState } from "@/store";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../api/baseUrl.ts";

/* ---------------- PUBLIC APIs (No Token) ---------------- */
export const publicBaseQuery = fetchBaseQuery({
  baseUrl,
  headers: {
    accept: "application/json",
  },
});

/* ---------------- AUTH APIs (Bearer Token) ---------------- */
export const authBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("accept", "application/json");
    return headers;
  },

  responseHandler: async (response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return text;
    }
  },
});
