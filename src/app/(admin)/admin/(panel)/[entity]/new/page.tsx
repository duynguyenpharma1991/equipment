import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveEntity } from "@/app/(admin)/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { EntityFormFields } from "@/components/admin/EntityFormFields";
import { loadRefs } from "@/lib/admin/db";
import { getEntity } from "@/lib/admin/entities";
import { requireAdmin } from "@/lib/auth";

export async function generateMetadata({ params }: PageProps<"/admin/[entity]/new">): Promise<Metadata> {
  const { entity } = await params;
  const cfg = getEntity(entity);
  return { title: cfg ? `Thêm ${cfg.singular}` : "Quản trị" };
}

export default async function NewEntityPage({ params }: PageProps<"/admin/[entity]/new">) {
  const { entity } = await params;
  const cfg = getEntity(entity);
  if (!cfg) notFound();
  await requireAdmin();
  const refs = await loadRefs(cfg);

  return (
    <>
      <div className="page-head">
        <h1>Thêm {cfg.singular}</h1>
      </div>
      <div className="panel">
        <ActionForm action={saveEntity.bind(null, cfg.key, null)} cancelHref={`/admin/${cfg.key}`} submitLabel="Tạo mới">
          <EntityFormFields fields={cfg.fields} values={cfg.defaults ?? {}} refs={refs} />
        </ActionForm>
      </div>
    </>
  );
}
