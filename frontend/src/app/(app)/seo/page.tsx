import type { Metadata } from "next";
import { Gauge } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "SEO Tools" };

export default function Page() {
  return (
    <>
      <PageHeader title="SEO Tools" description="Score and optimize your articles for search." />
      <EmptyState
        icon={Gauge}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
