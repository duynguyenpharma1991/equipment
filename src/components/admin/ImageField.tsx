"use client";

import { useRef, useState } from "react";
import { uploadToMedia } from "@/components/admin/uploader";

export function ImageField({
  name,
  defaultValue,
  kind = "image",
  folder = "images",
}: {
  name: string;
  defaultValue?: string | null;
  kind?: "image" | "file";
  folder?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setUrl(await uploadToMedia(file, kind === "file" ? "files" : folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải lên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="upload">
      {kind === "image" && url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="upload-preview" src={url} alt="" />
      ) : null}
      <div className="upload-body">
        <input
          type="text"
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… hoặc bấm “Tải lên”"
          maxLength={1000}
        />
        <div className="upload-actions">
          <button type="button" className="btn small" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? "Đang tải…" : kind === "file" ? "Tải PDF lên" : "Tải ảnh lên"}
          </button>
          {url ? (
            <button type="button" className="btn small ghost" onClick={() => setUrl("")}>
              Xoá
            </button>
          ) : null}
          {kind === "file" && url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              Mở tệp
            </a>
          ) : null}
        </div>
        {error ? <p className="field-error">{error}</p> : null}
      </div>
      <input
        ref={input}
        type="file"
        hidden
        accept={kind === "file" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/gif,image/svg+xml"}
        onChange={onFile}
      />
    </div>
  );
}
