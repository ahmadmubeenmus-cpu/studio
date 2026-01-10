package com.remotedroid.data.repository

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.messaging.FirebaseMessaging
import com.remotedroid.data.model.Device
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.tasks.await
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DeviceRepository @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth,
    private val messaging: FirebaseMessaging,
    @ApplicationContext private val context: Context
) {

    private val deviceId: String
        get() {
            val prefs = context.getSharedPreferences("device_prefs", Context.MODE_PRIVATE)
            var id = prefs.getString("device_id", null)
            if (id == null) {
                id = UUID.randomUUID().toString()
                prefs.edit().putString("device_id", id).apply()
            }
            return id
        }

    suspend fun registerDevice() {
        val uid = auth.currentUser?.uid ?: return
        val deviceDocRef = firestore.collection("devices").document(deviceId)

        try {
            val doc = deviceDocRef.get().await()
            if (!doc.exists()) {
                val fcmToken = messaging.token.await()
                val device = Device(
                    uid = uid,
                    deviceName = getDeviceName(),
                    model = Build.MODEL,
                    androidVersion = Build.VERSION.RELEASE,
                    battery = getBatteryLevel(),
                    networkStatus = getNetworkStatus(),
                    fcmToken = fcmToken,
                )
                deviceDocRef.set(device).await()
            }
        } catch (e: Exception) {
            // Handle error
        }
    }

    private fun getDeviceName(): String {
        return "${Build.MANUFACTURER} ${Build.MODEL}"
    }

    private fun getBatteryLevel(): Int {
        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

    private fun getNetworkStatus(): String {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return "Offline"
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return "Offline"

        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WiFi"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Cellular"
            else -> "Offline"
        }
    }

    fun getDeviceId(): String = deviceId

}
