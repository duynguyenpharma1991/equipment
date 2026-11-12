import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteInquiry, updateInquiryStatus } from "@/app/(admin)/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { adminDb } from "@/lib/admin/db";
import type { Inquiry, InquiryStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Chi tiết yêu cầu" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "Mới",
  read: "Đã đọc",
  replied: "Đã phản hồi",
  archived: "Lưu trữ",
};

export default async function InquiryDetailPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const db = await adminDb();
  const { data, error } = await db.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) notFound();
  const inquiry = data as unknown as Inquiry;

  const when = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(inquiry.created_at),
  );

  const rows: [string, React.ReactNode][] = [
    ["Thời gian", when],
    ["Họ tên", inquiry.name],
    ["Công ty", inquiry.company || "—"],
    ["Email", <a key="e" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>],
    ["Điện thoại", inquiry.phone || "—"],
    ["Quốc gia", inquiry.country || "—"],
    ["Sản phẩm", inquiry.product_name || "—"],
    ["Ngôn ngữ", inquiry.locale === "vi" ? "Tiếng Việt" : "English"],
  ];

  return (
    <>
      <div className="page-head">
        <h1>Yêu cầu từ {inquiry.name}</h1>
        <Link href="/admin/inquiries" className="btn small ghost">
          ← Danh sách
        </Link>
      </div>

      <div className="panel">
        <dl className="detail-list">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <h3>Nội dung</h3>
        <p className="message-box">{inquiry.message}</p>

        <h3>Trạng thái</h3>
        <div className="status-row">
          {(Object.keys(STATUS_LABEL) as InquiryStatus[]).map((s) => (
            <form key={s} action={updateInquiryStatus.bind(null, id, s)}>
              <button type="submit" className={`btn small${inquiry.status === s ? " primary" : ""}`} disabled={inquiry.status === s}>
                {STATUS_LABEL[s]}
              </button>
            </form>
          ))}
          <a className="btn small" href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.product_name ?? "Yêu cầu báo giá"}`)}`}>
            ✉ Trả lời qua email
          </a>
          <form action={deleteInquiry.bind(null, id)} style={{ marginLeft: "auto" }}>
            <DeleteButton message="Xoá yêu cầu này? Thao tác không thể hoàn tác." />
          </form>
        </div>
      </div>
    </>
  );
}
