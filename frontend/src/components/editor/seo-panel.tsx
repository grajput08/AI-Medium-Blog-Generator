"use client";

import { useMemo } from "react";
import { CheckCircle2, ExternalLink, Link2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockBlogs } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

export type SeoMeta = {
  seoTitle: string;
  metaDescription: string;
  slug: string;
};

type SeoPanelProps = {
  meta: SeoMeta;
  onMetaChange: (meta: SeoMeta) => void;
  /** Plain text of the article body. */
  text: string;
  html: string;
  keywords: string[];
  hasFeaturedImage: boolean;
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type Rule = { label: string; pass: boolean };

export function SeoPanel({
  meta,
  onMetaChange,
  text,
  html,
  keywords,
  hasFeaturedImage,
}: SeoPanelProps) {
  const primaryKeyword = keywords[0] ?? "";

  const analysis = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const wordCount = words.length;
    const readingTime = Math.max(1, Math.round(wordCount / 220));
    const keywordHits = primaryKeyword
      ? (text.toLowerCase().match(new RegExp(primaryKeyword.toLowerCase(), "g")) ?? [])
          .length
      : 0;
    const density = wordCount ? (keywordHits / wordCount) * 100 : 0;
    const h2Count = (html.match(/<h2/g) ?? []).length;
    const linkCount = (html.match(/<a /g) ?? []).length;
    const hasImage = hasFeaturedImage || /<img /.test(html);
    const firstParagraph =
      text.split("\n").find((p) => p.trim().length > 80) ?? text.slice(0, 300);

    const rules: Rule[] = [
      {
        label: "SEO title is 40–60 characters",
        pass: meta.seoTitle.length >= 40 && meta.seoTitle.length <= 60,
      },
      {
        label: "Meta description is 120–158 characters",
        pass:
          meta.metaDescription.length >= 120 && meta.metaDescription.length <= 158,
      },
      {
        label: "Primary keyword in SEO title",
        pass:
          !!primaryKeyword &&
          meta.seoTitle.toLowerCase().includes(primaryKeyword.toLowerCase()),
      },
      {
        label: "Primary keyword in the introduction",
        pass:
          !!primaryKeyword &&
          firstParagraph.toLowerCase().includes(primaryKeyword.toLowerCase()),
      },
      { label: "Keyword density between 0.5% and 3%", pass: density >= 0.5 && density <= 3 },
      { label: "At least 3 section headings", pass: h2Count >= 3 },
      { label: "At least 800 words", pass: wordCount >= 800 },
      { label: "Contains a link", pass: linkCount >= 1 },
      { label: "Has an image", pass: hasImage },
      { label: "Slug under 60 characters", pass: meta.slug.length > 0 && meta.slug.length <= 60 },
    ];

    const score = Math.round(
      (rules.filter((r) => r.pass).length / rules.length) * 100
    );

    return { wordCount, readingTime, density, rules, score };
  }, [text, html, meta, primaryKeyword, hasFeaturedImage]);

  const internalSuggestions = useMemo(
    () =>
      mockBlogs
        .filter(
          (b) =>
            b.status === "published" &&
            (b.tags.some((t) => keywords.includes(t)) || keywords.length === 0)
        )
        .slice(0, 3),
    [keywords]
  );

  const externalSuggestions = useMemo(
    () =>
      keywords.slice(0, 3).map((k) => ({
        label: `MDN / official docs on “${k}”`,
        url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(k)}`,
      })),
    [keywords]
  );

  const scoreColor =
    analysis.score >= 80
      ? "text-primary"
      : analysis.score >= 50
        ? "text-chart-4"
        : "text-destructive";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
            <circle
              cx="40" cy="40" r="34" fill="none" strokeWidth="7"
              className="stroke-muted"
            />
            <circle
              cx="40" cy="40" r="34" fill="none" strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${(analysis.score / 100) * 213.6} 213.6`}
              className={cn("transition-all duration-500", scoreColor)}
              stroke="currentColor"
            />
          </svg>
          <span
            className={cn(
              "font-display absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums",
              scoreColor
            )}
          >
            {analysis.score}
          </span>
        </div>
        <div className="text-sm">
          <p className="font-medium">SEO score</p>
          <p className="text-muted-foreground">
            {analysis.wordCount.toLocaleString()} words · {analysis.readingTime} min
            read
          </p>
          <p className="text-muted-foreground">
            “{primaryKeyword}” density {analysis.density.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="seo-title">SEO title</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {meta.seoTitle.length}/60
            </span>
          </div>
          <Input
            id="seo-title"
            className="mt-1.5"
            value={meta.seoTitle}
            onChange={(e) => onMetaChange({ ...meta, seoTitle: e.target.value })}
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="meta-description">Meta description</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {meta.metaDescription.length}/158
            </span>
          </div>
          <Textarea
            id="meta-description"
            rows={3}
            className="mt-1.5"
            value={meta.metaDescription}
            onChange={(e) =>
              onMetaChange({ ...meta, metaDescription: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="slug">URL slug</Label>
          <Input
            id="slug"
            className="mt-1.5 font-mono text-sm"
            value={meta.slug}
            onChange={(e) => onMetaChange({ ...meta, slug: slugify(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Checklist</p>
        <ul className="flex flex-col gap-1.5">
          {analysis.rules.map((rule) => (
            <li key={rule.label} className="flex items-start gap-2 text-sm">
              {rule.pass ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className={cn(!rule.pass && "text-muted-foreground")}>
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <Link2 className="size-4 text-primary" aria-hidden /> Internal link ideas
        </p>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {internalSuggestions.map((b) => (
            <li key={b.id} className="truncate">
              {b.title}
            </li>
          ))}
          {internalSuggestions.length === 0 && <li>No published posts to link yet.</li>}
        </ul>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <ExternalLink className="size-4 text-primary" aria-hidden /> External link ideas
        </p>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {externalSuggestions.map((s) => (
            <li key={s.url} className="truncate">
              {s.label}
            </li>
          ))}
          {externalSuggestions.length === 0 && <li>Add keywords to get suggestions.</li>}
        </ul>
      </div>
    </div>
  );
}
