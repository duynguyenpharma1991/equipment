import type { Metadata } from "next";
import { saveSettings } from "@/app/(admin)/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { EntityFormFields } from "@/components/admin/EntityFormFields";
import { adminDb } from "@/lib/admin/db";
import { settingsFields } from "@/lib/admin/entities";
import { defaultSettings } from "@/lib/data/defaults";

export const metadata: Metadata = { title: "Cài đặt chung" };

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const { saved } = await searchParams;
  const db = await adminDb();
  const { data, error } = await db.from("site_settings").select("value").eq("key", "general").maybeSingle();
  if (error) throw new Error(error.message);

  const values = { ...defaultSettings, ...((data?.value as Record<string, unknown> | undefined) ?? {}) };

  return (
    <>
      <div className="page-head">
        <h1>Cài đặt chung</h1>
      </div>
      {saved ? <div className="notice ok">Đã lưu cài đặt.</div> : null}
      <div className="panel">
        <ActionForm action={saveSettings} cancelHref="/admin">
          <EntityFormFields fields={settingsFields} values={values} />
        </ActionForm>
      </div>
    </>
  );
}
