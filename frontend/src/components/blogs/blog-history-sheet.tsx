"use client";

import {
  CalendarPlus,
  Cpu,
  History,
  PencilLine,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/blogs/status-badge";
import { useBlogMutations } from "@/hooks/use-blogs";
import { formatRelative } from "@/lib/format";
import type { Blog } from "@/types/blog";

type BlogHistorySheetProps = {
  blog: Blog | null;
  onOpenChange: (open: boolean) => void;
};

export function BlogHistorySheet({ blog, onOpenChange }: BlogHistorySheetProps) {
  const { restoreVersion } = useBlogMutations();

  if (!blog) return null;

  const events = [
    {
      icon: CalendarPlus,
      label: "Created",
      at: blog.createdAt,
    },
    {
      icon: PencilLine,
      label: "Last updated",
      at: blog.updatedAt,
    },
    ...(blog.publishedAt
      ? [{ icon: Send, label: "Published to Medium", at: blog.publishedAt }]
      : []),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  // Mock version snapshots until the Draft model exists (Phase 5/6).
  const versions = [
    { version: 3, note: "Current version", at: blog.updatedAt, current: true },
    { version: 2, note: "After SEO pass", at: blog.createdAt, current: false },
    { version: 1, note: "First AI generation", at: blog.createdAt, current: false },
  ];

  return (
    <Sheet open={!!blog} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2 pr-8 text-lg leading-snug">
            <History className="size-4.5 shrink-0 text-primary" aria-hidden />
            {blog.title}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            <StatusBadge status={blog.status} />
            <span className="flex items-center gap-1 text-xs tabular-nums">
              <Cpu className="size-3" aria-hidden />
              {blog.tokensUsed.toLocaleString()} tokens used
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          <div>
            <p className="mb-3 text-sm font-medium">Timeline</p>
            <ol className="relative flex flex-col gap-4 border-l pl-5">
              {events.map((event) => (
                <li key={event.label} className="relative">
                  <span className="absolute top-0.5 -left-[27px] flex size-4 items-center justify-center rounded-full bg-primary/15">
                    <event.icon className="size-2.5 text-primary" aria-hidden />
                  </span>
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.at).toLocaleString()} · {formatRelative(event.at)}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <Separator />

          <div>
            <p className="mb-3 text-sm font-medium">Versions</p>
            <ul className="flex flex-col gap-2">
              {versions.map((v) => (
                <li
                  key={v.version}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      v{v.version}{" "}
                      {v.current && (
                        <span className="text-xs font-normal text-primary">
                          · current
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.note}</p>
                  </div>
                  {!v.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => restoreVersion(blog.id)}
                    >
                      <RotateCcw className="size-3.5" aria-hidden /> Restore
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
