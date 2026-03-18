// services/batteryOptimization.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Linking, Platform } from 'react-native';

const BATTERY_GUIDE_SHOWN_KEY = 'hasShownBatteryGuide';

export const requestDisableBatteryOptimizations = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  return new Promise((resolve) => {
    Alert.alert(
      "Battery Optimization",
      "For continuous background tracking, FIELD TRACK needs to be exempted from battery optimization.\n\nPlease select 'Allow' in the next screen, then choose 'Unrestricted' or 'Don't optimize'.",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: () => resolve(false)
        },
        {
          text: "Continue",
          onPress: async () => {
            try {
              console.log("Opening battery optimization settings...");
              console.log("Package name:", Application.applicationId);
              
              let intentOpened = false;
              
              // METHOD 1: Direct battery optimization request
              try {
                await IntentLauncher.startActivityAsync(
                  IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                  {
                    data: 'package:' + Application.applicationId,
                    extra: {
                      'android.intent.extra.PACKAGE_NAME': Application.applicationId,
                    },
                  }
                );
                intentOpened = true;
                console.log("✅ Method 1 executed");
                
                // Show instructions immediately since the intent might not show UI
                Alert.alert(
                  "📋 Next Step",
                  "Please look for the battery optimization settings screen.\n\n" +
                  "If no screen appeared:\n\n" +
                  "1️⃣ Go to Settings > Apps > FIELD TRACK\n" +
                  "2️⃣ Tap on 'Battery'\n" +
                  "3️⃣ Select 'Unrestricted'",
                  [
                    { 
                      text: "Open Settings", 
                      onPress: () => {
                        // Open app settings directly
                        IntentLauncher.startActivityAsync(
                          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
                          {
                            data: 'package:' + Application.applicationId,
                          }
                        ).catch(() => Linking.openSettings());
                      }
                    },
                    { text: "OK" }
                  ]
                );
                
              } catch (error1) {
                console.log("❌ Method 1 failed:", error1);
              }
              
              // METHOD 2: Open app settings directly
              if (!intentOpened) {
                try {
                  await IntentLauncher.startActivityAsync(
                    IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
                    {
                      data: 'package:' + Application.applicationId,
                    }
                  );
                  intentOpened = true;
                  console.log("✅ Method 2: Opened app settings");
                  
                  setTimeout(() => {
                    Alert.alert(
                      "📋 Instructions",
                      "In App settings:\n\n" +
                      "1️⃣ Tap on 'Battery'\n" +
                      "2️⃣ Tap on 'Battery optimization'\n" +
                      "3️⃣ Select 'Don't optimize' or 'Unrestricted'",
                      [{ text: "Got it" }]
                    );
                  }, 2000);
                  
                } catch (error2) {
                  console.log("❌ Method 2 failed:", error2);
                }
              }
              
              // METHOD 3: Open main settings as last resort
              if (!intentOpened) {
                try {
                  await Linking.openSettings();
                  intentOpened = true;
                  console.log("✅ Method 3: Opened main settings");
                  
                  setTimeout(() => {
                    Alert.alert(
                      "📋 Instructions",
                      "Please manually:\n\n" +
                      "1️⃣ Go to Settings > Apps > FIELD TRACK\n" +
                      "2️⃣ Tap on 'Battery'\n" +
                      "3️⃣ Select 'Unrestricted'",
                      [{ text: "Got it" }]
                    );
                  }, 2000);
                  
                } catch (error3) {
                  console.log("❌ Method 3 failed:", error3);
                }
              }
              
              // If all methods failed
              if (!intentOpened) {
                Alert.alert(
                  "Manual Setup Required",
                  "Please manually disable battery optimization:\n\n" +
                  "1️⃣ Open Settings\n" +
                  "2️⃣ Go to Apps > FIELD TRACK\n" +
                  "3️⃣ Tap 'Battery'\n" +
                  "4️⃣ Select 'Unrestricted'",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => Linking.openSettings() }
                  ]
                );
              }
              
              await AsyncStorage.setItem(BATTERY_GUIDE_SHOWN_KEY, 'true');
              resolve(true);
              
            } catch (error) {
              console.log('💥 All methods failed:', error);
              
              Alert.alert(
                "Manual Setup Required",
                "Please manually disable battery optimization:\n\n" +
                "1️⃣ Open Settings\n" +
                "2️⃣ Go to Apps > FIELD TRACK\n" +
                "3️⃣ Tap 'Battery'\n" +
                "4️⃣ Select 'Unrestricted'",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Open Settings", onPress: () => Linking.openSettings() }
                ]
              );
              resolve(false);
            }
          }
        }
      ]
    );
  });
};

export const showBatteryOptimizationGuide = () => {
  if (Platform.OS !== 'android') return;

  Alert.alert(
    "Enable Background Tracking",
    "Please disable battery optimization for FIELD TRACK:\n\n" +
     "1️⃣ Go to Settings > Apps > FIELD TRACK\n" +
    "2️⃣ Scroll down to 'Advanced' or 'Unused app settings'\n" +
    "3️⃣ Tap on 'Manage/Pause app if unused'\n" +
    "4️⃣ Toggle it OFF",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Open Settings", 
        onPress: () => {
          IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
            {
              data: 'package:' + Application.applicationId,
            }
          ).catch(() => Linking.openSettings());
        }
      }
    ]
  );
};

export const shouldShowBatteryGuide = async (): Promise<boolean> => {
  try {
    const hasShown = await AsyncStorage.getItem(BATTERY_GUIDE_SHOWN_KEY);
    return !hasShown;
  } catch {
    return true;
  }
};

export const resetBatteryGuide = async (): Promise<void> => {
  await AsyncStorage.removeItem(BATTERY_GUIDE_SHOWN_KEY);
};