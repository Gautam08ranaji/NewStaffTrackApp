package com.gautam1008.fieldtrack;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    
    private static final String TAG = "BootReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d(TAG, "📱 Boot completed - Restarting location service");
            
            // Get saved user data from SharedPreferences
            SharedPreferences prefs = context.getSharedPreferences("TRACK_PREF", Context.MODE_PRIVATE);
            
            String userId = prefs.getString("userId", null);
            String token = prefs.getString("token", null);
            String csrf = prefs.getString("csrf", null);
            String name = prefs.getString("name", null);
            
            // Only restart if we have the required data
            if (userId != null && token != null) {
                Intent serviceIntent = new Intent(context, LocationForegroundService.class);
                serviceIntent.putExtra("userId", userId);
                serviceIntent.putExtra("token", token);
                serviceIntent.putExtra("csrf", csrf);
                serviceIntent.putExtra("name", name);
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent);
                } else {
                    context.startService(serviceIntent);
                }
                
                Log.d(TAG, "✅ Service restarted for user: " + userId);
            } else {
                Log.w(TAG, "⚠️ No saved user data - Service not restarted");
            }
        }
    }
}