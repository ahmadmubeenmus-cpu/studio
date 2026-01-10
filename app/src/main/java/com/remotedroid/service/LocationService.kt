package com.remotedroid.service

import android.annotation.SuppressLint
import android.app.Notification
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.remotedroid.R
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class LocationService : Service() {

    @Inject
    lateinit var locationProviderClient: FusedLocationProviderClient

    @Inject
    lateinit var firestore: FirebaseFirestore

    private val cancellationTokenSource = CancellationTokenSource()

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val deviceId = intent?.getStringExtra("deviceId")
        if (deviceId.isNullOrEmpty()) {
            Log.e(TAG, "Device ID is null or empty. Stopping service.")
            stopSelf()
            return START_NOT_STICKY
        }

        startForeground(NOTIFICATION_ID, createNotification())
        requestLocationUpdate(deviceId)

        return START_NOT_STICKY
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, getString(R.string.location_notification_channel_id))
            .setContentTitle("Fetching Location")
            .setContentText("RemoteDroid is accessing your location.")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    @SuppressLint("MissingPermission")
    private fun requestLocationUpdate(deviceId: String) {
        Log.d(TAG, "Requesting current location...")
        locationProviderClient.getCurrentLocation(
            Priority.PRIORITY_HIGH_ACCURACY,
            cancellationTokenSource.token
        ).addOnSuccessListener { location ->
            if (location != null) {
                Log.d(TAG, "Location found: $location")
                saveLocationToFirestore(deviceId, location)
            } else {
                Log.w(TAG, "Failed to get location, it was null.")
                stopSelf()
            }
        }.addOnFailureListener { e ->
            Log.e(TAG, "Error getting location", e)
            stopSelf()
        }
    }

    private fun saveLocationToFirestore(deviceId: String, location: android.location.Location) {
        val locationData = hashMapOf(
            "lat" to location.latitude,
            "lng" to location.longitude,
            "accuracy" to location.accuracy,
            "timestamp" to FieldValue.serverTimestamp()
        )

        firestore.collection("locations").document(deviceId)
            .set(locationData)
            .addOnSuccessListener {
                Log.d(TAG, "Successfully wrote location to Firestore for device $deviceId")
                stopSelf()
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Error writing location to Firestore", e)
                stopSelf()
            }
    }

    override fun onDestroy() {
        super.onDestroy()
        cancellationTokenSource.cancel()
        Log.d(TAG, "LocationService destroyed.")
    }

    companion object {
        private const val TAG = "LocationService"
        private const val NOTIFICATION_ID = 2
    }
}
