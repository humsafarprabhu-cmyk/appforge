import { Suspense } from "react";
import { StudioClient } from "./studio-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Studio | AppForge`,
    description: "Build and manage your app with AppForge Studio",
  };
}

function StudioLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#050507]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/40 text-sm">Loading Studio...</p>
      </div>
    </div>
  );
}

export default async function StudioPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioClient id={id} />
    </Suspense>
  );
}
