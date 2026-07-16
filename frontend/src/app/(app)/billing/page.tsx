import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Billing" };

export default function Page() {
  return (
    <>
      <PageHeader title="Billing" description="Your plan and AI token usage." />
      <EmptyState
        icon={CreditCard}
        title="Coming soon"
        description="This page is scheduled in a later phase of the build plan."
      />
    </>
  );
}
