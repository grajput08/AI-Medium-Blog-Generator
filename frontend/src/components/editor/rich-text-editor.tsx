"use client";

import { useEffect } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

type RichTextEditorProps = {
  initialContent?: string;
  editable?: boolean;
  onReady?: (editor: Editor) => void;
  onUpdate?: (editor: Editor) => void;
  className?: string;
};

export function RichTextEditor({
  initialContent = "",
  editable = true,
  onReady,
  onUpdate,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: { openOnClick: false },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      TableKit.configure({ table: { resizable: false } }),
      Image,
      Placeholder.configure({
        placeholder: "Start writing, or generate an article…",
      }),
      CharacterCount,
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none",
        "aria-label": "Article editor",
      },
    },
    onCreate: ({ editor }) => onReady?.(editor),
    onUpdate: ({ editor }) => onUpdate?.(editor),
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  return (
    <div className={cn("glass flex min-h-0 flex-col rounded-xl", className)}>
      {editor && <EditorToolbar editor={editor} />}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
        <EditorContent editor={editor} />
      </div>
      {editor && (
        <div className="flex items-center justify-end gap-3 border-t px-4 py-1.5 text-xs text-muted-foreground tabular-nums">
          <span>{editor.storage.characterCount.words()} words</span>
          <span>{editor.storage.characterCount.characters()} characters</span>
        </div>
      )}
    </div>
  );
}
