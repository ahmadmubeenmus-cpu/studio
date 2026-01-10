package com.remotedroid.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.remotedroid.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject


data class AuthState(
    val isLoading: Boolean = false,
    val user: FirebaseUser? = null,
    val error: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState

    fun signInWithEmail(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            val result = authRepository.signInWithEmail(email, password)
            result.fold(
                onSuccess = { user -> _authState.value = AuthState(user = user) },
                onFailure = { e -> _authState.value = AuthState(error = e.message) }
            )
        }
    }
    
    fun signInWithGoogle(account: GoogleSignInAccount) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            val credential = GoogleAuthProvider.getCredential(account.idToken!!, null)
            val result = authRepository.signInWithGoogle(credential)
             result.fold(
                onSuccess = { user -> _authState.value = AuthState(user = user) },
                onFailure = { e -> _authState.value = AuthState(error = e.message) }
            )
        }
    }

    fun clearError() {
        _authState.value = _authState.value?.copy(error = null)
    }
}
