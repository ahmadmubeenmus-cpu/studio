package com.remotedroid.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.google.firebase.firestore.FirebaseFirestore
import com.remotedroid.R
import kotlinx.coroutines.tasks.await

class CommandExecutor(
    private val context: Context,
    private val firestore: FirebaseFirestore
) {

    private val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    private val adminName = ComponentName(context, DeviceAdmin::class.java)

    suspend fun execute(commandId: String, type: String, data: Map<String, String>) {
        Log.d(TAG, "Executing command '$type' (ID: $commandId)")
        try {
            when (type) {
                "ring" -> ringDevice()
                "lock" -> lockDevice()
                "notify" -> showNotification(data)
                "refresh" -> refreshDeviceInfo()
                "location" -> requestLocation(commandId, data)
                else -> throw IllegalArgumentException("Unknown command type: $type")
            }
            updateCommandStatus(commandId, "completed")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to execute command '$type' (ID: $commandId)", e)
            updateCommandStatus(commandId, "failed", e.message)
        }
    }

    private fun ringDevice() {
        try {
            val ringtone = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            val r = RingtoneManager.getRingtone(context, ringtone)
            r.play()
            // In a real app, you'd want a way to stop this, perhaps with a foreground service and notification.
            // For now, it will play until stopped manually.
        } catch (e: Exception) {
            Log.e(TAG, "Failed to ring device", e)
            throw e
        }
    }

    private fun lockDevice() {
        if (dpm.isAdminActive(adminName)) {
            dpm.lockNow()
        } else {
            throw SecurityException("Device admin not active, cannot lock device.")
        }
    }
    
    private fun showNotification(data: Map<String, String>) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = context.getString(R.string.notification_channel_id)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                context.getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.notification_channel_description)
            }
            notificationManager.createNotificationChannel(channel)
        }
        
        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground) // Replace with a proper icon
            .setContentTitle(data["title"] ?: "Remote Notification")
            .setContentText(data["body"] ?: "You've received a remote message.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun refreshDeviceInfo() {
        // This is a placeholder. In a real app, you'd trigger a re-collection
        // of device info (battery, network, etc.) and update Firestore.
        Log.d(TAG, "Device info refresh triggered.")
    }
    
    private fun requestLocation(commandId: String, commandData: Map<String, String>) {
        val deviceId = commandData["deviceId"] ?: throw IllegalArgumentException("Missing deviceId for location request")

        val workData = Data.Builder()
            .putString(LocationWorker.KEY_DEVICE_ID, deviceId)
            .build()

        val locationWorkRequest = OneTimeWorkRequestBuilder<LocationWorker>()
            .setInputData(workData)
            .build()

        WorkManager.getInstance(context).enqueue(locationWorkRequest)
        Log.d(TAG, "Enqueued location worker for device $deviceId")
    }

    private suspend fun updateCommandStatus(commandId: String, status: String, failureReason: String? = null) {
        val update = mutableMapOf<String, Any>("status" to status)
        if (failureReason != null) {
            update["failureReason"] = failureReason
        }
        firestore.collection("commands").document(commandId)
            .update(update)
            .await()
        Log.d(TAG, "Updated command $commandId status to $status")
    }

    companion object {
        private const val TAG = "CommandExecutor"
    }
}
