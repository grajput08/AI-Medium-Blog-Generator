import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="glass gap-0 py-5">
      <CardContent className="px-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <Skeleton className="mt-3 h-8 w-20" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass overflow-hidden rounded-xl p-4">
      <Skeleton className="mb-4 h-5 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="mb-3 h-10 w-full" />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-80" />
    </div>
  );
}
