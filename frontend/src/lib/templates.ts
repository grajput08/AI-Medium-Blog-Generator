import type { GeneratorConfig } from "@/lib/validations/blog";

export type BlogTemplate = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  outline: string[];
  config: Partial<GeneratorConfig>;
};

export const PREFILL_KEY = "inkwell.generator.prefill";

export const templates: BlogTemplate[] = [
  {
    id: "tutorial",
    name: "Tutorial",
    description: "Step-by-step teaching with code, checkpoints, and a working result.",
    emoji: "📘",
    category: "Programming",
    outline: ["The goal", "Prerequisites", "Step-by-step build", "Common pitfalls", "Where to go next"],
    config: { style: "tutorial", tone: "beginner", category: "programming", keywords: ["tutorial"], includeToc: true, includeFaqs: true },
  },
  {
    id: "react",
    name: "React Deep Dive",
    description: "A focused exploration of one React pattern, API, or performance trap.",
    emoji: "⚛️",
    category: "React",
    outline: ["The problem", "How React handles it", "Code walkthrough", "Benchmarks", "Takeaways"],
    config: { style: "technical-guide", tone: "technical", category: "programming", keywords: ["react"], audience: "React developers" },
  },
  {
    id: "vue",
    name: "Vue Guide",
    description: "Composition API patterns and ecosystem guidance for Vue developers.",
    emoji: "💚",
    category: "Vue",
    outline: ["Why this matters in Vue", "Setup", "Pattern walkthrough", "Pinia/router notes", "Summary"],
    config: { style: "technical-guide", tone: "friendly", category: "programming", keywords: ["vue"], audience: "Vue developers" },
  },
  {
    id: "nextjs",
    name: "Next.js Recipe",
    description: "App Router recipes: caching, server components, and deployment.",
    emoji: "▲",
    category: "Next.js",
    outline: ["The use case", "App Router approach", "Code", "Edge cases", "Deploy notes"],
    config: { style: "how-to", tone: "technical", category: "programming", keywords: ["nextjs"], audience: "Next.js developers" },
  },
  {
    id: "javascript",
    name: "JavaScript Explainer",
    description: "Demystify one JavaScript concept with runnable examples.",
    emoji: "🟨",
    category: "JavaScript",
    outline: ["The confusion", "The mental model", "Examples", "Gotchas", "Cheat sheet"],
    config: { style: "tutorial", tone: "conversational", category: "programming", keywords: ["javascript"] },
  },
  {
    id: "interview",
    name: "Interview Experience",
    description: "Share your interview journey — process, questions, and lessons.",
    emoji: "🎤",
    category: "Career",
    outline: ["The role & company", "Application to offer timeline", "Round-by-round", "What worked", "Advice"],
    config: { style: "interview-experience", tone: "conversational", category: "career", keywords: ["interview"], includeFaqs: true },
  },
  {
    id: "career",
    name: "Career Growth",
    description: "Practical career advice drawn from real experience.",
    emoji: "🪜",
    category: "Career",
    outline: ["Where most people get stuck", "The shift that matters", "Concrete steps", "Pitfalls", "90-day plan"],
    config: { style: "opinion", tone: "motivational", category: "career", keywords: ["career growth"] },
  },
  {
    id: "ai",
    name: "AI Insight",
    description: "Cut through AI hype with hands-on analysis and real workflows.",
    emoji: "🤖",
    category: "AI",
    outline: ["The claim", "What it actually does", "Hands-on test", "Where it fits", "Verdict"],
    config: { style: "case-study", tone: "expert", category: "ai-ml", keywords: ["ai"], audience: "tech professionals" },
  },
  {
    id: "productivity",
    name: "Productivity System",
    description: "A system or workflow piece with templates readers can copy.",
    emoji: "⏱️",
    category: "Productivity",
    outline: ["The overwhelm", "The system", "Daily walkthrough", "Tools", "Starting small"],
    config: { style: "listicle", tone: "friendly", category: "productivity", keywords: ["productivity"] },
  },
  {
    id: "finance",
    name: "Finance Explainer",
    description: "Make one money concept simple, with worked numbers.",
    emoji: "💰",
    category: "Finance",
    outline: ["The concept", "Why it matters", "Worked example", "Mistakes", "Action steps"],
    config: { style: "how-to", tone: "professional", category: "finance", keywords: ["personal finance"], audience: "young professionals" },
  },
  {
    id: "travel",
    name: "Travel Story",
    description: "A narrative travel piece with practical logistics woven in.",
    emoji: "🧭",
    category: "Travel",
    outline: ["The hook moment", "Planning", "The journey", "What surprised me", "Practical guide"],
    config: { style: "story", tone: "conversational", category: "travel", keywords: ["travel"] },
  },
  {
    id: "technology",
    name: "Tech Trend Analysis",
    description: "Analyze where a technology is heading and who should care.",
    emoji: "📡",
    category: "Technology",
    outline: ["The trend", "Evidence", "Winners & losers", "Timeline", "What to do now"],
    config: { style: "ai-news", tone: "expert", category: "technology", keywords: ["technology trends"] },
  },
  {
    id: "startup",
    name: "Startup Lessons",
    description: "Build-in-public lessons from wins and failures.",
    emoji: "🚀",
    category: "Startup",
    outline: ["The decision", "Context & stakes", "What happened", "The lesson", "What I'd do differently"],
    config: { style: "story", tone: "conversational", category: "startup", keywords: ["startup"] },
  },
  {
    id: "business",
    name: "Business Playbook",
    description: "A repeatable process piece for operators and founders.",
    emoji: "📊",
    category: "Business",
    outline: ["The outcome", "The playbook", "Step details", "Metrics", "Templates"],
    config: { style: "case-study", tone: "professional", category: "business", keywords: ["business strategy"] },
  },
  {
    id: "marketing",
    name: "Marketing Breakdown",
    description: "Deconstruct a campaign or channel with real numbers.",
    emoji: "📣",
    category: "Marketing",
    outline: ["The campaign", "Strategy", "Execution", "Results & numbers", "Steal this"],
    config: { style: "comparison", tone: "professional", category: "marketing", keywords: ["marketing"] },
  },
];
