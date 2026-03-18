import { logout } from "@/features/auth/authSlice";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

let isLoggingOut = false;

export const showApiError = (
  error: any,
  dispatch: ThunkDispatch<any, any, AnyAction>
) => {
  const status = error?.status;

  let message = error?.message || "Something went wrong";

  // 🔐 401 / 440 → TOAST + LOGOUT + REDIRECT
  if ((status === 401 || status === 440) && !isLoggingOut) {
    isLoggingOut = true;

    Toast.show({
      type: "error",
      text1: "Session Expired",
      text2: "Please login again",
      visibilityTime: 2000,
    });

    setTimeout(() => {
      dispatch(logout());
      router.replace("/(onboarding)/login");
      isLoggingOut = false;
    }, 1500);

    return;
  }

  // 🌐 Network / Timeout
  if (error?.isNetworkError) {
    message = "No internet connection. Please check your network.";
  } else if (error?.isTimeout) {
    message = "Request timed out. Please try again.";
  }

  // ❌ Client Errors
  else if (status === 400) {
    message = error?.message || "Invalid request.";
  } else if (status === 403) {
    message = "You don’t have permission.";
  } else if (status === 404) {
    message = "Resource not found.";
  } else if (status === 409) {
    message = "Conflict occurred.";
  } else if (status === 422) {
    message = error?.message || "Validation failed.";
  }

  // 🚫 Rate limit
  else if (status === 429) {
    message = "Too many requests. Try again later.";
  }

  // 💥 Server Errors
  else if (status >= 500) {
    message = "Server error. Please try again later.";
  }

  // ✅ Default toast for ALL remaining cases
  Toast.show({
    type: "error",
    text1: "Error",
    text2: message,
    visibilityTime: 2500,
  });
};