"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, getFirestore, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export interface DeviceNotification {
  id: string;
  appName: string;
  title: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  appIcon: string;
}

export function NotificationList({ deviceId }: { deviceId: string }) {

  const getAppIcon = (iconId: string) => {
    const img = PlaceHolderImages.find(p => p.id === iconId);
    return img ? img.imageUrl : undefined;
  };

  const firestore = getFirestore();
  const notificationsRef = collection(firestore, "notifications");
  const notificationsQuery = query(notificationsRef, where("deviceId", "==", deviceId), orderBy("timestamp", "desc"), limit(20));
  const [snapshot, loading, error] = useCollection(notificationsQuery);
  const notifications = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeviceNotification));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Notification Sync</CardTitle>
        <CardDescription>A read-only log of recent notifications from your device.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
             <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
             </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8 border">
                    {getAppIcon(notification.appIcon) && 
                        <AvatarImage src={getAppIcon(notification.appIcon)} alt={notification.appName} data-ai-hint="logo" />
                    }
                    <AvatarFallback>{notification.appName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{notification.appName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(notification.timestamp.seconds * 1000).toLocaleTimeString()}</p>
                    </div>
                  <p className="text-sm text-muted-foreground">{notification.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold">No notifications to show.</p>
                <p className="text-sm">Enable notification access in the Android app.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
