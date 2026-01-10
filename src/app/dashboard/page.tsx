import { DeviceList } from "./(components)/device-list";
import DashboardLayout from "./layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="container py-8">
          <h1 className="text-3xl font-bold font-headline mb-2">My Devices</h1>
          <p className="text-muted-foreground mb-8">
              An overview of your connected Android devices.
          </p>
          <DeviceList />
      </div>
    </DashboardLayout>
  );
}
