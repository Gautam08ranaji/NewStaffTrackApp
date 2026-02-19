import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AvailabilityResponse, AvailabilityStatus } from "./types";

console.log("AVAILABILITY API BASE URL:", process.env.EXPO_PUBLIC_API_URL);

export const availabilityApi = createApi({
  reducerPath: "availabilityApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
  }),
  tagTypes: ["Availability"],
  endpoints: (builder) => ({
    getAvailability: builder.query<
      AvailabilityResponse,
      { userId: string; role: "FRO" | "FRL" }
    >({
      query: ({ userId, role }) =>
        `/availability?userId=${userId}&role=${role}`,
      providesTags: ["Availability"],
    }),

    updateAvailability: builder.mutation<
      AvailabilityResponse,
      {
        userId: string;
        role: "FRO" | "FRL";
        status: AvailabilityStatus;
      }
    >({
      query: (body) => ({
        url: "/availability",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Availability"],
    }),
  }),
});

export const { useGetAvailabilityQuery, useUpdateAvailabilityMutation } =
  availabilityApi;
