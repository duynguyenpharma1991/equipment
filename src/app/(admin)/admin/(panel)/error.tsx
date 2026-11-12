"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="panel">
      <h1>Đã xảy ra lỗi</h1>
      <p className="notice error">{error.message || "Không thể hoàn tất thao tác."}</p>
      <button type="button" className="btn primary" onClick={reset}>
        Thử lại
      </button>
    </div>
  );
}
