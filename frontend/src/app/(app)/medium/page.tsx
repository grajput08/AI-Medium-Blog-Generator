import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { MediumContent } from "@/components/medium/medium-content";

export const metadata: Metadata = { title: "Medium Integration" };

export default function MediumPage() {
  return (
    <>
      <PageHeader
        title="Medium Integration"
        description="Connect your Medium account to publish directly, or use the export fallback."
      />
      <MediumContent />
    </>
  );
}
