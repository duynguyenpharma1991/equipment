import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminSession = { user: { id: string; email?: string } | null; isAdmin: boolean };

/**
 * Data-access-layer guard for the admin area. The layout check is only for UX;
 * every admin page and Server Action must call requireAdmin() itself, and RLS
 * (is_admin()) is the final line of defence in the database.
 */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { user: null, isAdmin: false };

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  return { user: { id: data.user.id, email: data.user.email }, isAdmin: !!admin };
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.user) redirect("/admin/login");
  if (!session.isAdmin) redirect("/admin/login?denied=1");
  return session.user;
}
