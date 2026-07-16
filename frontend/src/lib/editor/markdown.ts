import { marked } from "marked";
import TurndownService from "turndown";

marked.setOptions({ gfm: true, breaks: false });

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false });
}

let turndown: TurndownService | null = null;

export function htmlToMarkdown(html: string): string {
  if (!turndown) {
    turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "*",
    });
    // Keep table HTML intact — GFM tables round-trip poorly through turndown.
    turndown.keep(["table"]);
  }
  return turndown.turndown(html);
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
