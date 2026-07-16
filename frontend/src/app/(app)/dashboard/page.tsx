import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  Cpu,
  FileText,
  Link2,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";

export const metadata: Metadata = { title: "Dashboard" };

// Placeholder data — replaced by the mock API layer in Phase 2 (T2.2).
const stats = [
  { label: "Total Blogs", value: 24, icon: NotebookPen, delta: 12 },
  { label: "Published Blogs", value: 16, icon: BookOpenCheck, delta: 8 },
  { label: "Draft Blogs", value: 8, icon: FileText, delta: -3 },
  { label: "AI Tokens Used", value: 182_450, icon: Cpu, delta: 21 },
];

const activity = [
  { text: "Published “Understanding React Server Components”", when: "2 hours ago" },
  { text: "Generated draft “Next.js 15 Migration Guide”", when: "Yesterday" },
  { text: "Edited “TypeScript Generics, Explained Simply”", when: "2 days ago" },
  { text: "Connected Medium account", when: "3 days ago" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Welcome back
        </p>
        <h1 className="font-display text-gradient-ink text-3xl font-semibold tracking-tight sm:text-4xl">
          Good morning, Gatik.
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y">
              {activity.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-sm">{item.text}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {item.when}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Quick actions
            </CardTitle>
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
