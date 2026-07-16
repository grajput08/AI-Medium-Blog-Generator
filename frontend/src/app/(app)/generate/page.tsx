import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Generate Blog" };

export default function Page() {
  return (
    <>
      <PageHeader title="Generate Blog" description="Configure your article and let AI draft it." />
      <EmptyState
        icon={Sparkles}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
