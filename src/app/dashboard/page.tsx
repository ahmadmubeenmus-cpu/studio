import { getMockDevices } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceList } from "./(components)/device-list";

export default async function DashboardPage() {
  const devices = await getMockDevices();

  return (
    <div className="container py-8">
        <h1 className="text-3xl font-bold font-headline mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
            An overview of your connected devices.
        </p>
        <DeviceList devices={devices} />
    </div>
  );
}
