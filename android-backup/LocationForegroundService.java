package com.gautam1008.fieldtrack;

import android.Manifest;
import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
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

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;

    private String userId;
    private String token;
    private String csrf;
    private String name;

    private SharedPreferences prefs;

    @Override
    public void onCreate() {
        super.onCreate();

        Log.d(TAG, "🚀 Service Created");

        prefs = getSharedPreferences("TRACK_PREF", MODE_PRIVATE);

        createNotificationChannel();
        startForeground(9999, createNotification());

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        Log.d(TAG, "📡 onStartCommand called");

        if (intent != null && intent.getExtras() != null) {
            userId = intent.getStringExtra("userId");
            token = intent.getStringExtra("token");
            csrf = intent.getStringExtra("csrf");
            name = intent.getStringExtra("name");

            Log.d(TAG, "📦 Received from intent: " + userId);

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

            Log.d(TAG, "♻️ Restored from prefs: " + userId);
        }

        startLocationUpdates();

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "🛑 Service Destroyed");

        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
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

    private void startLocationUpdates() {

        Log.d(TAG, "🔥 startLocationUpdates called");

        // ✅ CRITICAL PERMISSION CHECK
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "❌ LOCATION PERMISSION NOT GRANTED");
            return;
        }

        if (locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }

        LocationRequest request = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                30000
        ).setMinUpdateIntervalMillis(5000).build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult result) {
                if (result == null) return;

                Log.d(TAG, "🔥 LOCATION CALLBACK TRIGGERED");

                for (Location location : result.getLocations()) {
                    double lat = location.getLatitude();
                    double lng = location.getLongitude();

                    Log.d(TAG, "📍 Location: " + lat + ", " + lng);

                    sendLocationToServer(lat, lng);
                }
            }
        };

        try {
            fusedLocationClient.requestLocationUpdates(
                    request,
                    locationCallback,
                    Looper.getMainLooper()
            );

            Log.d(TAG, "✅ Location updates requested");

        } catch (Exception e) {
            Log.e(TAG, "❌ Failed to request updates", e);
        }
    }

    private void sendLocationToServer(double lat, double lng) {

        new Thread(() -> {
            try {

                if (userId == null || token == null) {
                    Log.e(TAG, "❌ Missing auth data → skipping API");
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