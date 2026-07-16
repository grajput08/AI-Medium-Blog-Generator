"use client";

import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Check, Download, ImagePlus, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  cropAndResizeImage,
  downloadDataUrl,
  generateCoverImage,
  type CropArea,
} from "@/lib/editor/image";

type FeaturedImagePanelProps = {
  articleTitle: string;
  featuredImage: string | null;
  onFeaturedImageChange: (dataUrl: string | null) => void;
};

export function FeaturedImagePanel({
  articleTitle,
  featuredImage,
  onFeaturedImageChange,
}: FeaturedImagePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [workingImage, setWorkingImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [outputWidth, setOutputWidth] = useState(1200);
  const uploadRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback(
    (_area: unknown, areaPixels: CropArea) => setCropArea(areaPixels),
    []
  );

  async function handleGenerate() {
    setGenerating(true);
    // Mock latency; the real /ai/image call replaces this in Phase 6/7.
    await new Promise((r) => setTimeout(r, 900));
    setWorkingImage(
      generateCoverImage(articleTitle || "Untitled article", prompt || articleTitle)
    );
    setGenerating(false);
    setZoom(1);
  }

  function handleUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setWorkingImage(String(reader.result));
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }

  async function finalize(): Promise<string | null> {
    if (!workingImage) return null;
    if (!cropArea) return workingImage;
    return cropAndResizeImage(workingImage, cropArea, outputWidth);
  }

  async function handleUse() {
    const result = await finalize();
    if (result) {
      onFeaturedImageChange(result);
      toast.success("Featured image set.");
    }
  }

  async function handleDownload() {
    const result = await finalize();
    if (result) downloadDataUrl("featured-image.png", result);
  }

  return (
    <div className="flex flex-col gap-4">
      {featuredImage && (
        <div>
          <p className="mb-1.5 text-sm font-medium">Current featured image</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featuredImage}
            alt="Current featured"
            className="w-full rounded-lg border"
          />
        </div>
      )}

      <Tabs defaultValue="generate">
        <TabsList className="w-full">
          <TabsTrigger value="generate" className="flex-1 gap-1.5">
            <Sparkles className="size-3.5" aria-hidden /> Generate
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 gap-1.5">
            <Upload className="size-3.5" aria-hidden /> Upload
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-3 flex flex-col gap-2">
          <Label htmlFor="image-prompt">Image prompt</Label>
          <Input
            id="image-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={articleTitle || "Describe the cover image"}
          />
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            <ImagePlus aria-hidden />
            {generating ? "Generating…" : "Generate cover"}
          </Button>
        </TabsContent>
        <TabsContent value="upload" className="mt-3">
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => uploadRef.current?.click()}
          >
            <Upload aria-hidden /> Choose an image
          </Button>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </TabsContent>
      </Tabs>

      {workingImage && (
        <div className="flex flex-col gap-3">
          <div className="relative h-44 overflow-hidden rounded-lg border bg-muted">
            <Cropper
              image={workingImage}
              crop={crop}
              zoom={zoom}
              aspect={1.91}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div>
            <Label htmlFor="zoom-slider" className="mb-1.5 text-xs">
              Zoom
            </Label>
            <Slider
              id="zoom-slider"
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              aria-label="Crop zoom"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="output-width" className="text-xs">
              Output width
            </Label>
            <Select
              value={String(outputWidth)}
              onValueChange={(v) => setOutputWidth(Number(v))}
            >
              <SelectTrigger id="output-width" className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1200">1200 px</SelectItem>
                <SelectItem value="800">800 px</SelectItem>
                <SelectItem value="600">600 px</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={handleDownload} className="gap-1.5">
              <Download className="size-4" aria-hidden /> Download
            </Button>
            <Button onClick={handleUse} className="gap-1.5">
              <Check className="size-4" aria-hidden /> Use image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
