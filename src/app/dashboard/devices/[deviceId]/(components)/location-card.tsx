"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MapPin } from "lucide-react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirebase } from "@/app/firebase/client-provider";

export interface DeviceLocation {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: {
        seconds: number,
        nanoseconds: number
    };
}


export function LocationCard({ deviceId }: { deviceId: string }) {
  const mapImage = PlaceHolderImages.find(img => img.id === 'map-location');
  const { firestore } = useFirebase();
  const locationRef = firestore ? doc(firestore, "locations", deviceId) : null;
  const [location, loading, error] = useDocumentData(locationRef);

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="aspect-video w-full" />
              </CardContent>
          </Card>
      )
  }

  if (!location) {
      return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MapPin className="w-6 h-6"/>
                    Location
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
                <MapPin className="w-12 h-12 mx-auto mb-4" />
                <p>No location data available.</p>
                <p className="text-sm">Use the `Request Location` command.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <MapPin className="w-6 h-6"/>
            Last Known Location
        </CardTitle>
        <CardDescription>
            Updated at {new Date(location.timestamp.seconds * 1000).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapImage && (
             <div className="aspect-video relative rounded-lg overflow-hidden border">
                <Image 
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+${"ff9800"}(${location.lng},${location.lat})/${location.lng},${location.lat},13,0/600x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`} 
                    alt="Map showing device location" 
                    width={600}
                    height={400}
                    className="object-cover w-full"
                    data-ai-hint={mapImage.imageHint}
                />
             </div>
        )}
        <div className="text-sm font-mono bg-muted p-2 rounded-md">
            <p>Lat: {location.lat.toFixed(6)}</p>
            <p>Lon: {location.lng.toFixed(6)}</p>
            <p>Acc: {location.accuracy}m</p>
        </div>
      </CardContent>
    </Card>
  );
}
