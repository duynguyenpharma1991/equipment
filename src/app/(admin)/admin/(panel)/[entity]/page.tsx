import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityList } from "@/components/admin/EntityList";
import { adminDb } from "@/lib/admin/db";
import { entities, getEntity } from "@/lib/admin/entities";
import { escapeLike } from "@/lib/utils";

export function generateStaticParams() {
  return Object.keys(entities).map((entity) => ({ entity }));
}

export async function generateMetadata({ params }: PageProps<"/admin/[entity]">): Promise<Metadata> {
  const { entity } = await params;
  return { title: getEntity(entity)?.title ?? "Quản trị" };
}

export default async function EntityListPage({ params, searchParams }: PageProps<"/admin/[entity]">) {
  const { entity } = await params;
  const cfg = getEntity(entity);
  if (!cfg) notFound();

  const { q: rawQ } = await searchParams;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.slice(0, 80) ?? "";

  const db = await adminDb();
  const columns = Array.from(new Set(["id", ...cfg.listColumns.map((c) => c.key)])).join(",");
  let query = db.from(cfg.table).select(columns);

  const term = escapeLike(q);
  if (term && cfg.searchColumns) {
    query = query.or(cfg.searchColumns.map((c) => `${c}.ilike.%${term}%`).join(","));
  }
  for (const o of cfg.orderBy) query = query.order(o.column, { ascending: o.ascending });

  const { data, error } = await query.limit(500);
  if (error) throw new Error(error.message);

  const categories = new Map<string, string>();
  if (cfg.listColumns.some((c) => c.kind === "ref-categories")) {
    const { data: cats } = await db.from("categories").select("id,name_vi");
    (cats ?? []).forEach((c) => categories.set(c.id as string, c.name_vi as string));
  }

  return <EntityList cfg={cfg} rows={(data ?? []) as unknown as Record<string, unknown>[]} categories={categories} q={q} />;
}
