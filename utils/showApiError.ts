import { ApiError } from "@/features/api/callApi";
import { Alert } from "react-native";

export const showApiError = (error: ApiError) => {
  const title = error.status ? `Error ${error.status}` : "Error";

  let message = error.message;

  if (error.isNetworkError) {
    message = "Network error. Please check your internet connection.";
  }

  if (error.isTimeout) {
    message = "Request timeout. Please try again.";
  }

  Alert.alert(title, message, [{ text: "OK" }]);
};
