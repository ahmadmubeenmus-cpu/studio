package com.remotedroid.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ServerValue
import com.google.firebase.database.ValueEventListener
import com.remotedroid.data.repository.DeviceRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class PresenceService : Service() {

    @Inject
    lateinit var database: FirebaseDatabase

    @Inject
    lateinit var auth: FirebaseAuth

    @Inject
    lateinit var deviceRepository: DeviceRepository

    private var valueEventListener: ValueEventListener? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val uid = auth.currentUser?.uid ?: return START_NOT_STICKY
        val deviceId = deviceRepository.getDeviceId()
        val myConnectionsRef = database.getReference("status").child(deviceId)
        val connectedRef = database.getReference(".info/connected")

        valueEventListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val connected = snapshot.getValue(Boolean::class.java) ?: false
                if (connected) {
                    val con = myConnectionsRef.push()
                    con.onDisconnect().removeValue()
                    myConnectionsRef.child("isOnline").setValue(true)
                    myConnectionsRef.child("lastSeen").setValue(ServerValue.TIMESTAMP)
                } else {
                     myConnectionsRef.child("isOnline").setValue(false)
                     myConnectionsRef.child("lastSeen").setValue(ServerValue.TIMESTAMP)
                }
            }
            override fun onCancelled(error: DatabaseError) {
                // Handle error
            }
        }

        connectedRef.addValueEventListener(valueEventListener as ValueEventListener)

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        valueEventListener?.let {
            database.getReference(".info/connected").removeEventListener(it)
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
