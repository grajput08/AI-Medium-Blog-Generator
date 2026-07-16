import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogStatus } from "@/types/blog";

const styles: Record<BlogStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: {
    label: "Scheduled",
    className: "bg-chart-4/15 text-chart-4",
  },
  published: { label: "Published", className: "bg-primary/12 text-primary" },
  archived: {
    label: "Archived",
    className: "bg-foreground/8 text-muted-foreground line-through",
  },
};

export function StatusBadge({ status }: { status: BlogStatus }) {
  const s = styles[status];
  return (
    <Badge variant="secondary" className={cn("border-none", s.className)}>
      {s.label}
    </Badge>
  );
}
