import "server-only";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EntityConfig } from "@/lib/admin/entities";
import type { RefOptions } from "@/components/admin/EntityFormFields";

/** Session-scoped Supabase client, obtainable only by a verified admin. */
export async function adminDb() {
  await requireAdmin();
  return createSupabaseServerClient();
}

/** Options for select fields that point at other tables. */
export async function loadRefs(cfg: EntityConfig): Promise<RefOptions> {
  const wants = new Set(cfg.fields.map((f) => f.optionsFrom).filter(Boolean));
  if (wants.size === 0) return {};
  const db = await adminDb();
  const refs: RefOptions = {};

  if (wants.has("categories")) {
    const { data } = await db.from("categories").select("id,name_vi,name_en").order("sort_order");
    refs.categories = (data ?? []).map((c) => ({ value: c.id as string, label: `${c.name_vi} / ${c.name_en}` }));
  }
  if (wants.has("products")) {
    const { data } = await db
      .from("products")
      .select("id,model_code,name_vi")
      .order("sort_order")
      .limit(500);
    refs.products = (data ?? []).map((p) => ({
      value: p.id as string,
      label: [p.model_code, p.name_vi].filter(Boolean).join(" – "),
    }));
  }
  return refs;
}
