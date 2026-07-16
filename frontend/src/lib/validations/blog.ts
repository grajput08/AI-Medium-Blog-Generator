import { z } from "zod";

export const categories = [
  { value: "technology", label: "Technology" },
  { value: "programming", label: "Programming" },
  { value: "ai-ml", label: "AI & Machine Learning" },
  { value: "career", label: "Career" },
  { value: "productivity", label: "Productivity" },
  { value: "finance", label: "Finance" },
  { value: "travel", label: "Travel" },
  { value: "startup", label: "Startup" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "design", label: "Design" },
];

export const generatorSchema = z.object({
  topic: z
    .string()
    .min(10, "Describe your topic in at least 10 characters")
    .max(200, "Keep the topic under 200 characters"),
  keywords: z
    .array(z.string().min(1))
    .min(1, "Add at least one keyword")
    .max(8, "Keep it to 8 keywords or fewer"),
  style: z.string().min(1, "Pick a writing style"),
  tone: z.string().min(1, "Pick a tone"),
  audience: z.string().min(3, "Describe your audience"),
  language: z.string().min(1),
  wordCount: z.number().min(500).max(5000),
  creativity: z.number().min(0).max(100),
  category: z.string().min(1, "Pick a category"),
  includeFaqs: z.boolean(),
  includeToc: z.boolean(),
  includeConclusion: z.boolean(),
  includeCta: z.boolean(),
  generateImage: z.boolean(),
  generateMetaDescription: z.boolean(),
  generateSeoTitle: z.boolean(),
});

export type GeneratorConfig = z.infer<typeof generatorSchema>;
