import { redirect } from "next/navigation";

export default function Home() {
  // Auth landing arrives in Phase 2; the app currently opens on the dashboard.
  redirect("/dashboard");
}
