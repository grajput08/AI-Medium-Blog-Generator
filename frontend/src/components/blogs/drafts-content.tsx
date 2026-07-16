"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Copy,
  FileText,
  History,
  LayoutGrid,
  MoreHorizontal,
  Rows3,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogHistorySheet } from "@/components/blogs/blog-history-sheet";
import { StatusBadge } from "@/components/blogs/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { TableSkeleton } from "@/components/shared/skeletons";
import { useBlogMutations, useBlogs } from "@/hooks/use-blogs";
import { formatRelative } from "@/lib/format";
import type { Blog } from "@/types/blog";

const PAGE_SIZE = 6;

export function DraftsContent() {
  const { data: blogs, isPending } = useBlogs();
  const mutations = useBlogMutations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">(
    "active"
  );
  const [view, setView] = useState<"cards" | "table">("cards");
  const [page, setPage] = useState(1);
  const [historyBlog, setHistoryBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const filtered = useMemo(() => {
    return (blogs ?? [])
      .filter((b) =>
        statusFilter === "active"
          ? b.status === "draft" || b.status === "scheduled"
          : statusFilter === "archived"
            ? b.status === "archived"
            : b.status !== "published"
      )
      .filter(
        (b) =>
          !search ||
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.category.toLowerCase().includes(search.toLowerCase())
      );
  }, [blogs, statusFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function actionsFor(blog: Blog) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${blog.title}`}>
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              toast.info("Draft editing wires into the generator in Phase 7.")
            }
          >
            <FileText aria-hidden /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => mutations.duplicate(blog.id)}>
            <Copy aria-hidden /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHistoryBlog(blog)}>
            <History aria-hidden /> History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {blog.status === "archived" ? (
            <DropdownMenuItem onClick={() => mutations.restore(blog.id)}>
              <ArchiveRestore aria-hidden /> Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => mutations.archive(blog.id)}>
              <Archive aria-hidden /> Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteTarget(blog)}
          >
            <Trash2 aria-hidden /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const columns: Column<Blog>[] = [
    {
      key: "title",
      header: "Title",
      render: (b) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{b.title}</p>
          <p className="truncate text-xs text-muted-foreground">{b.category}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap",
      render: (b) => (
        <span className="text-sm text-muted-foreground">
          {formatRelative(b.updatedAt)}
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
      render: (b) => actionsFor(b),
    },
  ];

  const emptyState = (
    <EmptyState
      icon={FileText}
      title={search ? "No drafts match your search" : "No drafts yet"}
      description={
        search
          ? "Try a different search term or clear the filters."
          : "Generate your first article and it will land here as a draft."
      }
      action={
        !search && (
          <Button asChild className="gap-2">
            <Link href="/generate">
              <Sparkles aria-hidden /> Generate a blog
            </Link>
          </Button>
        )
      }
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search drafts…"
          className="w-full sm:w-64"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as typeof statusFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-0.5 rounded-lg border p-0.5">
          <Button
            variant={view === "cards" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            onClick={() => setView("cards")}
            aria-label="Card view"
            aria-pressed={view === "cards"}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            onClick={() => setView("table")}
            aria-label="Table view"
            aria-pressed={view === "table"}
          >
            <Rows3 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {isPending ? (
        <TableSkeleton rows={5} />
      ) : view === "table" ? (
        <DataTable
          columns={columns}
          rows={pageItems}
          rowKey={(b) => b.id}
          emptyState={emptyState}
        />
      ) : pageItems.length === 0 ? (
        emptyState
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((blog) => (
            <Card key={blog.id} className="glass gap-0 py-4">
              <CardContent className="flex h-full flex-col px-4">
                <div className="mb-2 flex items-start justify-between gap-1">
                  <StatusBadge status={blog.status} />
                  {actionsFor(blog)}
                </div>
                <h3 className="font-display line-clamp-2 text-base font-semibold leading-snug">
                  {blog.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {blog.subtitle}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <span>{blog.category}</span>
                  <span>Updated {formatRelative(blog.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

      <BlogHistorySheet
        blog={historyBlog}
        onOpenChange={(open) => !open && setHistoryBlog(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this draft?"
        description={`“${deleteTarget?.title}” will be removed. In the real API this is a soft delete with a restore window.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget) mutations.remove(deleteTarget.id);
        }}
      />
    </div>
  );
}
