"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { KeywordInput } from "@/components/generate/keyword-input";
import { languages, loadSettings, tones, writingStyles } from "@/lib/settings";
import {
  categories,
  generatorSchema,
  type GeneratorConfig,
} from "@/lib/validations/blog";

const toggles = [
  { name: "includeToc", label: "Table of contents" },
  { name: "includeFaqs", label: "FAQs section" },
  { name: "includeConclusion", label: "Conclusion" },
  { name: "includeCta", label: "Call to action" },
  { name: "generateImage", label: "Featured image" },
  { name: "generateSeoTitle", label: "SEO title" },
  { name: "generateMetaDescription", label: "Meta description" },
] as const;

type GeneratorFormProps = {
  onGenerate: (config: GeneratorConfig) => void;
  /** Pre-fill from a template (Phase 4) or a previous run. */
  initialValues?: Partial<GeneratorConfig>;
};

export function GeneratorForm({ onGenerate, initialValues }: GeneratorFormProps) {
  const form = useForm<GeneratorConfig>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      topic: "",
      keywords: [],
      style: "tutorial",
      tone: "professional",
      audience: "developers",
      language: "english",
      wordCount: 1500,
      creativity: 50,
      category: "programming",
      includeFaqs: true,
      includeToc: true,
      includeConclusion: true,
      includeCta: true,
      generateImage: true,
      generateMetaDescription: true,
      generateSeoTitle: true,
      ...initialValues,
    },
  });

  // Writing defaults from Settings apply unless a template already set them.
  useEffect(() => {
    const settings = loadSettings();
    if (!initialValues?.style) form.setValue("style", settings.defaultStyle);
    if (!initialValues?.tone) form.setValue("tone", settings.defaultTone);
    if (!initialValues?.language)
      form.setValue("language", settings.defaultLanguage);
  }, [form, initialValues]);

  const wordCount = form.watch("wordCount");
  const creativity = form.watch("creativity");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onGenerate)}
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        noValidate
      >
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                What are we writing?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog topic</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="e.g. A practical guide to React Server Components for teams migrating from SPAs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <KeywordInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      Up to 8. The first keyword anchors the SEO checks.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. junior frontend developers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pick a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display text-lg">Voice & shape</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {(
                  [
                    { name: "style", label: "Writing style", options: writingStyles },
                    { name: "tone", label: "Tone", options: tones },
                    { name: "language", label: "Language", options: languages },
                  ] as const
                ).map(({ name, label, options }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormField
                control={form.control}
                name="wordCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Word count
                      <span className="ml-auto font-normal text-muted-foreground tabular-nums">
                        ~{field.value.toLocaleString()} words
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={500}
                        max={5000}
                        step={250}
                        value={[field.value]}
                        onValueChange={([v]) => field.onChange(v)}
                        aria-label="Word count"
                      />
                    </FormControl>
                    <FormDescription>
                      {wordCount < 1000
                        ? "Quick read — a focused take on one idea."
                        : wordCount < 2500
                          ? "Standard Medium article — the sweet spot for engagement."
                          : "Deep dive — best for tutorials and definitive guides."}
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creativity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Creativity
                      <span className="ml-auto font-normal text-muted-foreground tabular-nums">
                        {field.value}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={([v]) => field.onChange(v)}
                        aria-label="Creativity level"
                      />
                    </FormControl>
                    <FormDescription>
                      {creativity < 35
                        ? "Factual and precise — sticks close to convention."
                        : creativity < 70
                          ? "Balanced — clear structure with some personality."
                          : "Adventurous — bolder analogies and voice."}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display text-lg">Include</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {toggles.map((toggle) => (
                <FormField
                  key={toggle.name}
                  control={form.control}
                  name={toggle.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-2">
                      <FormLabel className="font-normal">{toggle.label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>
          <Button type="submit" size="lg" className="gap-2">
            <Sparkles aria-hidden /> Generate article
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Generation streams into the editor — you can start reading immediately.
          </p>
        </div>
      </form>
    </Form>
  );
}
