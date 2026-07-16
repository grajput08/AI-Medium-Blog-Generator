import type { Metadata } from "next";
import { GenerateWorkspace } from "@/components/generate/generate-workspace";

export const metadata: Metadata = { title: "Generate Blog" };

export default function GeneratePage() {
  return <GenerateWorkspace />;
}
