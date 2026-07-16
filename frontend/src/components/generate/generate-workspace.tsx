"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Cpu, FileDown, Loader2, RotateCcw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { FeaturedImagePanel } from "@/components/editor/featured-image-panel";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SeoPanel, slugify, type SeoMeta } from "@/components/editor/seo-panel";
import { GeneratorForm } from "@/components/generate/generator-form";
import { estimateTokens, streamMockArticle } from "@/lib/ai/mock-generator";
import { htmlToMarkdown, markdownToHtml } from "@/lib/editor/markdown";
import { loadSettings } from "@/lib/settings";
import { PREFILL_KEY } from "@/lib/templates";
import type { GeneratorConfig } from "@/lib/validations/blog";

type Stage = "configure" | "generating" | "editing";

const DRAFT_KEY = "inkwell.draft.current";

export function GenerateWorkspace() {
  const [stage, setStage] = useState<Stage>("configure");
  const [config, setConfig] = useState<GeneratorConfig | null>(null);
  const [phase, setPhase] = useState("Warming up");
  const [tokens, setTokens] = useState(0);
  const [seoMeta, setSeoMeta] = useState<SeoMeta>({
    seoTitle: "",
    metaDescription: "",
    slug: "",
  });
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [prefill, setPrefill] = useState<Partial<GeneratorConfig> | undefined>();
  const [prefillReady, setPrefillReady] = useState(false);

  // Template pre-fill handoff from the Templates gallery.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFILL_KEY);
      if (raw) {
        setPrefill(JSON.parse(raw) as Partial<GeneratorConfig>);
        localStorage.removeItem(PREFILL_KEY);
      }
    } finally {
      setPrefillReady(true);
    }
  }, []);

  const editorRef = useRef<Editor | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const syncFromEditor = useCallback((editor: Editor) => {
    setBodyText(editor.getText());
    setBodyHtml(editor.getHTML());
    const firstNode = editor.state.doc.firstChild;
    if (firstNode?.type.name === "heading") {
      setArticleTitle(firstNode.textContent.trim());
    }
  }, []);

  const saveDraft = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        markdown: htmlToMarkdown(editor.getHTML()),
        seoMeta,
        featuredImage,
        config,
        tokens,
        savedAt: new Date().toISOString(),
      })
    );
    setSavedAt(new Date());
  }, [seoMeta, featuredImage, config, tokens]);

  const handleEditorUpdate = useCallback(
    (editor: Editor) => {
      syncFromEditor(editor);
      const interval = loadSettings().autosaveSeconds;
      if (interval <= 0 || stage !== "editing") return;
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(saveDraft, interval * 1000);
    },
    [syncFromEditor, saveDraft, stage]
  );

  async function runGeneration(cfg: GeneratorConfig) {
    const editor = editorRef.current;
    if (!editor) return;

    setStage("generating");
    setConfig(cfg);
    setTokens(0);
    editor.commands.clearContent();
    editor.setEditable(false);

    const abort = new AbortController();
    abortRef.current = abort;

    let buffer = "";
    try {
      for await (const chunk of streamMockArticle(cfg, abort.signal)) {
        buffer += chunk.text;
        if (chunk.phase) setPhase(chunk.phase);
        setTokens(estimateTokens(buffer));
        editor.commands.setContent(markdownToHtml(buffer));
      }
    } finally {
      abortRef.current = null;
    }
    if (abort.signal.aborted) return;

    editor.setEditable(true);
    syncFromEditor(editor);

    // Derive SEO metadata from the finished article, honoring the toggles.
    const title = editor.state.doc.firstChild?.textContent.trim() ?? cfg.topic;
    const plain = editor.getText();
    const intro =
      plain
        .split("\n")
        .find((p) => p.trim().length > 100)
        ?.trim() ?? plain.slice(0, 200);
    setSeoMeta({
      seoTitle: cfg.generateSeoTitle
        ? `${title.slice(0, 52)} (${new Date().getFullYear()})`.slice(0, 60)
        : "",
      metaDescription: cfg.generateMetaDescription ? intro.slice(0, 156) : "",
      slug: slugify(title),
    });

    setStage("editing");
    toast.success("Article generated — it's all yours now.");
  }

  function resetToConfigure() {
    abortRef.current?.abort();
    editorRef.current?.commands.clearContent();
    setFeaturedImage(null);
    setSeoMeta({ seoTitle: "", metaDescription: "", slug: "" });
    setTokens(0);
    setSavedAt(null);
    setStage("configure");
  }

  return (
    <div className="flex flex-col gap-4">
      {stage === "configure" && (
        <>
          <PageHeader
            title="Generate Blog"
            description="Configure your article and let AI draft it — every word stays editable."
          />
          {prefillReady && (
            <GeneratorForm onGenerate={runGeneration} initialValues={prefill} />
          )}
        </>
      )}

      {stage !== "configure" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-auto">
            <h1 className="font-display text-xl font-semibold tracking-tight">
              {stage === "generating" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                  {phase}…
                </span>
              ) : (
                articleTitle || "Your article"
              )}
            </h1>
            {savedAt && stage === "editing" && (
              <p className="text-xs text-muted-foreground">
                Draft saved {savedAt.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="gap-1 tabular-nums">
            <Cpu className="size-3" aria-hidden /> {tokens.toLocaleString()} tokens
          </Badge>
          {stage === "editing" && config && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => runGeneration(config)}
              >
                <RotateCcw className="size-4" aria-hidden /> Regenerate
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => { saveDraft(); toast.success("Draft saved."); }}>
                <Save className="size-4" aria-hidden /> Save draft
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => setConfirmReset(true)}
              >
                <Sparkles className="size-4" aria-hidden /> New article
              </Button>
            </>
          )}
        </div>
      )}

      <div
        className={
          stage === "configure"
            ? "hidden"
            : "grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_20rem]"
        }
      >
        <RichTextEditor
          onReady={(editor) => {
            editorRef.current = editor;
          }}
          onUpdate={handleEditorUpdate}
          className="min-h-[60svh]"
        />

        {stage === "editing" && (
          <div className="glass rounded-xl p-4 xl:sticky xl:top-20">
            <Tabs defaultValue="seo">
              <TabsList className="w-full">
                <TabsTrigger value="seo" className="flex-1">
                  SEO
                </TabsTrigger>
                <TabsTrigger value="image" className="flex-1">
                  Featured image
                </TabsTrigger>
              </TabsList>
              <TabsContent value="seo" className="mt-4">
                <SeoPanel
                  meta={seoMeta}
                  onMetaChange={setSeoMeta}
                  text={bodyText}
                  html={bodyHtml}
                  keywords={config?.keywords ?? []}
                  hasFeaturedImage={!!featuredImage}
                />
              </TabsContent>
              <TabsContent value="image" className="mt-4">
                <FeaturedImagePanel
                  articleTitle={articleTitle}
                  featuredImage={featuredImage}
                  onFeaturedImageChange={setFeaturedImage}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
        {stage === "generating" && (
          <div className="glass hidden flex-col gap-3 rounded-xl p-5 text-sm text-muted-foreground xl:flex xl:sticky xl:top-20">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <FileDown className="size-4 text-primary" aria-hidden />
              Streaming your article
            </p>
            <p>
              The draft writes itself section by section. When it finishes, the
              editor unlocks and the SEO panel scores what was written.
            </p>
            <p className="text-xs">
              Tip: you can read along while it streams — nothing here is final
              until you say so.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Start a new article?"
        description="The current article stays in your saved draft, but unsaved edits are discarded."
        confirmLabel="Start new"
        onConfirm={resetToConfigure}
      />
    </div>
  );
}
