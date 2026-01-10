# RemoteDroid

RemoteDroid is a powerful, open-source solution for remotely managing your Android devices through a web-based dashboard. Built with Next.js, Firebase, and native Android (Kotlin), it provides a secure and real-time interface for device monitoring and control.

This project was bootstrapped and developed with **Firebase Studio**.

## Features

- **Device Management**: View a list of all your connected Android devices.
- **Real-time Status**: See the online/offline status, battery level, network state, and other details of your devices in real-time.
- **Remote Commands**: Send commands to your devices, including:
  - Ring Device: Make your device play its ringtone.
  - Lock Device: Remotely lock your device.
  - Show Notification: Send a custom push notification.
  - Request Location: Get a one-time location update.
- **Location Tracking**: View the last known location of your device on a map.
- **File Transfer**: Securely upload files from your device and browse them on the dashboard.
- **Notification Sync**: See a read-only log of recent notifications from your device.
- **Screen Mirroring**: Live-stream your device's screen to the web dashboard (user-initiated).

## Tech Stack

- **Web Dashboard**: Next.js, React, Tailwind CSS, ShadCN UI
- **Backend**: Firebase (Authentication, Firestore, Realtime Database, Storage, Cloud Functions)
- **Android App**: Kotlin, MVVM, Hilt, Coroutines, WorkManager, WebRTC
- **Generative AI**: Google Gemini (via Genkit) for potential future integrations.

## Setup Instructions

The project is configured to work out-of-the-box with Firebase Studio's integrated environment.

1.  **Firebase Project**: The project is pre-configured to use a Firebase project. All necessary services (Auth, Firestore, etc.) are provisioned automatically.
2.  **Android App**:
    *   Open the `android` folder in Android Studio.
    *   Build the project. The necessary `google-services.json` is configured via the environment.
    *   Run the app on a physical Android device.
3.  **Web Dashboard**:
    *   The Next.js app will run automatically in the development environment.
    *   Access the provided URL for the web dashboard.
    *   Create an account using the Sign-Up page.
4.  **Linking Device**:
    *   Log in to the Android app using the same credentials you created on the web dashboard.
    *   The device will automatically register itself and appear on the dashboard.

## Test Credentials

You can create your own test account:
1.  Navigate to the web dashboard's `/signup` page.
2.  Register a new user with any email and password.
3.  Log in to both the web dashboard and the Android app with these credentials.

## Known Limitations

- **Screen Mirroring**: The WebRTC-based screen mirroring is a proof-of-concept. It may have latency and is dependent on network conditions. It does not currently support sending touch/input events back to the device.
- **Scalability**: The default Cloud Functions and Firebase setup is suitable for personal use or small-scale deployments. For large-scale use, you may need to optimize Firestore queries and function configurations.
- **Error Handling**: While core error handling is in place, UI feedback for all edge-case failures (e.g., network loss during a command) could be more robust.
- **Session Management**: WebRTC signaling is basic. In a production environment, a more robust signaling server (e.g., running on a dedicated instance) would be recommended over the current Cloud Function implementation.

## Privacy & Data Usage (For Your Privacy Policy)

RemoteDroid is designed with user privacy and control in mind. Here is a description of the data collected and why:

- **User Account Information**: We use Firebase Authentication to manage your account. We store your email, a unique user ID (UID), and optionally your display name and photo URL. This is used solely for authentication and to associate devices with your account.

- **Device Information**: Upon registration, the app collects your device's name, model, and Android OS version. This information is displayed on your dashboard to help you identify your devices.

- **Device Status**: The app collects and transmits battery level, network status (WiFi/Cellular), and online presence. This data is shown on your dashboard to provide a real-time overview of your device's state. No historical status data is stored, except for the `lastSeen` timestamp.

- **Location Data**: Location is **only** retrieved when you explicitly request it from the dashboard using the "Request Location" command. This is a one-time fetch and is performed by a foreground service on the device, which shows a persistent notification. We do not perform any background location tracking. The collected data (latitude, longitude, accuracy, timestamp) is stored to show the last known position on your dashboard.

- **Uploaded Files**: The file transfer feature allows you to upload files from your device to your private, secure space in Firebase Storage. Access is restricted by Firebase Storage Security Rules, ensuring only you can access your files. We only store metadata (file name, size, type) in Firestore to allow you to browse and download them from your dashboard.

- **Synced Notifications**: If you grant permission, the app can sync notifications. We **only** collect the source application's name, the notification title, and the timestamp. The actual content or body of the notification is **never** read or stored. This feature is read-only and can be disabled at any time by revoking the permission.

- **Screen Mirroring**: This feature is strictly user-initiated. You must send a "Screen Share" command from your dashboard. The Android device will then show a system permission dialog. If you accept, the screen is streamed directly to your browser via a secure, peer-to-peer WebRTC connection. A persistent notification is shown on your device for the entire duration of the stream. The session ends immediately when you close the stream on the dashboard or stop it from the device. No screen content is ever stored.

- **Device Administrator Permission**: This elevated permission is required **only** for the "Lock Device" remote command. The app will prompt you to grant this permission and clearly state why it's needed. If you do not grant it, only the lock feature will be disabled; all other app functions will remain available.