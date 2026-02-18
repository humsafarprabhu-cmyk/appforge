import { BuilderClient } from "./builder-client";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Builder | AppForge`,
    description: "Build your mobile app with AI-powered assistance",
  };
}

export default function BuilderPage({ params }: { params: { id: string } }) {
  return <BuilderClient id={params.id} />;
}