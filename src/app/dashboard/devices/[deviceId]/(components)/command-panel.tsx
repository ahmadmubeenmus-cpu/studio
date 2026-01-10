"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, Lock, MessageSquare, RefreshCw, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendDeviceCommand } from "@/lib/actions";

const commands = [
  { id: "ring", label: "Ring Device", icon: BellRing },
  { id: "lock", label: "Lock Device", icon: Lock },
  { id: "notify", label: "Show Notification", icon: MessageSquare },
  { id: "refresh", label: "Refresh Info", icon: RefreshCw },
  { id: "location", label: "Request Location", icon: MapPin },
];

export function CommandPanel({ deviceId }: { deviceId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const handleCommand = (commandType: string) => {
    startTransition(async () => {
      setActiveCommand(commandType);
      const result = await sendDeviceCommand(deviceId, commandType);
      if (result.success) {
        toast({
          title: "Command Sent",
          description: `The '${commandType}' command was sent to the device.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Command Failed",
          description: result.message || "Could not send the command. Please try again.",
        });
      }
      setActiveCommand(null);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Remote Commands</CardTitle>
        <CardDescription>Send commands to your device in real-time.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {commands.map((command) => (
          <Button
            key={command.id}
            variant="outline"
            className="flex flex-col h-24 gap-2 p-4 items-center justify-center text-center"
            onClick={() => handleCommand(command.id)}
            disabled={isPending}
          >
            {isPending && activeCommand === command.id ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <command.icon className="h-6 w-6 text-primary" />
            )}
            <span className="text-xs font-medium">{command.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
