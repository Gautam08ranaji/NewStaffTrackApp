package com.gautam1008.fieldtrack;

import android.Manifest;
import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.*;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class LocationForegroundService extends Service {

    private static final String TAG = "LocationService";
    private static final String CHANNEL_ID = "field_track_foreground_channel";

    private static final long API_INTERVAL = 60000; // 1 minute
    private static final long LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;

    private String userId;
    private String token;
    private String csrf;
    private String name;

    private SharedPreferences prefs;

    // Latest location cache
    private volatile double lastLat = 0;
    private volatile double lastLng = 0;
    private volatile boolean hasLocation = false;
    
    // Rate limiting for API calls (prevents duplicate calls)
    private volatile long lastApiCallTime = 0;
    private volatile boolean isApiCallInProgress = false;

    // Timer
    private Handler handler;
    private Runnable apiRunnable;

    @Override
    public void onCreate() {
        super.onCreate();

        Log.d(TAG, "🚀 Service Created (Enhanced Timer Based)");

        prefs = getSharedPreferences("TRACK_PREF", MODE_PRIVATE);
        
        // Restore last API call time
        lastApiCallTime = prefs.getLong("lastApiCallTime", 0);

        createNotificationChannel();
        startForeground(9999, createNotification());

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        Log.d(TAG, "📡 onStartCommand called");

        if (intent != null && intent.getExtras() != null) {
            userId = intent.getStringExtra("userId");
            token = intent.getStringExtra("token");
            csrf = intent.getStringExtra("csrf");
            name = intent.getStringExtra("name");

            prefs.edit()
                    .putString("userId", userId)
                    .putString("token", token)
                    .putString("csrf", csrf)
                    .putString("name", name)
                    .apply();
                    
            Log.d(TAG, "✅ User data received: " + userId);
        } else {
            userId = prefs.getString("userId", null);
            token = prefs.getString("token", null);
            csrf = prefs.getString("csrf", null);
            name = prefs.getString("name", null);
            
            Log.d(TAG, "♻️ Restored user data: " + userId);
        }

        startLocationUpdates();
        startApiTimer();

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "🛑 Service Destroyed");

        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }

        if (handler != null && apiRunnable != null) {
            handler.removeCallbacks(apiRunnable);
        }
        
        // Save last API call time
        prefs.edit().putLong("lastApiCallTime", lastApiCallTime).apply();

        super.onDestroy();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.d(TAG, "⚠️ App removed from recent apps → restarting service");

        Intent restartServiceIntent = new Intent(getApplicationContext(), this.getClass());
        restartServiceIntent.setPackage(getPackageName());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(restartServiceIntent);
        } else {
            startService(restartServiceIntent);
        }

        super.onTaskRemoved(rootIntent);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    // Location updates - caches the latest location
    private void startLocationUpdates() {

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "❌ LOCATION PERMISSION NOT GRANTED");
            return;
        }

        LocationRequest request = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                LOCATION_UPDATE_INTERVAL
        ).setMinUpdateIntervalMillis(10000) // Don't update more than every 10 seconds
         .setMaxUpdateDelayMillis(0)
         .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult result) {
                if (result == null) return;

                for (Location location : result.getLocations()) {
                    lastLat = location.getLatitude();
                    lastLng = location.getLongitude();
                    hasLocation = true;

                    Log.d(TAG, "📍 Location cached: " + lastLat + ", " + lastLng);
                }
            }
        };

        try {
            fusedLocationClient.requestLocationUpdates(
                    request,
                    locationCallback,
                    Looper.getMainLooper()
            );
            Log.d(TAG, "✅ Location updates started");
        } catch (Exception e) {
            Log.e(TAG, "❌ Failed to start location updates", e);
        }
    }

    // Timer-based API calls with rate limiting
    private void startApiTimer() {
        apiRunnable = new Runnable() {
            @Override
            public void run() {
                if (hasLocation) {
                    Log.d(TAG, "⏱ Timer triggered - Checking rate limit");
                    sendLocationToServer(lastLat, lastLng);
                } else {
                    Log.d(TAG, "⏳ No location available yet");
                }
                
                // Schedule next run
                handler.postDelayed(this, API_INTERVAL);
            }
        };
        
        // Start timer after first interval
        handler.postDelayed(apiRunnable, API_INTERVAL);
        Log.d(TAG, "✅ API timer started with interval: " + API_INTERVAL + "ms");
    }

    // Send location to server with rate limiting
    private synchronized void sendLocationToServer(double lat, double lng) {
        
        long now = System.currentTimeMillis();
        
        // Check rate limit (prevent duplicate calls within same minute)
        if (lastApiCallTime > 0) {
            long timeSinceLastCall = now - lastApiCallTime;
            if (timeSinceLastCall < API_INTERVAL) {
                long secondsToWait = (API_INTERVAL - timeSinceLastCall) / 1000;
                Log.w(TAG, "⏳ Rate limit - Next API call in " + secondsToWait + " seconds");
                return;
            }
        }
        
        // Check if another API call is in progress
        if (isApiCallInProgress) {
            Log.w(TAG, "⏳ Previous API call still in progress");
            return;
        }

        // Update rate limiting
        isApiCallInProgress = true;
        lastApiCallTime = now;
        prefs.edit().putLong("lastApiCallTime", lastApiCallTime).apply();

        // Execute API call in background thread
        new Thread(() -> {
            try {
                if (userId == null || token == null) {
                    Log.e(TAG, "❌ Missing auth data - Cannot send location");
                    return;
                }

                Log.d(TAG, "📡 Sending location: " + lat + ", " + lng);

                URL url = new URL("http://43.230.203.249:89/api/FROUsersLocations/AddAndUpdateFROLocation");

                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Accept", "application/json");
                conn.setRequestProperty("Content-Type", "application/json-patch+json");
                conn.setRequestProperty("Authorization", "Bearer " + token);
                conn.setRequestProperty("X-CSRF-TOKEN", csrf != null ? csrf : "");

                conn.setConnectTimeout(20000);
                conn.setReadTimeout(20000);
                conn.setDoOutput(true);

                String json = "{"
                        + "\"name\":\"" + (name != null ? name : "User") + "\","
                        + "\"latitute\":\"" + lat + "\","
                        + "\"longititute\":\"" + lng + "\","
                        + "\"discriptions\":\"Auto update\","
                        + "\"froPinLocation\":\"Auto update\","
                        + "\"userId\":\"" + userId + "\""
                        + "}";

                OutputStream os = conn.getOutputStream();
                os.write(json.getBytes("UTF-8"));
                os.close();

                int responseCode = conn.getResponseCode();

                if (responseCode == 200) {
                    Log.d(TAG, "✅ Location sent successfully - Response: " + responseCode);
                } else {
                    Log.w(TAG, "⚠️ Server response: " + responseCode);
                }

                conn.disconnect();

            } catch (Exception e) {
                Log.e(TAG, "❌ API Error: " + e.getMessage());
            } finally {
                isApiCallInProgress = false;
            }
        }).start();
    }

    private Notification createNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("FIELD TRACK")
                .setContentText("Tracking your location...")
                .setSmallIcon(android.R.drawable.ic_dialog_map)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH);
        
        // Add location info to notification (optional)
        if (hasLocation) {
            builder.setContentText("Location: " + lastLat + ", " + lastLng);
        }
        
        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Location Tracking",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Background location tracking for FIELD TRACK app");
            channel.setSound(null, null); // Silent notifications

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}