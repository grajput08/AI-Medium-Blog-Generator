import type { Metadata } from "next";
import { Link2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Medium Integration" };

export default function Page() {
  return (
    <>
      <PageHeader title="Medium Integration" description="Connect your Medium account to publish directly." />
      <EmptyState
        icon={Link2}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
