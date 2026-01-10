import { LoadingScreen } from "@/components/shared/loading-screen";

export default function RootPage() {
  // This page will briefly show a loading screen while the client provider
  // in the root layout determines the correct route based on auth state.
  return <LoadingScreen />;
}
