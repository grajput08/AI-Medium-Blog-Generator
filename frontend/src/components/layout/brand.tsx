import Link from "next/link";
import { Feather } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent",
        collapsed && "justify-center px-0"
      )}
      aria-label="Inkwell home"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-3 text-primary-foreground shadow-sm">
        <Feather className="size-4.5" aria-hidden />
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight">
            Inkwell
          </span>
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            AI blog studio
          </span>
        </span>
      )}
    </Link>
  );
}
