// app/features/security/antiForgerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AntiForgeryState {
  antiforgeryToken: string | null;
}

const initialState: AntiForgeryState = {
  antiforgeryToken: null,
};

const antiForgerySlice = createSlice({
  name: "antiForgery",
  initialState,
  reducers: {
    setAntiForgeryToken: (state, action: PayloadAction<string>) => {
      state.antiforgeryToken = action.payload;
    },
  },
});

export const { setAntiForgeryToken } = antiForgerySlice.actions;
export default antiForgerySlice.reducer;
