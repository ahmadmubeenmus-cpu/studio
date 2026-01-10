package com.remotedroid.ui.main

import androidx.lifecycle.ViewModel
import com.remotedroid.data.repository.AuthRepository
import com.remotedroid.data.repository.DeviceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val deviceRepository: DeviceRepository
) : ViewModel() {

    val user = authRepository.getUser()

    fun logout() {
        authRepository.logout()
    }
    
    suspend fun registerDevice(){
        deviceRepository.registerDevice()
    }
}
