"use client";

import { notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DeviceDetailsCard } from "./(components)/device-details-card";
import { CommandPanel } from "./(components)/command-panel";
import { LocationCard } from "./(components)/location-card";
import { FileBrowser } from "./(components)/file-browser";
import { NotificationList } from "./(components)/notification-list";
import { ScreenView } from "./(components)/screen-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, getFirestore } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Device } from "../../(components)/device-list";

export default function DeviceDetailPage({ params }: { params: { deviceId: string } }) {
  const firestore = getFirestore();
  const deviceRef = doc(firestore, "devices", params.deviceId);
  const [snapshot, loading, error] = useDocument(deviceRef);
  const device = snapshot ? { id: snapshot.id, ...snapshot.data() } as Device : undefined;

  if (loading) {
    return (
        <div className="container py-8">
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="grid gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    )
  }
  
  if (error || !device) {
    notFound();
  }

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{device.deviceName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid gap-8">
        <ScreenView deviceId={device.id} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <DeviceDetailsCard device={device} />
                <CommandPanel deviceId={device.id} />
            </div>
            <div className="lg:col-span-1">
                <LocationCard deviceId={device.id} />
            </div>
        </div>

        <div>
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="files">File Browser</TabsTrigger>
              <TabsTrigger value="notifications">Notification Sync</TabsTrigger>
            </TabsList>
            <TabsContent value="files">
              <FileBrowser deviceId={device.id} />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationList deviceId={device.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
