"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Cpu,
  FileText,
  Link2,
  NotebookPen,
  PencilLine,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton } from "@/components/shared/skeletons";
import { useDashboardStats, useRecentActivity } from "@/hooks/use-dashboard";
import { formatRelative, greetingForHour } from "@/lib/format";
import { getSessionUser } from "@/lib/session";
import type { ActivityEvent } from "@/types/blog";

const activityIcons: Record<ActivityEvent["type"], typeof Send> = {
  published: Send,
  generated: Sparkles,
  edited: PencilLine,
  connected: Link2,
};

export function DashboardContent() {
  const stats = useDashboardStats();
  const activity = useRecentActivity();
  const [firstName, setFirstName] = useState("writer");

  useEffect(() => {
    const user = getSessionUser();
    if (user?.name) setFirstName(user.name.split(" ")[0]!);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-gradient-ink text-3xl font-semibold tracking-tight capitalize sm:text-4xl">
          {greetingForHour(new Date().getHours())}, {firstName}.
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.isPending || !stats.data ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Blogs"
              value={stats.data.totalBlogs}
              icon={NotebookPen}
              delta={stats.data.deltas.totalBlogs}
            />
            <StatCard
              label="Published Blogs"
              value={stats.data.publishedBlogs}
              icon={BookOpenCheck}
              delta={stats.data.deltas.publishedBlogs}
            />
            <StatCard
              label="Draft Blogs"
              value={stats.data.draftBlogs}
              icon={FileText}
              delta={stats.data.deltas.draftBlogs}
            />
            <StatCard
              label="AI Tokens Used"
              value={stats.data.tokensUsed}
              icon={Cpu}
              delta={stats.data.deltas.tokensUsed}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.isPending ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !activity.data || activity.data.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No activity yet"
                description="Generate your first blog and your activity will show up here."
                action={
                  <Button asChild size="sm">
                    <Link href="/generate">Generate a blog</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y">
                {activity.data.map((item) => {
                  const Icon = activityIcons[item.type];
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm">{item.text}</p>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(item.at)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-display text-lg">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild className="justify-start gap-2.5">
              <Link href="/generate">
                <Sparkles aria-hidden /> Generate a blog
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start gap-2.5">
              <Link href="/drafts">
                <FileText aria-hidden /> Open drafts
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start gap-2.5">
              <Link href="/medium">
                <Link2 aria-hidden /> Connect Medium
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
