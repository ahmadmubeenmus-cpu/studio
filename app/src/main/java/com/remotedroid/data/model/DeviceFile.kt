package com.remotedroid.data.model

import com.google.firebase.firestore.FieldValue

data class DeviceFile(
    val uid: String = "",
    val deviceId: String = "",
    val name: String = "",
    val size: Long = 0,
    val type: String = "",
    val storagePath: String = "",
    val uploadedAt: FieldValue? = null
)
