"use server";

import { revalidatePath } from "next/cache";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeFirebase } from "@/firebase/config";

// Initialize Firebase admin app
const { firestore: db } = initializeFirebase();

export async function sendDeviceCommand(
  deviceId: string,
  commandType: string,
  payload: Record<string, any> = {}
) {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized");
    }
    await addDoc(collection(db, "commands"), {
      deviceId,
      type: commandType,
      status: "pending",
      createdAt: serverTimestamp(),
      payload,
    });

    revalidatePath(`/dashboard/devices/${deviceId}`);
    return { success: true, message: `Command '${commandType}' sent successfully.` };
  } catch (error: any) {
    console.error("Error sending command:", error);
    return { success: false, message: error.message || `Failed to send command '${commandType}'.` };
  }
}
