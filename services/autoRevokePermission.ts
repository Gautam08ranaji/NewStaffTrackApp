import * as Application from "expo-application";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";

export const openAutoRevokeSettings = async (): Promise<boolean> => {
  if (Platform.OS !== "android") return false;

  try {
    await IntentLauncher.startActivityAsync(
      "android.settings.APPLICATION_DETAILS_SETTINGS",
      {
        data: "package:" + Application.applicationId,
      }
    );

    return true;
  } catch (error) {
    console.log("Auto revoke open failed:", error);
    return false;
  }
};