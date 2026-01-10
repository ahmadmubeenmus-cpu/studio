package com.remotedroid.service

import android.app.Notification
import android.content.Context
import android.content.SharedPreferences
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.work.Constraints
import androidx.work.Data
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.remotedroid.worker.NotificationWorker
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class NotificationSyncService : NotificationListenerService() {

    @Inject lateinit var workManager: WorkManager
    private lateinit var prefs: SharedPreferences

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences("remotedroid_prefs", Context.MODE_PRIVATE)
    }
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        sbn ?: return

        // Ignore our own app's notifications and ongoing notifications
        if (sbn.packageName == applicationContext.packageName || sbn.isOngoing) {
            return
        }
        
        val deviceId = prefs.getString("device_id", null) ?: return
        val extras = sbn.notification.extras
        val title = extras.getString(Notification.EXTRA_TITLE) ?: return
        val appName = getAppName(sbn.packageName)

        val workData = Data.Builder()
            .putString(NotificationWorker.KEY_DEVICE_ID, deviceId)
            .putString(NotificationWorker.KEY_APP_NAME, appName)
            .putString(NotificationWorker.KEY_TITLE, title)
            .putString(NotificationWorker.KEY_PACKAGE_NAME, sbn.packageName)
            .build()
        
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val notificationWorkRequest = OneTimeWorkRequestBuilder<NotificationWorker>()
            .setInputData(workData)
            .setConstraints(constraints)
            .build()

        workManager.enqueue(notificationWorkRequest)
    }

    private fun getAppName(packageName: String): String {
        return try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName // Fallback to package name
        }
    }
}
