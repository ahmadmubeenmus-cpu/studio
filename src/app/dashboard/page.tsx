import { DeviceList } from "./(components)/device-list";

export default function DashboardPage() {
  return (
    <div className="container py-8">
        <h1 className="text-3xl font-bold font-headline mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
            An overview of your connected devices.
        </p>
        <DeviceList />
    </div>
  );
}
