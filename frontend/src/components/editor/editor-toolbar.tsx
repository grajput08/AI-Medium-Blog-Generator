"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Code2,
  Download,
  FileUp,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Smile,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  downloadTextFile,
  htmlToMarkdown,
  markdownToHtml,
} from "@/lib/editor/markdown";
import { cn } from "@/lib/utils";

const EMOJI = [
  "🚀", "✨", "🔥", "💡", "🎯", "✅", "⚡", "🧠",
  "📈", "📚", "🛠️", "🐛", "💻", "🌱", "🏆", "👏",
  "🤔", "😅", "🎉", "❤️", "⭐", "☕", "🔍", "📝",
];

function ToolButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn("size-8", active && "bg-accent text-accent-foreground")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
      codeBlock: editor.isActive("codeBlock"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  function setLink() {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }

  function importMarkdown(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      editor.commands.setContent(markdownToHtml(String(reader.result)));
      toast.success(`Imported ${file.name}`);
    };
    reader.readAsText(file);
  }

  function insertImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: String(reader.result) }).run();
    };
    reader.readAsDataURL(file);
  }

  function exportMarkdown() {
    const markdown = htmlToMarkdown(editor.getHTML());
    const title =
      editor.state.doc.firstChild?.textContent.trim().slice(0, 48) || "article";
    downloadTextFile(`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`, markdown);
    toast.success("Markdown exported.");
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
      <ToolButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!state.canUndo}
      >
        <Undo2 />
      </ToolButton>
      <ToolButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!state.canRedo}
      >
        <Redo2 />
      </ToolButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolButton
        label="Heading 1"
        active={state.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 />
      </ToolButton>
      <ToolButton
        label="Heading 2"
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolButton>
      <ToolButton
        label="Heading 3"
        active={state.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </ToolButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolButton
        label="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolButton>
      <ToolButton
        label="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolButton>
      <ToolButton
        label="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </ToolButton>
      <ToolButton
        label="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough />
      </ToolButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolButton
        label="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolButton>
      <ToolButton
        label="Quote"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote />
      </ToolButton>
      <ToolButton
        label="Code block"
        active={state.codeBlock}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 />
      </ToolButton>
      <ToolButton
        label="Insert table"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon />
      </ToolButton>
      <Separator orientation="vertical" className="mx-1 h-5" />

      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Link"
            className={cn(
              "size-8",
              state.link && "bg-accent text-accent-foreground"
            )}
          >
            <Link2 />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-72 items-center gap-2 p-2">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            aria-label="Link URL"
            onKeyDown={(e) => e.key === "Enter" && setLink()}
          />
          <Button type="button" size="sm" onClick={setLink}>
            {state.link && !linkUrl ? "Remove" : "Set"}
          </Button>
        </PopoverContent>
      </Popover>

      <ToolButton label="Insert image" onClick={() => imageInputRef.current?.click()}>
        <ImageIcon />
      </ToolButton>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Emoji"
            className="size-8"
          >
            <Smile />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="grid w-56 grid-cols-8 gap-0.5 p-2">
          {EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded p-1 text-lg leading-none hover:bg-accent"
              onClick={() => editor.chain().focus().insertContent(emoji).run()}
              aria-label={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolButton
          label="Import Markdown"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp />
        </ToolButton>
        <ToolButton label="Export Markdown" onClick={exportMarkdown}>
          <Download />
        </ToolButton>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/markdown"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importMarkdown(file);
          e.target.value = "";
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) insertImageFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
