import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { AppViewer } from "./app-viewer";

// Use service-role or anon key for public read
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  
  // Try by slug first, then by ID
  let app: any = null;
  const { data: bySlug } = await supabase
    .from("apps")
    .select("name, description, icon_url, color_primary")
    .eq("slug", slug)
    .eq("status", "ready")
    .single();
  
  if (bySlug) {
    app = bySlug;
  } else {
    const { data: byId } = await supabase
      .from("apps")
      .select("name, description, icon_url, color_primary")
      .eq("id", slug)
      .single();
    app = byId;
  }

  if (!app) return { title: "App Not Found | AppForge" };

  return {
    title: `${app.name} | Built with AppForge`,
    description: app.description || `${app.name} — a mobile app built with AppForge AI`,
    openGraph: {
      title: app.name,
      description: app.description || `${app.name} — built with AppForge`,
      type: "website",
    },
  };
}

export default async function AppPage({ params }: Props) {
  const { slug } = await params;

  // Fetch app by slug or ID
  let app: any = null;
  
  const { data: bySlug } = await supabase
    .from("apps")
    .select("id, name, description, screens, color_primary, color_secondary, theme, icon_url, slug, status")
    .eq("slug", slug)
    .eq("status", "ready")
    .single();

  if (bySlug) {
    app = bySlug;
  } else {
    // Try by UUID
    const { data: byId } = await supabase
      .from("apps")
      .select("id, name, description, screens, color_primary, color_secondary, theme, icon_url, slug, status")
      .eq("id", slug)
      .single();
    app = byId;
  }

  if (!app || !app.screens || app.screens.length === 0) {
    notFound();
  }

  return <AppViewer app={app} />;
}
