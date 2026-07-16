import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PublishedContent } from "@/components/blogs/published-content";

export const metadata: Metadata = { title: "Published Blogs" };

export default function PublishedPage() {
  return (
    <>
      <PageHeader
        title="Published Blogs"
        description="Everything you have shipped to Medium."
      />
      <PublishedContent />
    </>
  );
}
