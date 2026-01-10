import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type DeviceLocation } from "@/lib/mock-data";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MapPin } from "lucide-react";

export function LocationCard({ location }: { location: DeviceLocation }) {
  const mapImage = PlaceHolderImages.find(img => img.id === 'map-location');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <MapPin className="w-6 h-6"/>
            Last Known Location
        </CardTitle>
        <CardDescription>
            Updated at {new Date(location.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapImage && (
             <div className="aspect-video relative rounded-lg overflow-hidden border">
                <Image 
                    src={mapImage.imageUrl} 
                    alt="Map showing device location" 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
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
