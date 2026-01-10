package com.remotedroid.ui.main

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import com.remotedroid.databinding.ActivityMainBinding
import com.remotedroid.service.DeviceAdmin
import com.remotedroid.service.PresenceService
import com.remotedroid.ui.auth.AuthActivity
import com.remotedroid.ui.permissions.NotificationPermissionActivity
import dagger.hilt.android.AndroidEntryPoint
import java.io.File
import java.io.FileOutputStream

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let {
            val fileName = "upload_${System.currentTimeMillis()}"
            val tempFile = File(cacheDir, fileName)
            contentResolver.openInputStream(it)?.use { input ->
                FileOutputStream(tempFile).use { output ->
                    input.copyTo(output)
                }
            }
            viewModel.uploadFile(tempFile)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.user.observe(this) { user ->
            if (user != null) {
                binding.textViewUserInfo.text = "Logged in as: ${user.email}"
                viewModel.registerDevice(this)
                startPresenceService()
                checkDeviceAdminPermission()
            } else {
                startActivity(Intent(this, AuthActivity::class.java))
                finish()
            }
        }

        binding.buttonLogout.setOnClickListener {
            stopPresenceService()
            viewModel.logout()
        }
        
        binding.buttonUploadFile.setOnClickListener {
            filePickerLauncher.launch("*/*")
        }

        binding.buttonEnableNotificationSync.setOnClickListener {
            if (!isNotificationServiceEnabled()) {
                startActivity(Intent(this, NotificationPermissionActivity::class.java))
            } else {
                // Already enabled, maybe show a toast
            }
        }
    }
    
    private fun startPresenceService() {
        Intent(this, PresenceService::class.java).also { intent ->
            startService(intent)
        }
    }

    private fun stopPresenceService() {
        Intent(this, PresenceService::class.java).also { intent ->
            stopService(intent)
        }
    }

    private fun checkDeviceAdminPermission() {
        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val deviceAdmin = ComponentName(this, DeviceAdmin::class.java)
        if (!dpm.isAdminActive(deviceAdmin)) {
            val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, deviceAdmin)
                putExtra(DevicePolicy.EXTRA_ADD_EXPLANATION, "Required to remotely lock the device.")
            }
            startActivity(intent)
        }
    }

    private fun isNotificationServiceEnabled(): Boolean {
        val enabledListeners = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        val componentName = ComponentName(this, NotificationSyncService::class.java).flattenToString()
        return enabledListeners?.contains(componentName) == true
    }
}
