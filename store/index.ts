// store/index.ts

import userReducer from "@/redux/slices/userSlice";
import loaderReducer from "@/store/loaderSlice";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import { authApi } from "@/features/auth/authApi";
import authReducer from "@/features/auth/authSlice";
import { availabilityApi } from "@/features/availability/availabilityApi";
import antiForgeryReducer from "@/features/security/antiForgerySlice";

/* ================= PERSIST CONFIG ================= */

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // persist only auth state
};

/* ================= ROOT REDUCER ================= */

const rootReducer = combineReducers({
  auth: authReducer,
  antiForgery: antiForgeryReducer,
  user: userReducer,
  loader: loaderReducer,

  // RTK Query reducers
  [authApi.reducerPath]: authApi.reducer,
  [availabilityApi.reducerPath]: availabilityApi.reducer,
});

/* ================= PERSISTED REDUCER ================= */

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ================= STORE ================= */

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(authApi.middleware)
      .concat(availabilityApi.middleware),
});

/* ================= PERSISTOR ================= */

export const persistor = persistStore(store);

/* ================= TYPES ================= */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;