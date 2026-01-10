"use client";

import Link from "next/link";
import {
  Card,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, ChevronRight } from "lucide-react";
import { useUser, useFirebase } from "@/app/firebase/client-provider";
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";


export interface Device {
    id: string;
    uid: string;
    deviceName: string;
    model: string;
    androidVersion: string;
    battery: number;
    isOnline: boolean;
    fcmToken: string;
    lastSeen: string;
    createdAt: string;
    networkStatus: 'WiFi' | 'Cellular' | 'Offline';
}


export function DeviceList() {
    const { user } = useUser();
    const { firestore } = useFirebase();

    const devicesQuery = user && firestore
      ? query(collection(firestore, "devices"), where("uid", "==", user.uid))
      : null;
    
    const [snapshot, loading, error] = useCollection(devicesQuery);
    const devices = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Device));

  if (loading) {
      return (
          <div className="grid gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
          </div>
      )
  }

  if (error) {
    return <Card className="p-12 text-center"><CardTitle className="text-destructive">Error loading devices.</CardTitle><CardDescription>{error.message}</CardDescription></Card>
  }

  if (!devices || devices.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <Smartphone className="w-16 h-16 mb-4 text-muted-foreground" />
        <CardTitle className="font-headline">No Devices Found</CardTitle>
        <CardDescription className="mt-2">
          Install the RemoteDroid app on your Android device and log in to link it.
        </CardDescription>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4">
      {devices && devices.map((device) => (
        <Card key={device.id} className="hover:border-primary/50 transition-colors">
          <Link href={`/dashboard/devices/${device.id}`} className="block">
            <div className="flex items-center p-4">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <Smartphone className="w-10 h-10 text-muted-foreground" />
                    <span
                        className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-card ${
                        device.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                    />
                 </div>
                <div>
                  <h3 className="font-semibold">{device.deviceName}</h3>
                  <p className="text-sm text-muted-foreground">{device.model}</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{device.isOnline ? 'Online' : 'Offline'}</p>
                      {device.lastSeen && <p className="text-xs text-muted-foreground">Last seen: {new Date(device.lastSeen).toLocaleTimeString()}</p>}
                  </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}
