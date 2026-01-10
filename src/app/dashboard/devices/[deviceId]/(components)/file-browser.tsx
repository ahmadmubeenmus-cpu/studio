"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { File, Download } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, getFirestore, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

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
  const firestore = getFirestore();
  const filesRef = collection(firestore, "files");
  const filesQuery = query(filesRef, where("deviceId", "==", deviceId), orderBy("uploadedAt", "desc"));
  const [snapshot, loading, error] = useCollection(filesQuery);
  const files = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeviceFile));

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
                    <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
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
