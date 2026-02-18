import { Suspense } from "react";
import { DemoClient } from "./demo-client";

export async function generateMetadata() {
  return {
    title: `Demo Builder | AppForge`,
    description: "Try AppForge with example templates - see how easy it is to build amazing apps with AI",
  };
}

function DemoLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading demo...</p>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<DemoLoading />}>
      <DemoClient />
    </Suspense>
  );
}