import { BuilderClient } from "./builder-client";
import { use } from "react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Builder | AppForge`,
    description: "Build your mobile app with AI-powered assistance",
  };
}

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BuilderClient id={id} />;
}
