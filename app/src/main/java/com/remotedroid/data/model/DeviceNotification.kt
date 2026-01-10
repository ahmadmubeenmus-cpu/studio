package com.remotedroid.data.model

import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class DeviceNotification(
    val deviceId: String = "",
    val appName: String = "",
    val title: String = "",
    val appIcon: String = "", // We can use the package name to find an icon later
    @ServerTimestamp
    val timestamp: Date? = null
)
