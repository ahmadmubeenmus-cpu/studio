"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { File, Download, Loader2 } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, orderBy } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";

export interface DeviceFile {
    id: string;
    deviceId: string;
    name: string;
    size: number;
    type: string;
    storagePath: string;
    uploadedAt: {
        seconds: number;
        nanoseconds: number;
    };
}


function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function FileBrowser({ deviceId }: { deviceId: string }) {
  const { firestore } = useFirebase();
  const storage = getStorage();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const filesQuery = firestore ? query(collection(firestore, "files"), where("deviceId", "==", deviceId), orderBy("uploadedAt", "desc")) : null;
  const [snapshot, loading, error] = useCollection(filesQuery);
  const files = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeviceFile));

  const handleDownload = async (file: DeviceFile) => {
    setDownloading(file.id);
    try {
        const storageRef = ref(storage, file.storagePath);
        const url = await getDownloadURL(storageRef);

        // This will open the file in a new tab, which triggers a download for most file types.
        window.open(url, '_blank');

    } catch (error) {
        console.error("Error getting download URL:", error);
        toast({
            variant: "destructive",
            title: "Download failed",
            description: "Could not get the file download link. Please try again."
        });
    } finally {
        setDownloading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">File Browser</CardTitle>
        <CardDescription>View and download files uploaded from your device.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : files && files.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Size</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {files.map((file) => (
                <TableRow key={file.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <File className="w-4 h-4 text-muted-foreground" />
                        {file.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{file.type}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-muted-foreground">{formatBytes(file.size)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-muted-foreground">{new Date(file.uploadedAt.seconds * 1000).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} disabled={downloading === file.id}>
                        {downloading === file.id ? (
                             <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                             <Download className="w-4 h-4" />
                        )}
                        <span className="sr-only">Download</span>
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
             <div className="text-center py-12 text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold">No files uploaded yet.</p>
                <p className="text-sm">Use the Android app to upload files.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
