# **App Name**: RemoteDroid

## Core Features:

- User Authentication: Secure user authentication via Email/Password and Google Sign-In using Firebase Authentication, with persistent session management.
- Device Registration: Automatic device registration upon first login, collecting device details (name, model, Android version, battery level, network status, FCM token, last seen timestamp) and storing them in Firestore.
- Online/Offline Status: Real-time device presence tracking using Firebase Realtime Database to update isOnline status and lastSeen timestamp automatically.
- Remote Command Execution: FCM-based command queue system to execute remote commands (Ring device, Lock device, Show notification, Request location update, Refresh device info). Command status is tracked in Firestore.
- On-Demand Location: Request single location update when user triggers via a button. Uses a foreground service and stores location data (lat, lng, accuracy, timestamp) in Firestore.  NO background location tracking.
- File Transfer: Basic file upload from device to Firebase Storage and download from cloud to device. File metadata is stored in Firestore.
- Notification Sync: Sync notifications (app name, notification title, timestamp) to a web dashboard, from the user's Android device, requiring explicit user permissions via Notification Listener Service. NO content modification allowed.

## Style Guidelines:

- Primary color: Dark blue (#3F51B5) to inspire confidence and security.
- Background color: Very light gray (#F5F5F5), a desaturated version of the primary to give the UI a calm feel.
- Accent color: Orange (#FF9800) to highlight calls to action and other interactive elements.
- Headline font: 'Space Grotesk', a sans-serif for headlines; body font: 'Inter', also sans-serif, for body text. 
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, clear icons from Material Design for actions and status indicators.
- Subtle animations to indicate loading or command execution status.