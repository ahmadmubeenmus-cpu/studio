import { getMockDevice, getMockLocation, getMockFiles, getMockNotifications } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DeviceDetailsCard } from "./(components)/device-details-card";
import { CommandPanel } from "./(components)/command-panel";
import { LocationCard } from "./(components)/location-card";
import { FileBrowser } from "./(components)/file-browser";
import { NotificationList } from "./(components)/notification-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DeviceDetailPage({ params }: { params: { deviceId: string } }) {
  const device = await getMockDevice(params.deviceId);
  
  if (!device) {
    notFound();
  }

  const location = await getMockLocation(params.deviceId);
  const files = await getMockFiles(params.deviceId);
  const notifications = await getMockNotifications(params.deviceId);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <DeviceDetailsCard device={device} />
                <CommandPanel deviceId={device.id} />
            </div>
            <div className="lg:col-span-1">
                {location && <LocationCard location={location} />}
            </div>
        </div>

        <div>
          <Tabs defaultValue="files">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="files">File Browser</TabsTrigger>
              <TabsTrigger value="notifications">Notification Sync</TabsTrigger>
            </TabsList>
            <TabsContent value="files">
              <FileBrowser files={files} />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationList notifications={notifications} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
