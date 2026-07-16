"use client";

import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  ExternalLink,
  Eye,
  History,
  MoreHorizontal,
  RefreshCw,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlogHistorySheet } from "@/components/blogs/blog-history-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { TableSkeleton } from "@/components/shared/skeletons";
import { useBlogMutations, useBlogs } from "@/hooks/use-blogs";
import { slugify } from "@/components/editor/seo-panel";
import type { Blog } from "@/types/blog";

export function PublishedContent() {
  const { data: blogs, isPending } = useBlogs();
  const mutations = useBlogMutations();
  const [search, setSearch] = useState("");
  const [historyBlog, setHistoryBlog] = useState<Blog | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<Blog | null>(null);

  const published = useMemo(
    () =>
      (blogs ?? [])
        .filter((b) => b.status === "published")
        .filter(
          (b) => !search || b.title.toLowerCase().includes(search.toLowerCase())
        )
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? 0).getTime() -
            new Date(a.publishedAt ?? 0).getTime()
        ),
    [blogs, search]
  );

  const columns: Column<Blog>[] = [
    {
      key: "title",
      header: "Title",
      render: (b) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{b.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            medium.com/@you/{slugify(b.title)}
          </p>
        </div>
      ),
    },
    {
      key: "published",
      header: "Published",
      className: "whitespace-nowrap",
      render: (b) => (
        <span className="text-sm text-muted-foreground">
          {b.publishedAt
            ? new Date(b.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "views",
      header: "Views",
      render: (b) => (
        <span className="flex items-center gap-1 tabular-nums">
          <Eye className="size-3.5 text-muted-foreground" aria-hidden />
          {b.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: "seo",
      header: "SEO",
      render: (b) => <span className="tabular-nums">{b.seoScore}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-12 text-right",
      render: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${b.title}`}>
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                toast.info("Opens on Medium once the real integration lands.")
              }
            >
              <ExternalLink aria-hidden /> View on Medium
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toast.info("Pushing updates to Medium arrives with the API in Phase 7.")
              }
            >
              <RefreshCw aria-hidden /> Push update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHistoryBlog(b)}>
              <History aria-hidden /> History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setUnpublishTarget(b)}
            >
              <Undo2 aria-hidden /> Unpublish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search published blogs…"
        className="w-full sm:w-64"
      />

      {isPending ? (
        <TableSkeleton rows={4} />
      ) : (
        <DataTable
          columns={columns}
          rows={published}
          rowKey={(b) => b.id}
          emptyState={
            <EmptyState
              icon={BookOpenCheck}
              title={search ? "Nothing matches your search" : "Nothing published yet"}
              description={
                search
                  ? "Try a different search term."
                  : "When you publish a draft to Medium it will show up here."
              }
            />
          }
        />
      )}

      <BlogHistorySheet
        blog={historyBlog}
        onOpenChange={(open) => !open && setHistoryBlog(null)}
      />
      <ConfirmDialog
        open={!!unpublishTarget}
        onOpenChange={(open) => !open && setUnpublishTarget(null)}
        title="Unpublish this blog?"
        description={`“${unpublishTarget?.title}” moves back to drafts. The Medium post itself is only touched once the real integration is connected.`}
        confirmLabel="Unpublish"
        destructive
        onConfirm={() => {
          if (unpublishTarget) mutations.unpublish(unpublishTarget.id);
        }}
      />
    </div>
  );
}
