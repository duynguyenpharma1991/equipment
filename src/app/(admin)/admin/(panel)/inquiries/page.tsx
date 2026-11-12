import type { Metadata } from "next";
import Link from "next/link";
import { adminDb } from "@/lib/admin/db";
import type { InquiryStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Yêu cầu báo giá" };

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "Mới",
  read: "Đã đọc",
  replied: "Đã phản hồi",
  archived: "Lưu trữ",
};
const STATUSES = Object.keys(STATUS_LABEL) as InquiryStatus[];

export default async function InquiriesPage({ searchParams }: PageProps<"/admin/inquiries">) {
  const { status: rawStatus } = await searchParams;
  const status = STATUSES.find((s) => s === (Array.isArray(rawStatus) ? rawStatus[0] : rawStatus));

  const db = await adminDb();
  let query = db
    .from("inquiries")
    .select("id,name,company,email,phone,product_name,status,created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

  return (
    <>
      <div className="page-head">
        <h1>Yêu cầu báo giá</h1>
      </div>
      <div className="chips">
        <Link href="/admin/inquiries" className={`chip${!status ? " active" : ""}`}>
          Tất cả
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/inquiries?status=${s}`} className={`chip${status === s ? " active" : ""}`}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {!data || data.length === 0 ? (
        <div className="panel empty-state">Không có yêu cầu nào.</div>
      ) : (
        <div className="panel table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người gửi</th>
                <th>Liên hệ</th>
                <th>Sản phẩm</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.map((i) => (
                <tr key={i.id as string}>
                  <td>{fmt.format(new Date(i.created_at as string))}</td>
                  <td>
                    <Link href={`/admin/inquiries/${i.id}`}>
                      <strong>{i.name as string}</strong>
                    </Link>
                    {i.company ? <div className="muted">{i.company as string}</div> : null}
                  </td>
                  <td>
                    {i.email as string}
                    {i.phone ? <div className="muted">{i.phone as string}</div> : null}
                  </td>
                  <td>{(i.product_name as string) || <span className="muted">—</span>}</td>
                  <td>
                    <span className={`badge ${i.status === "new" ? "hot" : i.status === "replied" ? "ok" : "off"}`}>
                      {STATUS_LABEL[i.status as InquiryStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
