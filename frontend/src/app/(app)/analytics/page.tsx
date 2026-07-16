import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsContent } from "@/components/analytics/analytics-content";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Track publishing cadence, reach, and AI usage."
      />
      <AnalyticsContent />
    </>
  );
}
