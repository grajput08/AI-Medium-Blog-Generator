import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Percent change vs. previous period; omit to hide the trend row. */
  delta?: number;
  deltaLabel?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  className,
}: StatCardProps) {
  const positive = delta !== undefined && delta >= 0;

  return (
    <Card className={cn("glass gap-0 py-5", className)}>
      <CardContent className="px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        </div>
        <p className="font-display mt-2 text-3xl font-semibold tracking-tight tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {delta !== undefined && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                positive ? "text-primary" : "text-destructive"
              )}
            >
              {positive ? (
                <TrendingUp className="size-3.5" aria-hidden />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden />
              )}
              {positive ? "+" : ""}
              {delta}%
            </span>
            {deltaLabel ?? "vs. last month"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
