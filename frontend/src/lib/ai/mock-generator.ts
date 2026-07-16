import type { GeneratorConfig } from "@/lib/validations/blog";

// Mock article stream. Phase 7 replaces this with the real SSE client for
// POST /ai/generate; the consumer contract (async generator of chunks with
// phase labels) is what the real client will implement too.

export type StreamChunk = {
  text: string;
  /** Present when the generator moves to a new writing phase. */
  phase?: string;
};

function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .map((w) => (w.length > 3 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function buildArticle(config: GeneratorConfig): { markdown: string; title: string } {
  const title = titleCase(config.topic);
  const [kw1, kw2 = kw1] = config.keywords as [string, ...string[]];
  const sectionCount = config.wordCount >= 3000 ? 4 : config.wordCount >= 1500 ? 3 : 2;

  const sections = [
    {
      heading: `Why ${titleCase(kw1)} Matters in 2026`,
      body: [
        `If you have spent any time around ${config.audience}, you have probably noticed the same pattern: everyone talks about ${kw1}, but few explain it in a way that survives first contact with a real project.`,
        `This ${config.style} takes a different route. Instead of abstract definitions, we will work through concrete examples — the kind you can adapt to your own stack the same afternoon.`,
        `> The best way to understand ${kw1} is to break it once, on purpose, in a project you control.`,
      ],
    },
    {
      heading: `Getting Started with ${titleCase(kw1)}`,
      body: [
        `Let's start with the smallest useful example. The snippet below shows the core idea in isolation:`,
        "```ts\n// The essential pattern, reduced to its skeleton\nexport async function run(input: string): Promise<Result> {\n  const parsed = parse(input);\n  const enriched = await enrich(parsed);\n  return finalize(enriched);\n}\n```",
        `Three steps, each with a single responsibility. Most production incidents trace back to code that merged these concerns — parsing while enriching, finalizing while parsing.`,
        `**Tip:** name the intermediate values. \`parsed\` and \`enriched\` cost nothing and make the pipeline self-documenting.`,
      ],
    },
    {
      heading: `${titleCase(kw1)} vs ${titleCase(kw2)}: A Practical Comparison`,
      body: [
        `Choosing between approaches is easier with the trade-offs side by side:`,
        `| Criterion | ${titleCase(kw1)} | ${titleCase(kw2)} |\n| --- | --- | --- |\n| Learning curve | Gentle | Steeper |\n| Flexibility | Moderate | High |\n| Best for | Getting started fast | Complex, evolving needs |\n| Community | Large | Growing |`,
        `Neither column wins outright — the right choice depends on where your project sits today, not where it might be in three years.`,
      ],
    },
    {
      heading: `Common Mistakes (and How to Avoid Them)`,
      body: [
        `1. **Skipping the fundamentals.** Advanced patterns collapse without them.`,
        `2. **Optimizing too early.** Measure first; the bottleneck is rarely where intuition points.`,
        `3. **Ignoring the ecosystem.** Half the value of ${kw1} lives in the tooling around it.`,
        `Each of these is recoverable — the expensive version is discovering them in production.`,
      ],
    },
  ].slice(0, sectionCount);

  const parts: string[] = [];

  parts.push(`# ${title}\n`);
  parts.push(`*A ${config.tone} ${config.style} for ${config.audience}.*\n`);
  parts.push(
    `${titleCase(kw1)} has moved from nice-to-know to table stakes, and the gap between reading about it and using it well keeps widening. This article closes that gap: what ${kw1} actually is, where it fits, and the mistakes worth skipping.\n`
  );

  if (config.includeToc) {
    parts.push(`## Table of Contents\n`);
    parts.push(
      sections.map((s, i) => `${i + 1}. ${s.heading}`).join("\n") +
        (config.includeFaqs ? `\n${sections.length + 1}. FAQs` : "") +
        (config.includeConclusion ? `\n${sections.length + 2}. Conclusion` : "") +
        "\n"
    );
  }

  for (const section of sections) {
    parts.push(`## ${section.heading}\n`);
    for (const para of section.body) parts.push(`${para}\n`);
  }

  parts.push(`## Key Takeaways\n`);
  parts.push(
    `- Start small: one working example beats three abstract diagrams.\n- Keep concerns separated; most complexity is self-inflicted.\n- Let real constraints — not trends — pick your tools.\n`
  );

  if (config.includeFaqs) {
    parts.push(`## FAQs\n`);
    parts.push(
      `**Is ${kw1} suitable for beginners?**\nYes — start with the fundamentals above and grow into the advanced patterns as your project demands them.\n`
    );
    parts.push(
      `**How long does it take to learn?**\nA productive baseline takes days, not months. Depth comes from shipping real projects.\n`
    );
    parts.push(
      `**Does ${kw1} replace ${kw2}?**\nNo — they solve overlapping but distinct problems, and many teams run both.\n`
    );
  }

  if (config.includeConclusion) {
    parts.push(`## Conclusion\n`);
    parts.push(
      `${titleCase(kw1)} rewards the practical learner. Skip the hype cycle, build the small version first, and let each project teach you the next layer. The patterns in this guide are the ones that survive contact with production — start with them, then make them your own.\n`
    );
  }

  if (config.includeCta) {
    parts.push(
      `---\n\n*If this helped, follow me for more ${config.category} deep-dives, and drop a comment with what you'd like covered next. 👏*\n`
    );
  }

  return { markdown: parts.join("\n"), title };
}

const PHASE_FOR_PREFIX: Array<[RegExp, string]> = [
  [/^# /, "Writing the title"],
  [/^\*A /, "Adding the subtitle"],
  [/^## Table of Contents/, "Laying out the table of contents"],
  [/^## Key Takeaways/, "Distilling key takeaways"],
  [/^## FAQs/, "Answering FAQs"],
  [/^## Conclusion/, "Writing the conclusion"],
  [/^---/, "Adding the call to action"],
  [/^## /, "Drafting sections"],
];

export async function* streamMockArticle(
  config: GeneratorConfig,
  signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const { markdown } = buildArticle(config);
  const blocks = markdown.split("\n\n");
  let lastPhase = "";

  for (const block of blocks) {
    if (signal?.aborted) return;
    const phaseEntry = PHASE_FOR_PREFIX.find(([re]) => re.test(block));
    const phase =
      phaseEntry && phaseEntry[1] !== lastPhase ? phaseEntry[1] : undefined;
    if (phase) lastPhase = phase;

    // Code blocks and tables stream as a unit so intermediate markdown stays parseable.
    if (block.startsWith("```") || block.startsWith("|")) {
      yield { text: block + "\n\n", phase };
      await new Promise((r) => setTimeout(r, 220));
      continue;
    }

    const words = block.split(" ");
    for (let i = 0; i < words.length; i += 4) {
      if (signal?.aborted) return;
      yield {
        text: words.slice(i, i + 4).join(" ") + (i + 4 < words.length ? " " : ""),
        phase: i === 0 ? phase : undefined,
      };
      await new Promise((r) => setTimeout(r, 24));
    }
    yield { text: "\n\n" };
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
