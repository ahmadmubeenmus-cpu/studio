package com.remotedroid.service

import android.util.Log
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.remotedroid.di.MainRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject


@AndroidEntryPoint
class FcmService : FirebaseMessagingService() {

    @Inject
    lateinit var repository: MainRepository

    private val job = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.IO + job)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Refreshed token: $token")
        Firebase.auth.currentUser?.uid?.let {
            scope.launch {
                repository.updateFcmToken(it, token)
            }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Log.d(TAG, "From: ${remoteMessage.from}")

        remoteMessage.data.isNotEmpty().let {
            Log.d(TAG, "Message data payload: " + remoteMessage.data)
            
            val commandType = remoteMessage.data["commandType"]
            val commandId = remoteMessage.data["commandId"]

            if (commandId == null || commandType == null) {
                Log.e(TAG, "Missing commandId or commandType in FCM message data.")
                return
            }
            
            scope.launch {
                val commandExecutor = CommandExecutor(applicationContext, Firebase.firestore)
                commandExecutor.execute(commandId, commandType, remoteMessage.data)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }

    companion object {
        private const val TAG = "FcmService"
    }
}
