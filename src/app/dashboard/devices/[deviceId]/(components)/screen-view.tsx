
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScreenShare, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";
import { sendDeviceCommand } from "@/lib/actions";

export function ScreenView({ deviceId }: { deviceId: string }) {
  const { firestore } = useFirebase();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // We are not implementing WebRTC streaming in this component.
  // This is a placeholder for the UI.

  const handleStartStream = async () => {
    await sendDeviceCommand(deviceId, "start-stream");
    setIsStreaming(true);
  };

  const handleStopStream = async () => {
     await sendDeviceCommand(deviceId, "stop-stream");
     setIsStreaming(false);
  };

  const toggleStreaming = () => {
    if (isStreaming) {
      handleStopStream();
    } else {
      handleStartStream();
    }
  };
  
  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
                <CardTitle className="font-headline">Screen Mirroring</CardTitle>
                <CardDescription>Live stream your device's screen. (PoC)</CardDescription>
            </div>
            <Button onClick={toggleStreaming} variant={isStreaming ? "destructive" : "default"}>
                {isStreaming ? (
                    <>
                        <Power className="mr-2 h-4 w-4" />
                        Stop Stream
                    </>
                ) : (
                    <>
                        <ScreenShare className="mr-2 h-4 w-4" />
                        Start Stream
                    </>
                )}
            </Button>
        </CardHeader>
        <CardContent>
            <div className="aspect-video w-full bg-black rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden">
                {isStreaming ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                ) : (
                    <div className="text-center">
                        <ScreenShare className="w-16 h-16 mx-auto mb-4" />
                        <p>Screen mirroring is offline.</p>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
