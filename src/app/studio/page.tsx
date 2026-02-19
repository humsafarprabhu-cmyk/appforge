import { redirect } from "next/navigation";

export default function StudioIndexPage() {
  // Redirect to try-mode studio for unauthenticated users
  redirect("/studio/try-mode");
}
