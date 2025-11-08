"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "paste" | "pdf" | "image";

export function ReportUpload() {
  const [mode, setMode] = useState<Mode>("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <ToggleChip label="Paste text" active={mode === "paste"} onClick={() => setMode("paste")} />
        <ToggleChip label="Upload PDF" active={mode === "pdf"} onClick={() => setMode("pdf")} />
        <ToggleChip label="Upload image" active={mode === "image"} onClick={() => setMode("image")} />
      </div>

      {mode === "paste" && (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste medical report text here..."
            className="w-full min-h-[160px] rounded-2xl border bg-transparent p-3 text-sm"
          />
          <div className="flex justify-end">
            <Button type="button" disabled={!text.trim()}>
              Explain report
            </Button>
          </div>
        </div>
      )}

      {mode === "pdf" && (
        <div className="space-y-3">
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{file ? file.name : "No file selected"}</span>
            <Button type="button" disabled={!file}>
              Extract & explain
            </Button>
          </div>
        </div>
      )}

      {mode === "image" && (
        <div className="space-y-3">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{file ? file.name : "No image selected"}</span>
            <Button type="button" disabled={!file}>
              OCR & explain
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
      ].join(" ")}
    >
      {label}
    </button>
  );
}


