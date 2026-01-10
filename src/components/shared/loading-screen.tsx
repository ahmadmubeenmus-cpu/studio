import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/shared/logo";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="mt-4 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}
