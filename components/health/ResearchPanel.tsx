"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResearchPanel() {
  const [topic, setTopic] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  const addUrl = () => {
    const value = urlInput.trim();
    if (!value) return;
    setUrls((prev) => Array.from(new Set([...prev, value])));
    setUrlInput("");
  };

  const removeUrl = (u: string) => {
    setUrls((prev) => prev.filter((x) => x !== u));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Topic</label>
        <Input
          placeholder="e.g., creatine benefits, Zone 2 cardio, sleep hygiene"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Add URLs (optional)</label>
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/article"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button type="button" onClick={addUrl}>
            Add
          </Button>
        </div>
        {urls.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {urls.map((u) => (
              <span
                key={u}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs"
              >
                <span className="truncate max-w-[240px]">{u}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => removeUrl(u)}
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" disabled={!topic.trim()}>
          Research
        </Button>
      </div>
    </div>
  );
}


