import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type DeviceNotification } from "@/lib/mock-data";
import { Bell } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NotificationList({ notifications }: { notifications: DeviceNotification[] }) {

  const getAppIcon = (iconId: string) => {
    const img = PlaceHolderImages.find(p => p.id === iconId);
    return img ? img.imageUrl : undefined;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Notification Sync</CardTitle>
        <CardDescription>A read-only log of recent notifications from your device.</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
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
                        <p className="text-xs text-muted-foreground">{new Date(notification.timestamp).toLocaleTimeString()}</p>
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
