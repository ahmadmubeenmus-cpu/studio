package com.remotedroid.tools.command

import android.app.NotificationManager
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.media.AudioManager
import android.media.RingtoneManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import com.remotedroid.R
import com.remotedroid.tools.worker.LocationWorker
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CommandExecutor @Inject constructor(
    private val context: Context,
    private val devicePolicyManager: DevicePolicyManager,
    private val workManager: WorkManager
) {
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    suspend fun execute(command: Command) {
        try {
            when (command.type) {
                CommandType.RING -> ringDevice()
                CommandType.LOCK -> lockDevice()
                CommandType.NOTIFY -> showNotification(command.payload)
                CommandType.REFRESH -> { /* Refresh logic handled by device registration */ }
                CommandType.LOCATION -> requestLocation(command)
                CommandType.UNKNOWN -> Log.w(TAG, "Unknown command type received")
            }
            command.updateStatus(Command.Status.COMPLETED)
        } catch (e: Exception) {
            Log.e(TAG, "Error executing command: ${command.type}", e)
            command.updateStatus(Command.Status.FAILED, e.message)
        }
    }

    private fun ringDevice() {
        Log.d(TAG, "Executing RING command")
        val originalVolume = audioManager.getStreamVolume(AudioManager.STREAM_RING)
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING)
        audioManager.setStreamVolume(AudioManager.STREAM_RING, maxVolume, 0)

        val ringtone = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        val r = RingtoneManager.getRingtone(context, ringtone)
        r.play()

        // Stop ringing after 15 seconds and restore volume
        val handler = android.os.Handler(context.mainLooper)
        handler.postDelayed({
            if (r.isPlaying) {
                r.stop()
            }
            audioManager.setStreamVolume(AudioManager.STREAM_RING, originalVolume, 0)
        }, 15000)
    }

    private fun lockDevice() {
        Log.d(TAG, "Executing LOCK command")
        devicePolicyManager.lockNow()
    }

    private fun showNotification(payload: Map<String, String>?) {
        val title = payload?.get("title") ?: "RemoteDroid"
        val message = payload?.get("message") ?: "You've received a remote notification."
        Log.d(TAG, "Executing NOTIFY command with title: $title, message: $message")

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(context, context.getString(R.string.notification_channel_id))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun requestLocation(command: Command) {
        Log.d(TAG, "Executing LOCATION command")
        val locationWorkRequest = OneTimeWorkRequestBuilder<LocationWorker>()
            .setInputData(workDataOf("deviceId" to command.deviceId))
            .build()
        workManager.enqueue(locationWorkRequest)
    }

    companion object {
        private const val TAG = "CommandExecutor"
    }
}
