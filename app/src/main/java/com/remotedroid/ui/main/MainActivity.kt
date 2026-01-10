package com.remotedroid.ui.main

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.remotedroid.databinding.ActivityMainBinding
import com.remotedroid.ui.auth.AuthActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.buttonLogout.setOnClickListener {
            viewModel.signOut()
        }

        viewModel.isUserLoggedOut.observe(this) { isLoggedOut ->
            if (isLoggedOut) {
                startActivity(Intent(this, AuthActivity::class.java))
                finish()
            }
        }
        
        viewModel.userEmail.observe(this) { email ->
            binding.textViewUserInfo.text = "Logged in as: $email"
        }
    }
}
