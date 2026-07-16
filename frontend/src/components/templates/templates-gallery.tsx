"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PREFILL_KEY, templates, type BlogTemplate } from "@/lib/templates";

export function TemplatesGallery() {
  const router = useRouter();
  const [preview, setPreview] = useState<BlogTemplate | null>(null);

  function applyTemplate(template: BlogTemplate) {
    localStorage.setItem(PREFILL_KEY, JSON.stringify(template.config));
    router.push("/generate");
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="glass gap-0 py-4">
            <CardContent className="flex h-full flex-col px-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl" aria-hidden>
                  {template.emoji}
                </span>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <h3 className="font-display text-base font-semibold">
                {template.name}
              </h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {template.description}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setPreview(template)}
                >
                  <Eye className="size-3.5" aria-hidden /> Preview
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => applyTemplate(template)}
                >
                  Use template <ArrowRight className="size-3.5" aria-hidden />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-md">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2 text-lg">
                  <span aria-hidden>{preview.emoji}</span> {preview.name}
                </DialogTitle>
                <DialogDescription>{preview.description}</DialogDescription>
              </DialogHeader>
              <div>
                <p className="mb-2 text-sm font-medium">Article outline</p>
                <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-muted-foreground">
                  {preview.outline.map((section) => (
                    <li key={section}>{section}</li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {preview.config.style && (
                    <Badge variant="secondary">{preview.config.style}</Badge>
                  )}
                  {preview.config.tone && (
                    <Badge variant="secondary">{preview.config.tone}</Badge>
                  )}
                  {preview.config.keywords?.map((k) => (
                    <Badge key={k} variant="secondary">
                      #{k}
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => applyTemplate(preview)} className="gap-1.5">
                  Use template <ArrowRight className="size-3.5" aria-hidden />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
