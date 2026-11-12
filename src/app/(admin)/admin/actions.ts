"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getEntity, settingsFields } from "@/lib/admin/entities";
import { parseFields } from "@/lib/admin/parse";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InquiryStatus } from "@/lib/types";

export type ActionState = { error: string | null };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function friendlyDbError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Giá trị này đã tồn tại (thường là slug trùng). Vui lòng chọn giá trị khác.";
  if (error.code === "23503") return "Dữ liệu đang được liên kết với bản ghi khác.";
  if (error.code === "42501") return "Bạn không có quyền thực hiện thao tác này.";
  return `Lỗi cơ sở dữ liệu: ${error.message}`;
}

/** Create (id = null) or update an entity described in lib/admin/entities.ts. */
export async function saveEntity(
  entityKey: string,
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const cfg = getEntity(entityKey);
  if (!cfg) return { error: "Loại dữ liệu không hợp lệ." };
  if (id !== null && !UUID_RE.test(id)) return { error: "ID không hợp lệ." };

  const { values, error } = parseFields(cfg.fields, formData, cfg.slugFrom);
  if (error) return { error };

  const supabase = await createSupabaseServerClient();

  const pubField = cfg.publishedAtField;
  if (pubField && values.status === "published" && !values[pubField]) {
    let existing: string | null = null;
    if (id) {
      const { data } = await supabase.from(cfg.table).select(pubField).eq("id", id).maybeSingle();
      existing = ((data as Record<string, string | null> | null)?.[pubField]) ?? null;
    }
    values[pubField] = existing ?? new Date().toISOString();
  }

  const result = id
    ? await supabase.from(cfg.table).update(values).eq("id", id).select("id")
    : await supabase.from(cfg.table).insert(values).select("id");

  if (result.error) return { error: friendlyDbError(result.error) };
  if (!result.data || result.data.length === 0) {
    return { error: "Không lưu được: bản ghi không tồn tại hoặc bạn không có quyền." };
  }

  cfg.tags.forEach((tag) => updateTag(tag));
  redirect(`/admin/${cfg.key}`);
}

export async function deleteEntity(entityKey: string, id: string): Promise<void> {
  await requireAdmin();
  const cfg = getEntity(entityKey);
  if (!cfg || !UUID_RE.test(id)) throw new Error("Yêu cầu không hợp lệ.");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from(cfg.table).delete().eq("id", id).select("id");
  if (error) throw new Error(friendlyDbError(error));
  if (!data || data.length === 0) throw new Error("Không xoá được: bản ghi không tồn tại hoặc bạn không có quyền.");

  cfg.tags.forEach((tag) => updateTag(tag));
  redirect(`/admin/${cfg.key}`);
}

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const { values, error } = parseFields(settingsFields, formData);
  if (error) return { error };

  // Settings are stored as plain strings.
  const value = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v ?? ""]));

  const supabase = await createSupabaseServerClient();
  const { error: dbError } = await supabase
    .from("site_settings")
    .upsert({ key: "general", value }, { onConflict: "key" });
  if (dbError) return { error: friendlyDbError(dbError) };

  updateTag("settings");
  redirect("/admin/settings?saved=1");
}

const INQUIRY_STATUSES: InquiryStatus[] = ["new", "read", "replied", "archived"];

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  await requireAdmin();
  if (!UUID_RE.test(id) || !INQUIRY_STATUSES.includes(status)) throw new Error("Yêu cầu không hợp lệ.");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
  redirect(`/admin/inquiries/${id}`);
}

export async function deleteInquiry(id: string): Promise<void> {
  await requireAdmin();
  if (!UUID_RE.test(id)) throw new Error("Yêu cầu không hợp lệ.");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
  redirect("/admin/inquiries");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
