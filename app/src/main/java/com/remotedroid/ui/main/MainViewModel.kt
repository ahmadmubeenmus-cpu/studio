package com.remotedroid.ui.main

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.remotedroid.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _isUserLoggedOut = MutableLiveData<Boolean>()
    val isUserLoggedOut: LiveData<Boolean> = _isUserLoggedOut
    
    private val _userEmail = MutableLiveData<String>()
    val userEmail: LiveData<String> = _userEmail
    
    init {
        _userEmail.value = authRepository.currentUser?.email
    }

    fun signOut() {
        authRepository.signOut()
        _isUserLoggedOut.value = true
    }
}
