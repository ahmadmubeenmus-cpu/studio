package com.remotedroid.di

import android.content.Context
import androidx.work.WorkManager
import com.remotedroid.data.repository.AuthRepository
import com.remotedroid.data.repository.AuthRepositoryImpl
import com.remotedroid.data.repository.CommandRepository
import com.remotedroid.data.repository.CommandRepositoryImpl
import com.remotedroid.data.repository.DeviceRepository
import com.remotedroid.data.repository.DeviceRepositoryImpl
import com.remotedroid.data.repository.FileRepository
import com.remotedroid.data.repository.FileRepositoryImpl
import com.remotedroid.data.repository.LocationRepository
import com.remotedroid.data.repository.LocationRepositoryImpl
import com.remotedroid.data.repository.NotificationRepository
import com.remotedroid.data.repository.NotificationRepositoryImpl
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()

    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore = FirebaseFirestore.getInstance()

    @Provides
    @Singleton
    fun provideFirebaseDatabase(): FirebaseDatabase = FirebaseDatabase.getInstance()

    @Provides
    @Singleton
    fun provideFirebaseStorage(): FirebaseStorage = FirebaseStorage.getInstance()

    @Provides
    @Singleton
    fun provideAuthRepository(
        auth: FirebaseAuth,
        firestore: FirebaseFirestore,
        googleSignInClient: GoogleSignInClient
    ): AuthRepository {
        return AuthRepositoryImpl(auth, firestore, googleSignInClient)
    }
    
    @Provides
    @Singleton
    fun provideDeviceRepository(
        firestore: FirebaseFirestore,
        database: FirebaseDatabase
    ): DeviceRepository {
        return DeviceRepositoryImpl(firestore, database)
    }

    @Provides
    @Singleton
    fun provideCommandRepository(firestore: FirebaseFirestore): CommandRepository {
        return CommandRepositoryImpl(firestore)
    }

    @Provides
    @Singleton
    fun provideLocationRepository(firestore: FirebaseFirestore): LocationRepository {
        return LocationRepositoryImpl(firestore)
    }
    
    @Provides
    @Singleton
    fun provideFileRepository(
        storage: FirebaseStorage,
        firestore: FirebaseFirestore,
        @ApplicationContext context: Context
    ): FileRepository {
        return FileRepositoryImpl(storage, firestore, context)
    }

    @Provides
    @Singleton
    fun provideNotificationRepository(firestore: FirebaseFirestore): NotificationRepository {
        return NotificationRepositoryImpl(firestore)
    }

    @Provides
    @Singleton
    fun provideGoogleSignInOptions(): GoogleSignInOptions {
        return GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken("951814716323-b8n2c4s5j8m9a7g2h3f5d4e3c2b1a0.apps.googleusercontent.com")
            .requestEmail()
            .build()
    }

    @Provides
    @Singleton
    fun provideGoogleSignInClient(
        @ApplicationContext context: Context,
        gso: GoogleSignInOptions
    ): GoogleSignInClient {
        return GoogleSignIn.getClient(context, gso)
    }

    @Provides
    @Singleton
    fun provideWorkManager(@ApplicationContext context: Context): WorkManager {
        return WorkManager.getInstance(context)
    }
}
