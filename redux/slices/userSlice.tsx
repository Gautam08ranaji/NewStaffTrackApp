import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserStatus = 'Online' | 'Offline' | 'Busy';

export interface UserState {
  name: string;
  email: string;
  token: string;
  status: UserStatus;
  id: number;
  role: number;
  loginId: string; // ✅ should be string
  phone: string;
  mobileEnabled: string;
  enabled: string;
  VehicleNo:string;
  AccountId: number;
  AccountName: string;
}


const initialState: UserState = {
  name: '',
  email: '',
  token: '',
  status: 'Online', // default
  id: 0,
  role: 0,
  loginId: '',
  phone: '',
  mobileEnabled: '',
  enabled: '',
  VehicleNo: '',
  AccountId: 0,
  AccountName: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
    },
    setUserStatus: (state, action: PayloadAction<UserStatus>) => {
      state.status = action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser, setUserStatus } = userSlice.actions;
export default userSlice.reducer;
