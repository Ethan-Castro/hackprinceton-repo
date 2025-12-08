"use client";

import { useState } from "react";

type UploadImageProps = {
  onUploaded?: (url: string, publicId: string) => void;
};

export function UploadImage({ onUploaded }: UploadImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const fileInput = event.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setUrl(json.url);
      onUploaded?.(json.url, json.publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="file" type="file" accept="image/*" />
      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {url && (
        <div className="mt-2">
          <img src={url} alt="Uploaded" className="max-w-full rounded border" />
        </div>
      )}
    </form>
  );
}
