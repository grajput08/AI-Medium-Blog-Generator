"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpenCheck, Cpu, Eye, Gauge, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import {
  monthlySeries,
  seoScoreDistribution,
  type MonthPoint,
} from "@/lib/api/analytics-data";

const axisStyle = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
} as const;

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  format: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-1.5 text-sm shadow-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{format(payload[0]!.value)}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-display text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56">{children}</CardContent>
    </Card>
  );
}

export function AnalyticsContent() {
  const [range, setRange] = useState(6);
  const [showTable, setShowTable] = useState(false);
  const series = useMemo(() => monthlySeries(range), [range]);

  const totals = useMemo(
    () => ({
      published: series.reduce((s, p) => s + p.published, 0),
      views: series.reduce((s, p) => s + p.views, 0),
      tokens: series.reduce((s, p) => s + p.tokens, 0),
    }),
    [series]
  );

  const grid = (
    <CartesianGrid
      vertical={false}
      stroke="var(--border)"
      strokeDasharray="2 4"
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(range)} onValueChange={(v) => setRange(Number(v))}>
          <SelectTrigger className="h-9 w-40" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showTable ? "secondary" : "outline"}
          size="sm"
          className="ml-auto gap-1.5"
          onClick={() => setShowTable((v) => !v)}
          aria-pressed={showTable}
        >
          <Table2 className="size-4" aria-hidden />
          {showTable ? "Show charts" : "Data table"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Published" value={totals.published} icon={BookOpenCheck} />
        <StatCard label="Total views" value={totals.views} icon={Eye} />
        <StatCard label="AI tokens" value={totals.tokens} icon={Cpu} />
        <StatCard label="Avg. SEO score" value={83} icon={Gauge} />
      </div>

      {showTable ? (
        <Card className="glass overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Published</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">AI tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((p: MonthPoint) => (
                <TableRow key={p.month}>
                  <TableCell>{p.month}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.published}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.tokens.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Monthly publishing">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 4, right: 4, left: -18 }}>
                {grid}
                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={<ChartTooltip format={(v) => `${v} published`} />}
                />
                <Bar
                  dataKey="published"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Views">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 4, left: -8 }}>
                {grid}
                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                <Tooltip
                  content={<ChartTooltip format={(v) => `${v.toLocaleString()} views`} />}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  fill="var(--chart-3)"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="AI token usage">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 4, left: -8 }}>
                {grid}
                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  content={
                    <ChartTooltip format={(v) => `${v.toLocaleString()} tokens`} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  fill="var(--chart-4)"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="SEO score distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={seoScoreDistribution}
                margin={{ top: 4, right: 4, left: -18 }}
              >
                {grid}
                <XAxis dataKey="bucket" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={<ChartTooltip format={(v) => `${v} blogs`} />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--chart-5)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
