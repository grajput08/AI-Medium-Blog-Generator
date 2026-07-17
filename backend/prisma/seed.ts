import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Mirrors frontend/src/lib/validations/blog.ts
const categories = [
  "Technology", "Programming", "AI & Machine Learning", "Career", "Productivity",
  "Finance", "Travel", "Startup", "Business", "Marketing", "Design",
];

// Mirrors frontend/src/lib/templates.ts
const templates = [
  { name: "Tutorial", emoji: "📘", category: "Programming", description: "Step-by-step teaching with code, checkpoints, and a working result.", outline: ["The goal", "Prerequisites", "Step-by-step build", "Common pitfalls", "Where to go next"], defaultConfig: { style: "tutorial", tone: "beginner", category: "programming", keywords: ["tutorial"], includeToc: true, includeFaqs: true } },
  { name: "React Deep Dive", emoji: "⚛️", category: "React", description: "A focused exploration of one React pattern, API, or performance trap.", outline: ["The problem", "How React handles it", "Code walkthrough", "Benchmarks", "Takeaways"], defaultConfig: { style: "technical-guide", tone: "technical", category: "programming", keywords: ["react"], audience: "React developers" } },
  { name: "Vue Guide", emoji: "💚", category: "Vue", description: "Composition API patterns and ecosystem guidance for Vue developers.", outline: ["Why this matters in Vue", "Setup", "Pattern walkthrough", "Pinia/router notes", "Summary"], defaultConfig: { style: "technical-guide", tone: "friendly", category: "programming", keywords: ["vue"], audience: "Vue developers" } },
  { name: "Next.js Recipe", emoji: "▲", category: "Next.js", description: "App Router recipes: caching, server components, and deployment.", outline: ["The use case", "App Router approach", "Code", "Edge cases", "Deploy notes"], defaultConfig: { style: "how-to", tone: "technical", category: "programming", keywords: ["nextjs"], audience: "Next.js developers" } },
  { name: "JavaScript Explainer", emoji: "🟨", category: "JavaScript", description: "Demystify one JavaScript concept with runnable examples.", outline: ["The confusion", "The mental model", "Examples", "Gotchas", "Cheat sheet"], defaultConfig: { style: "tutorial", tone: "conversational", category: "programming", keywords: ["javascript"] } },
  { name: "Interview Experience", emoji: "🎤", category: "Career", description: "Share your interview journey — process, questions, and lessons.", outline: ["The role & company", "Application to offer timeline", "Round-by-round", "What worked", "Advice"], defaultConfig: { style: "interview-experience", tone: "conversational", category: "career", keywords: ["interview"], includeFaqs: true } },
  { name: "Career Growth", emoji: "🪜", category: "Career", description: "Practical career advice drawn from real experience.", outline: ["Where most people get stuck", "The shift that matters", "Concrete steps", "Pitfalls", "90-day plan"], defaultConfig: { style: "opinion", tone: "motivational", category: "career", keywords: ["career growth"] } },
  { name: "AI Insight", emoji: "🤖", category: "AI", description: "Cut through AI hype with hands-on analysis and real workflows.", outline: ["The claim", "What it actually does", "Hands-on test", "Where it fits", "Verdict"], defaultConfig: { style: "case-study", tone: "expert", category: "ai-ml", keywords: ["ai"], audience: "tech professionals" } },
  { name: "Productivity System", emoji: "⏱️", category: "Productivity", description: "A system or workflow piece with templates readers can copy.", outline: ["The overwhelm", "The system", "Daily walkthrough", "Tools", "Starting small"], defaultConfig: { style: "listicle", tone: "friendly", category: "productivity", keywords: ["productivity"] } },
  { name: "Finance Explainer", emoji: "💰", category: "Finance", description: "Make one money concept simple, with worked numbers.", outline: ["The concept", "Why it matters", "Worked example", "Mistakes", "Action steps"], defaultConfig: { style: "how-to", tone: "professional", category: "finance", keywords: ["personal finance"], audience: "young professionals" } },
  { name: "Travel Story", emoji: "🧭", category: "Travel", description: "A narrative travel piece with practical logistics woven in.", outline: ["The hook moment", "Planning", "The journey", "What surprised me", "Practical guide"], defaultConfig: { style: "story", tone: "conversational", category: "travel", keywords: ["travel"] } },
  { name: "Tech Trend Analysis", emoji: "📡", category: "Technology", description: "Analyze where a technology is heading and who should care.", outline: ["The trend", "Evidence", "Winners & losers", "Timeline", "What to do now"], defaultConfig: { style: "ai-news", tone: "expert", category: "technology", keywords: ["technology trends"] } },
  { name: "Startup Lessons", emoji: "🚀", category: "Startup", description: "Build-in-public lessons from wins and failures.", outline: ["The decision", "Context & stakes", "What happened", "The lesson", "What I'd do differently"], defaultConfig: { style: "story", tone: "conversational", category: "startup", keywords: ["startup"] } },
  { name: "Business Playbook", emoji: "📊", category: "Business", description: "A repeatable process piece for operators and founders.", outline: ["The outcome", "The playbook", "Step details", "Metrics", "Templates"], defaultConfig: { style: "case-study", tone: "professional", category: "business", keywords: ["business strategy"] } },
  { name: "Marketing Breakdown", emoji: "📣", category: "Marketing", description: "Deconstruct a campaign or channel with real numbers.", outline: ["The campaign", "Strategy", "Execution", "Results & numbers", "Steal this"], defaultConfig: { style: "comparison", tone: "professional", category: "marketing", keywords: ["marketing"] } },
];

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  for (const t of templates) {
    await prisma.template.upsert({
      where: { name: t.name },
      update: {
        description: t.description,
        emoji: t.emoji,
        category: t.category,
        defaultConfig: t.defaultConfig,
        outline: t.outline,
      },
      create: {
        name: t.name,
        description: t.description,
        emoji: t.emoji,
        category: t.category,
        defaultConfig: t.defaultConfig,
        outline: t.outline,
        builtIn: true,
      },
    });
  }

  const demoEmail = "demo@inkwell.dev";
  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Writer",
      passwordHash: await bcrypt.hash("demo-password-123", 12),
      settings: { create: {} },
    },
  });

  console.log(
    `Seeded ${categories.length} categories, ${templates.length} templates, demo user ${demoEmail}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
