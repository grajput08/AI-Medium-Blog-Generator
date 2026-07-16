"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type KeywordInputProps = {
  value: string[];
  onChange: (keywords: string[]) => void;
  max?: number;
  placeholder?: string;
};

export function KeywordInput({
  value,
  onChange,
  max = 8,
  placeholder = "Type a keyword and press Enter",
}: KeywordInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const keyword = draft.trim().toLowerCase();
    if (keyword && !value.includes(keyword) && value.length < max) {
      onChange([...value, keyword]);
    }
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length >= max ? "Keyword limit reached" : placeholder}
        disabled={value.length >= max}
        aria-label="Add keyword"
      />
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="gap-1 pr-1">
              {keyword}
              <button
                type="button"
                onClick={() => onChange(value.filter((k) => k !== keyword))}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remove keyword ${keyword}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
