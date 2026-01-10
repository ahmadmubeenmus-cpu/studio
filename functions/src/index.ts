import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Server } from "socket.io";

admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();

/**
 * Sends a push notification when a new command is created.
 */
export const onCommandCreate = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap, context) => {
    const command = snap.data();
    if (!command) {
      functions.logger.error("Command data is missing.");
      return;
    }

    const { deviceId, type, payload } = command;

    functions.logger.log(`New command '${type}' for device ${deviceId}`);

    // Do not send FCM for session management commands
    if (type === 'start-stream' || type === 'stop-stream') {
        functions.logger.log(`Session command ${type} received, handled by client directly.`);
        // Optionally update the command status if needed
        await snap.ref.update({ status: 'acknowledged' });
        return;
    }

    try {
      const deviceDoc = await db.collection("devices").doc(deviceId).get();
      if (!deviceDoc.exists) {
        functions.logger.error(`Device ${deviceId} not found in Firestore.`);
        return;
      }

      const device = deviceDoc.data();
      if (!device || !device.fcmToken) {
        functions.logger.error(`FCM token for device ${deviceId} is missing.`);
        return;
      }

      // The data payload for FCM should be strings only
      const dataPayload: { [key: string]: string } = {
        commandId: context.params.commandId,
        commandType: type,
        deviceId: deviceId, // Pass deviceId for context
        ...Object.entries(payload || {}).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {} as { [key: string]: string })
      };
      
      const fcmPayload = {
        data: dataPayload,
        token: device.fcmToken,
        android: {
            priority: "high" as const,
        }
      };

      await admin.messaging().send(fcmPayload);
      functions.logger.log(`Successfully sent command to device ${deviceId}`, { fcmPayload });

      // Update command status to 'sent'
      await snap.ref.update({ status: 'sent' });

    } catch (error) {
      functions.logger.error(`Error sending command to device ${deviceId}:`, error);
      await snap.ref.update({ status: 'failed', failureReason: (error as Error).message });
    }
  });


/**
 * A callable function to validate that the calling user owns the specified device.
 */
export const validateDeviceOwnership = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    const deviceId = data.deviceId;

    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "The user is not authenticated.");
    }
    if (!deviceId) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'deviceId'.");
    }

    try {
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        if (!deviceDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Device not found.");
        }
        
        const device = deviceDoc.data();
        if (device?.uid !== uid) {
             throw new functions.https.HttpsError("permission-denied", "The caller does not own this device.");
        }

        return { success: true };

    } catch (error) {
        functions.logger.error(`Error validating ownership for device ${deviceId} by user ${uid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An internal error occurred.");
    }
});


/**
 * Updates a device's online status in Firestore when its status changes in Realtime Database.
 */
export const updateDevicePresence = functions.database.ref('/status/{deviceId}')
    .onWrite(async (change, context) => {
        const deviceId = context.params.deviceId;
        const status = change.after.val();

        if (!status) {
            functions.logger.log(`Status for ${deviceId} cleared.`);
            return;
        }

        const deviceRef = db.collection('devices').doc(deviceId);

        try {
             await deviceRef.update({
                isOnline: status.isOnline,
                lastSeen: status.lastSeen,
            });
            functions.logger.log(`Updated presence for device ${deviceId} to ${status.isOnline ? 'online' : 'offline'}`);
        } catch(error) {
            functions.logger.error(`Failed to update presence for device ${deviceId}`, error);
        }
    });


/**
 * A scheduled function that runs periodically to clean up inactive screen sessions.
 * Runs every hour.
 */
export const cleanupInactiveScreenSessions = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
    functions.logger.log("Running inactive screen session cleanup...");
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    try {
        const inactiveSessionsQuery = db.collection('screenSessions')
            .where('status', 'in', ['requested', 'active'])
            .where('startedAt', '<', twoHoursAgo);
        
        const snapshot = await inactiveSessionsQuery.get();

        if (snapshot.empty) {
            functions.logger.log("No inactive sessions to clean up.");
            return;
        }
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            functions.logger.log(`Ending inactive session ${doc.id}`);
            batch.update(doc.ref, { status: 'ended', endedAt: admin.firestore.FieldValue.serverTimestamp() });
        });

        await batch.commit();
        functions.logger.log(`Cleaned up ${snapshot.size} inactive sessions.`);

    } catch (error) {
        functions.logger.error("Error cleaning up inactive screen sessions:", error);
    }
});


const io = new Server({
    cors: {
      origin: "*", // Be more restrictive in production
      methods: ["GET", "POST"]
    }
});

const signaling = io.of("/signaling");

signaling.on('connection', (socket) => {
    functions.logger.log('Socket connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        functions.logger.log(`Socket ${socket.id} joined room ${room}`);
        socket.to(room).emit('peer-joined', socket.id);
    });

    socket.on('offer', ({ sdp, room }) => {
        functions.logger.log(`Offer from ${socket.id} for room ${room}`);
        socket.to(room).emit('offer', { sdp, from: socket.id });
    });

    socket.on('answer', ({ sdp, room }) => {
        functions.logger.log(`Answer from ${socket.id} for room ${room}`);
        socket.to(room).emit('answer', { sdp, from: socket.id });
    });

    socket.on('ice-candidate', ({ candidate, room }) => {
        socket.to(room).emit('ice-candidate', { candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
        functions.logger.log('Socket disconnected:', socket.id);
    });
});

export const signalingServer = functions.https.onRequest((req, res) => {
    // This function acts as a wrapper for the socket.io server
    // NOTE: This setup is basic. For production, you might need a more robust solution
    // like running socket.io on a separate App Engine or Cloud Run instance.
    (io as any)._attach(res.socket.server);
    res.send("Socket.io server is running.");
});
