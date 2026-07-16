import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { BillingContent } from "@/components/account/billing-content";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Your plan and AI token usage."
      />
      <BillingContent />
    </>
  );
}
