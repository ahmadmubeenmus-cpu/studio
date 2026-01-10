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

export interface DeviceFile {
  id: string;
  deviceId: string;
  name: string;
  size: number;
  type: string;
  storagePath: string;
  uploadedAt: string;
}

export interface DeviceNotification {
  id: string;
  appName: string;
  title: string;
  timestamp: string;
  appIcon: string;
}

export interface DeviceLocation {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: string;
}

export const mockDevices: Device[] = [
  {
    id: "device-1",
    uid: "user-1",
    deviceName: "Pixel 8 Pro",
    model: "Google Pixel 8 Pro",
    androidVersion: "14",
    battery: 85,
    isOnline: true,
    fcmToken: "fcm-token-123",
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    networkStatus: 'WiFi',
  },
  {
    id: "device-2",
    uid: "user-1",
    deviceName: "Galaxy Tab S9",
    model: "Samsung Galaxy Tab S9",
    androidVersion: "13",
    battery: 43,
    isOnline: false,
    fcmToken: "fcm-token-456",
    lastSeen: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    networkStatus: 'Offline',
  },
];

export const mockLocation: DeviceLocation = {
    lat: 34.052235,
    lng: -118.243683,
    accuracy: 15,
    timestamp: new Date().toISOString(),
}

export const mockFiles: DeviceFile[] = [
    {
        id: 'file-1',
        deviceId: 'device-1',
        name: 'vacation-photo.jpg',
        size: 4194304, // 4MB
        type: 'image/jpeg',
        storagePath: '/files/user-1/device-1/vacation-photo.jpg',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'file-2',
        deviceId: 'device-1',
        name: 'project-report.pdf',
        size: 1048576, // 1MB
        type: 'application/pdf',
        storagePath: '/files/user-1/device-1/project-report.pdf',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'file-3',
        deviceId: 'device-1',
        name: 'meeting-notes.txt',
        size: 5120, // 5KB
        type: 'text/plain',
        storagePath: '/files/user-1/device-1/meeting-notes.txt',
        uploadedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    }
];


export const mockNotifications: DeviceNotification[] = [
    {
        id: 'notif-1',
        appName: 'Gmail',
        title: 'New email from John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        appIcon: 'app-icon-1'
    },
    {
        id: 'notif-2',
        appName: 'Slack',
        title: 'Message in #general',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        appIcon: 'app-icon-2'
    },
    {
        id: 'notif-3',
        appName: 'Calendar',
        title: 'Upcoming: Project Standup',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        appIcon: 'app-icon-3'
    }
];

export const getMockDevice = async (id: string): Promise<Device | undefined> => {
    return mockDevices.find(d => d.id === id);
}

export const getMockDevices = async (): Promise<Device[]> => {
    return mockDevices;
}

export const getMockLocation = async (deviceId: string): Promise<DeviceLocation | undefined> => {
    if (mockDevices.find(d => d.id === deviceId)) {
        return mockLocation;
    }
    return undefined;
}

export const getMockFiles = async (deviceId: string): Promise<DeviceFile[]> => {
     if (mockDevices.find(d => d.id === deviceId)) {
        return mockFiles;
    }
    return [];
}

export const getMockNotifications = async (deviceId: string): Promise<DeviceNotification[]> => {
     if (mockDevices.find(d => d.id === deviceId)) {
        return mockNotifications;
    }
    return [];
}
