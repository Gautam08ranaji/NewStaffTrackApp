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

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;

    private String userId;
    private String token;
    private String csrf;
    private String name;

    private SharedPreferences prefs;

    // ✅ Latest location cache
    private volatile double lastLat = 0;
    private volatile double lastLng = 0;
    private volatile boolean hasLocation = false;

    // ✅ Timer
    private Handler handler;
    private Runnable apiRunnable;

    @Override
    public void onCreate() {
        super.onCreate();

        Log.d(TAG, "🚀 Service Created (Timer Based)");

        prefs = getSharedPreferences("TRACK_PREF", MODE_PRIVATE);

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
        } else {
            userId = prefs.getString("userId", null);
            token = prefs.getString("token", null);
            csrf = prefs.getString("csrf", null);
            name = prefs.getString("name", null);
        }

        startLocationUpdates();
        startApiTimer(); // ✅ start exact timer

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

        super.onDestroy();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.d(TAG, "⚠️ App removed → restarting service");

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

    // ✅ LOCATION (fast updates)
    private void startLocationUpdates() {

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "❌ LOCATION PERMISSION NOT GRANTED");
            return;
        }

        LocationRequest request = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                30000 // 30 sec
        ).setMinUpdateIntervalMillis(10000)
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

                    Log.d(TAG, "📍 Cached Location: " + lastLat + ", " + lastLng);
                }
            }
        };

        fusedLocationClient.requestLocationUpdates(
                request,
                locationCallback,
                Looper.getMainLooper()
        );
    }

    // ✅ EXACT TIMER (every 1 min)
    private void startApiTimer() {

        apiRunnable = new Runnable() {
            @Override
            public void run() {

                if (hasLocation) {
                    Log.d(TAG, "⏱ Timer triggered → Sending API");
                    sendLocationToServer(lastLat, lastLng);
                } else {
                    Log.d(TAG, "⏳ No location yet");
                }

                handler.postDelayed(this, API_INTERVAL);
            }
        };

        handler.postDelayed(apiRunnable, API_INTERVAL);
    }

    private void sendLocationToServer(double lat, double lng) {

        new Thread(() -> {
            try {

                if (userId == null || token == null) {
                    Log.e(TAG, "❌ Missing auth data");
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

                Log.d(TAG, "✅ API Response Code: " + responseCode);

                conn.disconnect();

            } catch (Exception e) {
                Log.e(TAG, "❌ API ERROR", e);
            }
        }).start();
    }

    private Notification createNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("FIELD TRACK")
                .setContentText("Tracking your location...")
                .setSmallIcon(android.R.drawable.ic_dialog_map)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Location Tracking",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Background location tracking");

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}