package com.remotedroid.tools.worker

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import com.remotedroid.service.LocationService
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.delay

@HiltWorker
class LocationWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val deviceId = inputData.getString("deviceId")
        if (deviceId.isNullOrEmpty()) {
            Log.e(TAG, "Device ID is missing for LocationWorker")
            return Result.failure()
        }

        return try {
            val intent = Intent(context, LocationService::class.java).apply {
                putExtra("deviceId", deviceId)
            }
            context.startForegroundService(intent)
            Log.d(TAG, "Location service started")

            // Wait a bit for the service to start up and potentially get a location
            delay(30000) // 30 seconds timeout

            // The service will stop itself, but we can also stop it from here if needed
            // For now, assume the service manages its lifecycle.
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error starting location service", e)
            Result.failure()
        }
    }

    companion object {
        private const val TAG = "LocationWorker"
    }
}
