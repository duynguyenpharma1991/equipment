import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  // The session is request-time data, so it streams in behind a Suspense boundary.
  return (
    <Suspense fallback={<div className="admin-loading">Đang tải…</div>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  // UX gate only. Every page/action re-checks (adminDb / requireAdmin) and RLS enforces it in Postgres.
  const user = await requireAdmin();
  return (
    <div className="admin-shell">
      <AdminSidebar email={user.email} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
