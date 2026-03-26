package com.gautam1008.fieldtrack;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {

            Log.d("BootReceiver", "🔥 Device rebooted → restarting service");

            SharedPreferences prefs = context.getSharedPreferences("TRACK_PREF", Context.MODE_PRIVATE);

            Intent serviceIntent = new Intent(context, LocationForegroundService.class);

            // ✅ PASS SAVED DATA
            serviceIntent.putExtra("userId", prefs.getString("userId", null));
            serviceIntent.putExtra("token", prefs.getString("token", null));
            serviceIntent.putExtra("csrf", prefs.getString("csrf", null));
            serviceIntent.putExtra("name", prefs.getString("name", null));

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
        }
    }
}