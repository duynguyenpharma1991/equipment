import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteEntity, saveEntity } from "@/app/(admin)/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EntityFormFields } from "@/components/admin/EntityFormFields";
import { adminDb, loadRefs } from "@/lib/admin/db";
import { getEntity } from "@/lib/admin/entities";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps<"/admin/[entity]/[id]">): Promise<Metadata> {
  const { entity } = await params;
  const cfg = getEntity(entity);
  return { title: cfg ? `Sửa ${cfg.singular}` : "Quản trị" };
}

export default async function EditEntityPage({ params }: PageProps<"/admin/[entity]/[id]">) {
  const { entity, id } = await params;
  const cfg = getEntity(entity);
  if (!cfg || !UUID_RE.test(id)) notFound();

  const db = await adminDb();
  const { data: row, error } = await db.from(cfg.table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) notFound();

  const refs = await loadRefs(cfg);

  return (
    <>
      <div className="page-head">
        <h1>Sửa {cfg.singular}</h1>
        <form action={deleteEntity.bind(null, cfg.key, id)}>
          <DeleteButton label={`Xoá ${cfg.singular}`} message={`Xoá ${cfg.singular} này? Thao tác không thể hoàn tác.`} />
        </form>
      </div>
      <div className="panel">
        <ActionForm action={saveEntity.bind(null, cfg.key, id)} cancelHref={`/admin/${cfg.key}`}>
          <EntityFormFields fields={cfg.fields} values={row as Record<string, unknown>} refs={refs} />
        </ActionForm>
      </div>
    </>
  );
}
