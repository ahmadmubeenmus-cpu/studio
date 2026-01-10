"use server";

import { revalidatePath } from "next/cache";

// Mock function to simulate a delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendDeviceCommand(
  deviceId: string,
  commandType: string
) {
  await sleep(1000); // Simulate network delay

  console.log(`Command '${commandType}' sent to device '${deviceId}'`);

  // In a real app, this would interact with Firebase to create a command document.
  // For example:
  // await db.collection('commands').add({
  //   deviceId,
  //   type: commandType,
  //   status: 'pending',
  //   createdAt: new Date(),
  //   payload: {},
  // });

  revalidatePath(`/dashboard/devices/${deviceId}`);

  return { success: true, message: `Command '${commandType}' sent successfully.` };
}
