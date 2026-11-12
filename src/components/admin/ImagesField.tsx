"use client";

import { useRef, useState } from "react";
import { uploadToMedia } from "@/components/admin/uploader";

export function ImagesField({ name, defaultValue }: { name: string; defaultValue?: string[] }) {
  const [items, setItems] = useState<string[]>(defaultValue ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) uploaded.push(await uploadToMedia(file, "products"));
      setItems((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải lên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, delta: number) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="thumbs">
        {items.map((src, i) => (
          <div className="thumb" key={`${src}-${i}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
            <div className="thumb-actions">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên trước">
                ◀
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Xuống sau">
                ▶
              </button>
              <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} aria-label="Xoá">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn small" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Đang tải…" : "+ Thêm ảnh"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
      <input
        ref={input}
        type="file"
        hidden
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onFiles}
      />
    </div>
  );
}
