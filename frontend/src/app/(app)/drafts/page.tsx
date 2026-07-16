import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Drafts" };

export default function Page() {
  return (
    <>
      <PageHeader title="Drafts" description="Your works in progress live here." />
      <EmptyState
        icon={FileText}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
