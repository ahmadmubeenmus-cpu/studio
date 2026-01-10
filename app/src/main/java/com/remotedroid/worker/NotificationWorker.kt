package com.remotedroid.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.remotedroid.data.model.DeviceNotification
import com.remotedroid.data.repository.NotificationRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@HiltWorker
class NotificationWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val notificationRepository: NotificationRepository
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return withContext(Dispatchers.IO) {
            try {
                val deviceId = inputData.getString(KEY_DEVICE_ID) ?: return@withContext Result.failure()
                val appName = inputData.getString(KEY_APP_NAME) ?: "Unknown App"
                val title = inputData.getString(KEY_TITLE) ?: ""
                val packageName = inputData.getString(KEY_PACKAGE_NAME) ?: ""

                val notification = DeviceNotification(
                    deviceId = deviceId,
                    appName = appName,
                    title = title,
                    appIcon = getAppIconIdentifier(packageName)
                )

                notificationRepository.syncNotification(notification).getOrThrow()

                Result.success()
            } catch (e: Exception) {
                Result.failure()
            }
        }
    }

    // This creates a placeholder identifier. The web frontend maps this to an actual image.
    private fun getAppIconIdentifier(packageName: String): String {
        return when {
            "com.google" in packageName -> "app-icon-1"
            "com.meta" in packageName || "com.facebook" in packageName -> "app-icon-2"
            else -> "app-icon-3"
        }
    }

    companion object {
        const val KEY_DEVICE_ID = "device_id"
        const val KEY_APP_NAME = "app_name"
        const val KEY_TITLE = "title"
        const val KEY_PACKAGE_NAME = "package_name"
    }
}
