package com.remotedroid.ui.main

import android.content.ContentResolver
import android.net.Uri
import android.os.Build
import android.provider.OpenableColumns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.storage.FirebaseStorage
import com.remotedroid.data.model.Device
import com.remotedroid.data.model.DeviceFile
import com.remotedroid.util.NetworkUtil
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import timber.log.Timber
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val storage: FirebaseStorage,
    private val networkUtil: NetworkUtil
) : ViewModel() {

    sealed class UploadStatus {
        data object Idle : UploadStatus()
        data object Success : UploadStatus()
        data class Failure(val error: String) : UploadStatus()
    }

    private val _uploadStatus = MutableStateFlow<UploadStatus>(UploadStatus.Idle)
    val uploadStatus = _uploadStatus.asStateFlow()

    fun signOut() {
        auth.signOut()
    }

    fun registerDeviceIfNeeded(deviceId: String, fcmToken: String) {
        viewModelScope.launch(Dispatchers.IO) {
            val uid = auth.currentUser?.uid ?: return@launch
            val deviceRef = firestore.collection("devices").document(deviceId)

            try {
                val doc = deviceRef.get().await()
                if (!doc.exists()) {
                    Timber.i("Registering new device: %s", deviceId)
                    val device = Device(
                        uid = uid,
                        deviceName = "${Build.MANUFACTURER} ${Build.MODEL}",
                        model = Build.MODEL,
                        androidVersion = Build.VERSION.RELEASE,
                        fcmToken = fcmToken,
                        networkStatus = networkUtil.getNetworkStatus(),
                        createdAt = FieldValue.serverTimestamp()
                    )
                    deviceRef.set(device).await()
                    Timber.i("Device registered successfully.")
                } else {
                    // If device exists, update its FCM token and last seen status
                    Timber.i("Device already registered. Updating FCM token and presence.")
                    deviceRef.update(
                        mapOf(
                            "fcmToken" to fcmToken,
                            "isOnline" to true,
                            "lastSeen" to FieldValue.serverTimestamp()
                        )
                    ).await()
                }
            } catch (e: Exception) {
                Timber.e(e, "Failed to register or update device.")
            }
        }
    }


    fun uploadFile(contentResolver: ContentResolver, fileUri: Uri) {
        viewModelScope.launch(Dispatchers.IO) {
            val uid = auth.currentUser?.uid ?: return@launch
            val deviceId = networkUtil.getDeviceId()

            try {
                // Get file metadata
                val cursor = contentResolver.query(fileUri, null, null, null, null)
                val nameIndex = cursor?.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIndex = cursor?.getColumnIndex(OpenableColumns.SIZE)
                cursor?.moveToFirst()
                val fileName = nameIndex?.let { cursor.getString(it) } ?: "file_${UUID.randomUUID()}"
                val fileSize = sizeIndex?.let { cursor.getLong(it) } ?: 0
                val fileType = contentResolver.getType(fileUri) ?: "application/octet-stream"
                cursor?.close()

                // Upload to Storage
                val storagePath = "$uid/$deviceId/$fileName"
                val storageRef = storage.reference.child(storagePath)
                val inputStream = contentResolver.openInputStream(fileUri)
                inputStream?.let {
                    storageRef.putStream(it).await()
                    it.close()
                } ?: throw Exception("Could not open input stream for file URI")

                // Save metadata to Firestore
                val fileId = UUID.randomUUID().toString()
                val fileMetadata = DeviceFile(
                    uid = uid,
                    deviceId = deviceId,
                    name = fileName,
                    size = fileSize,
                    type = fileType,
                    storagePath = storagePath,
                    uploadedAt = FieldValue.serverTimestamp()
                )

                firestore.collection("files").document(fileId).set(fileMetadata).await()
                withContext(Dispatchers.Main) {
                    _uploadStatus.value = UploadStatus.Success
                    _uploadStatus.value = UploadStatus.Idle // Reset status
                }
                Timber.i("File uploaded and metadata saved: %s", fileName)

            } catch (e: Exception) {
                Timber.e(e, "Error uploading file")
                withContext(Dispatchers.Main) {
                    _uploadStatus.value = UploadStatus.Failure(e.message ?: "Unknown error")
                }
            }
        }
    }
}
