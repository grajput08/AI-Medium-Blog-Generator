// Canvas helpers for the featured-image workflow. The "generated" image is a
// deterministic local render until the real /ai/image endpoint exists (Phase 6).

export function generateCoverImage(title: string, prompt: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 628;
  const ctx = canvas.getContext("2d")!;

  // Ink-to-emerald gradient base, seeded by the prompt for variety.
  const seed = [...prompt].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hueShift = (seed % 5) * 8;
  const gradient = ctx.createLinearGradient(0, 0, 1200, 628);
  gradient.addColorStop(0, `oklch(0.22 0.03 ${170 + hueShift})`);
  gradient.addColorStop(0.65, `oklch(0.35 0.08 ${165 + hueShift})`);
  gradient.addColorStop(1, `oklch(0.55 0.12 ${160 + hueShift})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 628);

  // Soft translucent circles for depth.
  for (let i = 0; i < 6; i++) {
    const x = ((seed * (i + 3)) % 1200 + 1200) % 1200;
    const y = ((seed * (i + 7)) % 628 + 628) % 628;
    const r = 60 + ((seed * (i + 1)) % 140);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `oklch(0.9 0.05 165 / ${0.04 + (i % 3) * 0.02})`;
    ctx.fill();
  }

  // Title, wrapped, in an editorial serif.
  ctx.fillStyle = "oklch(0.97 0.01 150)";
  ctx.font = "600 64px Georgia, 'Times New Roman', serif";
  ctx.textBaseline = "top";
  const words = title.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > 1000 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const startY = 314 - (lines.length * 78) / 2;
  lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, 100, startY + i * 78));

  // Byline mark.
  ctx.font = "500 26px Georgia, serif";
  ctx.fillStyle = "oklch(0.85 0.08 163)";
  ctx.fillText("✒ Inkwell", 100, 540);

  return canvas.toDataURL("image/png");
}

export type CropArea = { x: number; y: number; width: number; height: number };

export async function cropAndResizeImage(
  src: string,
  crop: CropArea,
  outputWidth: number
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  const scale = outputWidth / crop.width;
  canvas.width = Math.round(crop.width * scale);
  canvas.height = Math.round(crop.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
