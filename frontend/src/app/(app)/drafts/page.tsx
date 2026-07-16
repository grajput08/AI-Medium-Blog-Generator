import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { DraftsContent } from "@/components/blogs/drafts-content";

export const metadata: Metadata = { title: "Drafts" };

export default function DraftsPage() {
  return (
    <>
      <PageHeader title="Drafts" description="Your works in progress live here." />
      <DraftsContent />
    </>
  );
}
