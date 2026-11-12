import type { Metadata } from "next";
import Link from "next/link";
import { adminDb } from "@/lib/admin/db";

export const metadata: Metadata = { title: "Tổng quan" };

async function count(db: Awaited<ReturnType<typeof adminDb>>, table: string, filter?: [string, string | boolean]) {
  let q = db.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count: n } = await q;
  return n ?? 0;
}

export default async function DashboardPage() {
  const db = await adminDb();
  const [products, published, categories, news, newInquiries, recent] = await Promise.all([
    count(db, "products"),
    count(db, "products", ["status", "published"]),
    count(db, "categories"),
    count(db, "news_posts"),
    count(db, "inquiries", ["status", "new"]),
    db
      .from("inquiries")
      .select("id,name,company,product_name,status,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    { label: "Sản phẩm", value: products, sub: `${published} đã xuất bản`, href: "/admin/products" },
    { label: "Danh mục", value: categories, href: "/admin/categories" },
    { label: "Bài viết", value: news, href: "/admin/news" },
    { label: "Yêu cầu mới", value: newInquiries, href: "/admin/inquiries", highlight: newInquiries > 0 },
  ];

  return (
    <>
      <div className="page-head">
        <h1>Tổng quan</h1>
      </div>
      <div className="stat-grid">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`stat${s.highlight ? " hot" : ""}`}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
            {s.sub ? <small>{s.sub}</small> : null}
          </Link>
        ))}
      </div>

      <div className="panel">
        <div className="page-head">
          <h2>Yêu cầu báo giá gần đây</h2>
          <Link href="/admin/inquiries" className="btn small">
            Xem tất cả
          </Link>
        </div>
        {recent.data && recent.data.length > 0 ? (
          <ul className="plain-list">
            {recent.data.map((i) => (
              <li key={i.id as string}>
                <Link href={`/admin/inquiries/${i.id}`}>
                  <strong>{i.name as string}</strong>
                  {i.company ? ` · ${i.company}` : ""}
                  {i.product_name ? <span className="muted"> — {i.product_name as string}</span> : null}
                </Link>
                {i.status === "new" ? <span className="badge hot">Mới</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Chưa có yêu cầu nào.</p>
        )}
      </div>
    </>
  );
}
