package com.remotedroid.ui.main

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.remotedroid.databinding.ActivityMainBinding
import com.remotedroid.service.PresenceService
import com.remotedroid.ui.auth.AuthActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.user.observe(this) { user ->
            if (user == null) {
                startActivity(Intent(this, AuthActivity::class.java))
                finish()
            } else {
                binding.textViewUserInfo.text = "Logged in as: ${user.email}"
                lifecycleScope.launch {
                    viewModel.registerDevice()
                }
                startService(Intent(this, PresenceService::class.java))
            }
        }

        binding.buttonLogout.setOnClickListener {
            viewModel.logout()
            stopService(Intent(this, PresenceService::class.java))
        }
    }
}
