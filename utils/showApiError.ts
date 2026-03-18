import { logout } from "@/features/auth/authSlice";
import { router } from "expo-router";
import { Alert } from "react-native";


let isLoggingOut = false;

export const showApiError = (error: any) => {
  const status = error?.status;
  const title = status ? `Error ${status}` : "Error";

  let message = error?.message || "Something went wrong";

  // 🔐 401 / 440 → LOGOUT + REDIRECT
  if ((status === 401 || status === 440) && !isLoggingOut) {
    isLoggingOut = true;

    Alert.alert("Session Expired", "Please login again", [
      {
        text: "OK",
        onPress: () => {
           dispatch(logout());

          // ✅ IMPORTANT → replace, not push
          router.replace("/(onboarding)/login");

          isLoggingOut = false;
        },
      },
    ]);

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

  Alert.alert(title, message, [{ text: "OK" }]);
};

function dispatch(arg0: { payload: undefined; type: "auth/logout"; }) {
  throw new Error("Function not implemented.");
}
