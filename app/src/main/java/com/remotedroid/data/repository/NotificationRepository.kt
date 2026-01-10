package com.remotedroid.data.repository

import com.remotedroid.data.model.DeviceNotification
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

interface NotificationRepository {
    suspend fun syncNotification(notification: DeviceNotification): Result<Unit>
}

class NotificationRepositoryImpl @Inject constructor(
    private val firestore: FirebaseFirestore
) : NotificationRepository {

    override suspend fun syncNotification(notification: DeviceNotification): Result<Unit> {
        return try {
            firestore.collection("notifications").add(notification).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
