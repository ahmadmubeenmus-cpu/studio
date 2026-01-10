package com.remotedroid.ui.main

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationManagerCompat
import com.remotedroid.R
import com.remotedroid.databinding.ActivityMainBinding
import com.remotedroid.service.DeviceAdmin
import com.remotedroid.ui.auth.AuthActivity
import com.remotedroid.ui.permissions.NotificationPermissionActivity
import dagger.hilt.android.AndroidEntryPoint
import com.google.android.material.snackbar.Snackbar

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            viewModel.uploadFile(it)
        }
    }

    private val notificationPermissionLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        updateUi()
    }
    
    private val deviceAdminLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        updateUi()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.registrationStatus.observe(this) { device ->
            binding.progressBar.visibility = View.GONE
            if (device != null) {
                binding.textViewDeviceInfo.text = "Device Registered: ${device.deviceName}"
            } else {
                 binding.textViewDeviceInfo.text = "Registering device..."
            }
        }

        viewModel.navigateToAuth.observe(this) {
            startActivity(Intent(this, AuthActivity::class.java))
            finish()
        }

        viewModel.uploadStatus.observe(this) { status ->
             Snackbar.make(binding.root, status, Snackbar.LENGTH_LONG).show()
        }

        binding.buttonLogout.setOnClickListener {
            viewModel.logout()
        }

        binding.buttonUploadFile.setOnClickListener {
            filePickerLauncher.launch("*/*")
        }

        binding.buttonEnableNotificationSync.setOnClickListener {
            if (!isNotificationServiceEnabled()) {
                val intent = Intent(this, NotificationPermissionActivity::class.java)
                notificationPermissionLauncher.launch(intent)
            } else {
                 Snackbar.make(binding.root, "Notification Sync is already enabled.", Snackbar.LENGTH_SHORT).show()
            }
        }
        
        binding.buttonEnableDeviceAdmin.setOnClickListener {
             if (!isDeviceAdminActive()) {
                val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                    putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, ComponentName(this@MainActivity, DeviceAdmin::class.java))
                    putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, getString(R.string.device_admin_description))
                }
                deviceAdminLauncher.launch(intent)
            } else {
                Snackbar.make(binding.root, "Device Admin is already enabled.", Snackbar.LENGTH_SHORT).show()
            }
        }

        updateUi()
    }

    private fun updateUi() {
        // Update Notification Sync Button
        if (isNotificationServiceEnabled()) {
            binding.buttonEnableNotificationSync.text = getString(R.string.notification_sync_enabled)
            binding.buttonEnableNotificationSync.isEnabled = false
        } else {
            binding.buttonEnableNotificationSync.text = getString(R.string.enable_notification_sync)
            binding.buttonEnableNotificationSync.isEnabled = true
        }

        // Update Device Admin Button
        if (isDeviceAdminActive()) {
            binding.buttonEnableDeviceAdmin.text = getString(R.string.device_admin_enabled)
            binding.buttonEnableDeviceAdmin.isEnabled = false
        } else {
            binding.buttonEnableDeviceAdmin.text = getString(R.string.enable_device_admin)
            binding.buttonEnableDeviceAdmin.isEnabled = true
        }
    }


    private fun isNotificationServiceEnabled(): Boolean {
        return NotificationManagerCompat.getEnabledListenerPackages(this)
            .contains(packageName)
    }
    
    private fun isDeviceAdminActive(): Boolean {
        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val componentName = ComponentName(this, DeviceAdmin::class.java)
        return dpm.isAdminActive(componentName)
    }
}
