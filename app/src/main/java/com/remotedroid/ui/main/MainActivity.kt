package com.remotedroid.ui.main

import android.Manifest
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.messaging.FirebaseMessaging
import com.remotedroid.R
import com.remotedroid.databinding.ActivityMainBinding
import com.remotedroid.service.DeviceAdmin
import com.remotedroid.service.PresenceService
import com.remotedroid.ui.auth.AuthActivity
import com.remotedroid.util.showToast
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import timber.log.Timber
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()

    @Inject
    lateinit var auth: FirebaseAuth

    private val requestNotificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            if (isGranted) {
                Timber.i("Notification permission granted.")
                checkDeviceRegistration()
            } else {
                showToast("Notification permission is required for remote commands.")
            }
        }

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let {
            Timber.i("File selected: %s", it)
            viewModel.uploadFile(contentResolver, it)
        }
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        observeViewModel()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                checkDeviceRegistration()
            } else {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        } else {
            checkDeviceRegistration()
        }
        checkDeviceAdmin()
    }

    private fun setupUI() {
        val user = auth.currentUser
        binding.textViewUserInfo.text = "Logged in as: ${user?.email ?: "Unknown"}"

        binding.buttonLogout.setOnClickListener {
            viewModel.signOut()
            stopService(Intent(this, PresenceService::class.java))
            val intent = Intent(this, AuthActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }

        binding.buttonUploadFile.setOnClickListener {
            filePickerLauncher.launch("*/*")
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.uploadStatus.collect { status ->
                when (status) {
                    is MainViewModel.UploadStatus.Success -> {
                        showToast("File uploaded successfully")
                    }
                    is MainViewModel.UploadStatus.Failure -> {
                        showToast("File upload failed: ${status.error}")
                        Timber.e(status.error, "File upload failed")
                    }
                    is MainViewModel.UploadStatus.Idle -> {
                        // Do nothing
                    }
                }
            }
        }
    }

    private fun checkDeviceRegistration() {
        lifecycleScope.launch {
            try {
                val fcmToken = FirebaseMessaging.getInstance().token.await()
                val deviceId =
                    Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
                viewModel.registerDeviceIfNeeded(deviceId, fcmToken)
                startPresenceService()
            } catch (e: Exception) {
                Timber.e(e, "Failed to get FCM token.")
                showToast("Failed to register device. Cannot get FCM token.")
            }
        }
    }

    private fun startPresenceService() {
        val intent = Intent(this, PresenceService::class.java)
        startService(intent)
    }

    private fun checkDeviceAdmin() {
        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val deviceAdmin = ComponentName(this, DeviceAdmin::class.java)
        if (!dpm.isAdminActive(deviceAdmin)) {
            MaterialAlertDialogBuilder(this)
                .setTitle("Device Admin Required")
                .setMessage(getString(R.string.device_admin_description))
                .setPositiveButton("Enable") { _, _ ->
                    val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
                    intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, deviceAdmin)
                    intent.putExtra(
                        DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                        getString(R.string.device_admin_description)
                    )
                    startActivity(intent)
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }
}
