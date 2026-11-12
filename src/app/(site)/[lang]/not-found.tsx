import Link from "next/link";

// Rendered inside the locale layout (header/footer stay). It has no access to
// the locale param, so the message is shown in both languages.
export default function NotFound() {
  return (
    <div className="container notfound">
      <h1>404</h1>
      <p>Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <p>The page you are looking for does not exist or has moved.</p>
      <p style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <Link href="/vi" className="btn">
          Trang chủ
        </Link>
        <Link href="/en" className="btn btn-outline">
          Home
        </Link>
      </p>
    </div>
  );
}
