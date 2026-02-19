import { publicBaseQuery } from "@/features/api/baseapi";
import { createApi } from "@reduxjs/toolkit/query/react";

/* ---------- COMMON API RESPONSE ---------- */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
  errors: string[];
}

/* ---------- LOGIN REQUEST ---------- */
export interface LoginRequest {
  userName: string;
  password: string;
  latitude?: string;
  longitude?: string;
}

/* ---------- BACKEND ROLE TYPE ---------- */
export interface BackendUserRole {
  roleId: string;
  roleName: string;
  isSuperRole: boolean;
}

/* ---------- USER TYPE ---------- */
export interface LoginUser {
  userType: string;
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  bearerToken: string;
  isAuthenticated: boolean;
  isActive: boolean;
  profilePhoto: string | null;
  isSuperAdmin: boolean;
  claims: {
    claimType: string;
    claimValue: string;
  }[];
  userRoles: BackendUserRole[];
}

/* ---------- AUTH API ---------- */
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: publicBaseQuery, // 🔑 NO AUTH HEADER
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginUser>, LoginRequest>({
      query: (body) => ({
        url: "/Authentication",
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
        },
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
