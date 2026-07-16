import type { Metadata } from "next";
import { LayoutTemplate } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Templates" };

export default function Page() {
  return (
    <>
      <PageHeader title="Templates" description="Start from a proven article structure." />
      <EmptyState
        icon={LayoutTemplate}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
