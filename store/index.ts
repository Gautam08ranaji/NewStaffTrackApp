import userReducer from "@/redux/slices/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import { authApi } from "@/features/auth/authApi";
import authReducer from "@/features/auth/authSlice";
import { availabilityApi } from "@/features/availability/availabilityApi";
import antiForgeryReducer from "@/features/security/antiForgerySlice"; // ✅ ADD THIS

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // 👈 keep antiforgery in memory only (recommended)
};

const rootReducer = combineReducers({
  auth: authReducer,
  antiForgery: antiForgeryReducer,
  user: userReducer, // ✅ ADD THIS
  [authApi.reducerPath]: authApi.reducer,
  [availabilityApi.reducerPath]: availabilityApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware, availabilityApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
