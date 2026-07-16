import type { Metadata } from "next";
import { BookOpenCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Published Blogs" };

export default function Page() {
  return (
    <>
      <PageHeader title="Published Blogs" description="Everything you have shipped to Medium." />
      <EmptyState
        icon={BookOpenCheck}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
