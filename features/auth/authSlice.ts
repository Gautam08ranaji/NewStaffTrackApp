// app/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "FRO" | "FRL";

interface AuthState {
  userId: string | null;
  token: string | null;
  role: UserRole | null;
  antiforgeryToken: string | null;
  firstName: string | null;
  lastName: string | null;
}

const initialState: AuthState = {
  userId: null,
  token: null,
  role: null,
  antiforgeryToken: null,
  firstName:  null,
  lastName:  null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        id: string;
        bearerToken: string;
        role: UserRole;
        antiforgeryToken?: string | null;
      }>,
    ) {
      state.userId = action.payload.id;
      state.token = action.payload.bearerToken;
      state.role = action.payload.role;
      state.antiforgeryToken = action.payload.antiforgeryToken ?? null;
    },

      
    setUserProfile(
      state,
      action: PayloadAction<{
        firstName: string;
        lastName: string;
      }>
    ) {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
    },

    logout(state) {
      state.userId = null;
      state.token = null;
      state.role = null;
      state.antiforgeryToken = null;
    },
  },
});

export const { setAuth, logout, setUserProfile } = authSlice.actions;
export default authSlice.reducer;
