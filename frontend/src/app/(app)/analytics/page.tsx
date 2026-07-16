import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return (
    <>
      <PageHeader title="Analytics" description="Track publishing cadence and AI usage." />
      <EmptyState
        icon={BarChart3}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
