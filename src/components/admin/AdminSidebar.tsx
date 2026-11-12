import Link from "next/link";
import { signOutAction } from "@/app/(admin)/admin/actions";

const LINKS = [
  { href: "/admin", label: "Tổng quan", icon: "▦" },
  { href: "/admin/products", label: "Sản phẩm", icon: "⚙" },
  { href: "/admin/categories", label: "Danh mục", icon: "☰" },
  { href: "/admin/news", label: "Tin tức", icon: "✎" },
  { href: "/admin/banners", label: "Banner", icon: "▭" },
  { href: "/admin/videos", label: "Video", icon: "▶" },
  { href: "/admin/inquiries", label: "Yêu cầu báo giá", icon: "✉" },
  { href: "/admin/settings", label: "Cài đặt chung", icon: "☼" },
];

export function AdminSidebar({ email }: { email?: string }) {
  return (
    <aside className="admin-side">
      <div className="admin-brand">
        <strong>Quản trị</strong>
        <small>Thiết bị dược phẩm</small>
      </div>
      <nav aria-label="Admin">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <span aria-hidden="true">{l.icon}</span> {l.label}
          </Link>
        ))}
        <a href="/vi" target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">↗</span> Xem website
        </a>
      </nav>
      <div className="admin-user">
        {email ? <small title={email}>{email}</small> : null}
        <form action={signOutAction}>
          <button type="submit" className="btn small ghost">
            Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
