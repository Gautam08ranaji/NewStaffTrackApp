// services/autoRevokePermission.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform } from 'react-native';

const AUTO_REVOKE_GUIDE_SHOWN_KEY = 'hasShownAutoRevokeGuide';
const AUTO_REVOKE_REMINDER_COUNT_KEY = 'autoRevokeReminderCount';

// Check if auto-revoke is enabled (Android 11+)
export const checkAutoRevokeStatus = async (): Promise<{
  isEnabled: boolean;
  status: 'enabled' | 'disabled' | 'unknown' | 'unsupported';
  message: string;
}> => {
  if (Platform.OS !== 'android') {
    return { 
      isEnabled: false, 
      status: 'unsupported', 
      message: 'Not applicable on iOS' 
    };
  }

  try {
    // Since we can't directly check the status in Expo without native modules,
    // we'll use a heuristic approach:
    // - On Android 11+, auto-revoke is ENABLED by default for all apps
    // - Users must manually disable it
    
    // Get Android version
    const androidVersion = Platform.Version;
    
    if (androidVersion >= 30) { // Android 11+
      // Auto-revoke is enabled by default on Android 11+
      return {
        isEnabled: true, // Assume enabled until user disables
        status: 'enabled',
        message: 'Auto-revoke is enabled by default on your device. Please disable it for continuous tracking.'
      };
    } else {
      // Older Android versions don't have auto-revoke
      return {
        isEnabled: false,
        status: 'unsupported',
        message: 'Your Android version does not support auto-revoke permissions.'
      };
    }
  } catch (error) {
    console.log('Error checking auto-revoke status:', error);
    return {
      isEnabled: false,
      status: 'unknown',
      message: 'Could not determine auto-revoke status.'
    };
  }
};

// Open the exact auto-revoke settings screen for your app
export const openAutoRevokeSettings = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;
  
  try {
    console.log('Opening auto-revoke settings for:', Application.applicationId);
    
    // Try to open the specific auto-revoke settings screen (Android 11+)
    await IntentLauncher.startActivityAsync(
      'android.settings.APPLICATION_DETAILS_SETTINGS',
      {
        data: 'package:' + Application.applicationId,
        extra: {
          'android.intent.extra.PACKAGE_NAME': Application.applicationId,
          'android.provider.extra.APP_PACKAGE': Application.applicationId,
        },
      }
    );
    
    // After opening settings, show instructions
    setTimeout(() => {
      Alert.alert(
        "📋 Instructions",
        "In the app settings screen:\n\n" +
        "1️⃣ Scroll down to 'Advanced' section\n" +
        "2️⃣ Tap on 'Manage app if unused' or 'Unused app settings'\n" +
        "3️⃣ Toggle it OFF\n\n" +
        "This prevents Android from auto-revoking permissions.",
        [{ text: "Got it" }]
      );
    }, 2000);
    
    return true;
  } catch (error) {
    console.log('Could not open auto-revoke settings:', error);
    
    // Fallback to main app settings
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        {
          data: 'package:' + Application.applicationId,
        }
      );
      
      Alert.alert(
        "📋 Instructions",
        "In the app settings screen:\n\n" +
        "1️⃣ Scroll down to the bottom\n" +
        "2️⃣ Look for 'Manage app if unused' or 'Unused app settings'\n" +
        "3️⃣ Tap on it\n" +
        "4️⃣ Toggle it OFF",
        [{ text: "Got it" }]
      );
      
      return true;
    } catch (fallbackError) {
      console.log('Fallback settings also failed:', fallbackError);
      return false;
    }
  }
};

// Show guide with instructions
export const showAutoRevokeGuide = async (force = false): Promise<void> => {
  if (Platform.OS !== 'android') return;
  
  // Check if already shown (unless forced)
  if (!force) {
    const hasShown = await AsyncStorage.getItem(AUTO_REVOKE_GUIDE_SHOWN_KEY);
    if (hasShown) {
      // Check reminder count
      const reminderCount = await AsyncStorage.getItem(AUTO_REVOKE_REMINDER_COUNT_KEY);
      if (reminderCount && parseInt(reminderCount) >= 2) {
        return; // Don't show more than 2 times
      }
    }
  }
  
  Alert.alert(
    "🔋 Important: Auto-Revoke Settings",
    "Android may automatically remove permissions and hibernate apps that aren't used for a long time.\n\n" +
    "To ensure FIELD TRACK runs continuously in the background, please disable 'Manage app if unused':\n\n" +
    "1️⃣ Tap 'Open Settings' below\n" +
    "2️⃣ Scroll down to 'Advanced' section\n" +
    "3️⃣ Tap on 'Manage app if unused'\n" +
    "4️⃣ Toggle it OFF\n\n" +
    "This only takes 10 seconds and ensures reliable tracking!",
    [
      { 
        text: "Don't Show Again", 
        onPress: async () => {
          await AsyncStorage.setItem(AUTO_REVOKE_GUIDE_SHOWN_KEY, 'true');
          await AsyncStorage.setItem(AUTO_REVOKE_REMINDER_COUNT_KEY, '3');
        }
      },
      { 
        text: "Remind Later", 
        onPress: async () => {
          const currentCount = await AsyncStorage.getItem(AUTO_REVOKE_REMINDER_COUNT_KEY);
          const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
          await AsyncStorage.setItem(AUTO_REVOKE_REMINDER_COUNT_KEY, newCount.toString());
        },
        style: "cancel"
      },
      { 
        text: "Open Settings", 
        onPress: async () => {
          await openAutoRevokeSettings();
          // Mark as shown but user might need to come back
          await AsyncStorage.setItem(AUTO_REVOKE_GUIDE_SHOWN_KEY, 'true');
        }
      }
    ]
  );
};

// Reset all guide flags
export const resetAutoRevokeGuide = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTO_REVOKE_GUIDE_SHOWN_KEY);
  await AsyncStorage.removeItem(AUTO_REVOKE_REMINDER_COUNT_KEY);
  console.log('✅ Auto-revoke guide flags reset');
};

// Get current guide status
export const getAutoRevokeGuideStatus = async (): Promise<{
  hasShown: boolean;
  reminderCount: number;
}> => {
  const hasShown = await AsyncStorage.getItem(AUTO_REVOKE_GUIDE_SHOWN_KEY);
  const reminderCount = await AsyncStorage.getItem(AUTO_REVOKE_REMINDER_COUNT_KEY);
  
  return {
    hasShown: hasShown === 'true',
    reminderCount: reminderCount ? parseInt(reminderCount) : 0
  };
};

// Check if we should show the guide automatically
export const shouldShowAutoRevokeGuide = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;
  
  // Only show on Android 11+
  if (Platform.Version < 30) return false;
  
  const status = await getAutoRevokeGuideStatus();
  
  // Don't show if already shown
  if (status.hasShown) return false;
  
  // Don't show if reminded more than 2 times
  if (status.reminderCount >= 2) return false;
  
  return true;
};