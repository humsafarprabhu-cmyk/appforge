import { Suspense } from "react";
import { TryClient } from "./try-client";

export const metadata = {
  title: "Try AppForge — Build an App in 2 Minutes",
  description: "Type your app idea and watch AI build it. No signup needed. Free.",
};

function Loading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading builder...</p>
      </div>
    </div>
  );
}

export default function TryPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TryClient />
    </Suspense>
  );
}
