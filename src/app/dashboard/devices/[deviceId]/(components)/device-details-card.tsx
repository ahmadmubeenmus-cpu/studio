"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Battery, Wifi, Milestone, Power } from "lucide-react";
import { Device } from "@/app/dashboard/(components)/device-list";


function getBatteryIcon(level: number) {
  if (level > 80) return <Battery className="w-5 h-5 text-green-500" />;
  if (level > 20) return <Battery className="w-5 h-5 text-yellow-500" />;
  return <Battery className="w-5 h-5 text-red-500" />;
}

export function DeviceDetailsCard({ device }: { device: Device }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Smartphone className="w-10 h-10 text-primary" />
          <div>
            <CardTitle className="font-headline">{device.deviceName}</CardTitle>
            <CardDescription>{device.model}</CardDescription>
          </div>
           <div className="ml-auto flex items-center gap-2">
            <span
              className={`block h-3 w-3 rounded-full ${
                device.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm font-medium">{device.isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {getBatteryIcon(device.battery)}
            <div>
              <p className="font-medium">Battery</p>
              <p className="text-muted-foreground">{device.battery}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Network</p>
              <p className="text-muted-foreground">{device.networkStatus}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Power className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Android OS</p>
              <p className="text-muted-foreground">{device.androidVersion}</p>
            </div>
          </div>
           <div className="flex items-center gap-2">
             <Milestone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Last Seen</p>
              <p className="text-muted-foreground">{new Date(device.lastSeen).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
