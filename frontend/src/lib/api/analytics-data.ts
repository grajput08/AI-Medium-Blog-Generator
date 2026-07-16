// Deterministic mock analytics series; replaced by GET /analytics in Phase 7.

export type MonthPoint = {
  month: string; // "Aug 25"
  published: number;
  views: number;
  tokens: number;
};

export type ScoreBucket = { bucket: string; count: number };

const PUBLISHED = [1, 2, 1, 3, 2, 4, 3, 2, 5, 4, 3, 6];
const VIEWS = [420, 810, 640, 1520, 1180, 2340, 1960, 1730, 3480, 2910, 2620, 4150];
const TOKENS = [8.2, 14.5, 11.0, 22.8, 18.4, 31.2, 26.5, 24.1, 42.3, 36.8, 33.4, 51.6];

export function monthlySeries(months: number): MonthPoint[] {
  const now = new Date();
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const idx = 11 - i;
    points.push({
      month: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      published: PUBLISHED[idx] ?? 0,
      views: VIEWS[idx] ?? 0,
      tokens: Math.round((TOKENS[idx] ?? 0) * 1000),
    });
  }
  return points;
}

export const seoScoreDistribution: ScoreBucket[] = [
  { bucket: "0–49", count: 1 },
  { bucket: "50–69", count: 3 },
  { bucket: "70–84", count: 9 },
  { bucket: "85–100", count: 11 },
];
