package com.gautam1008.fieldtrack;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.gautam1008.fieldtrack.LocationForegroundService;

public class ForegroundServiceModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "ForegroundServiceModule";
    private static ReactApplicationContext reactContext;

    public ForegroundServiceModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void startForegroundService(
            String userId,
            String token,
            String csrf,
            String name,
            Promise promise
    ) {
        try {
            Intent serviceIntent = new Intent(reactContext, LocationForegroundService.class);

            serviceIntent.putExtra("userId", userId);
            serviceIntent.putExtra("token", token);
            serviceIntent.putExtra("csrf", csrf);
            serviceIntent.putExtra("name", name);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }

            Log.d("ForegroundService", "✅ Service started");

            promise.resolve(true);

        } catch (Exception e) {
            Log.e("ForegroundService", "❌ Start failed", e);
            promise.reject("START_FAILED", e.getMessage());
        }
    }

    @ReactMethod
    public void stopForegroundService(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, LocationForegroundService.class);
            reactContext.stopService(serviceIntent);

            Log.d("ForegroundService", "Service stopped");

            promise.resolve(true);

        } catch (Exception e) {
            promise.reject("STOP_FAILED", e.getMessage());
        }
    }
}