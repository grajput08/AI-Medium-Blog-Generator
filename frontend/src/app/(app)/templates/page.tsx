import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { TemplatesGallery } from "@/components/templates/templates-gallery";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="Start from a proven article structure — every template pre-fills the generator."
      />
      <TemplatesGallery />
    </>
  );
}
