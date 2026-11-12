import Form from "next/form";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteEntity } from "@/app/(admin)/admin/actions";
import type { EntityConfig, ListColumn } from "@/lib/admin/entities";

type Row = Record<string, unknown>;

function formatDateTime(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
}

function Cell({ col, value, categories }: { col: ListColumn; value: unknown; categories: Map<string, string> }) {
  switch (col.kind) {
    case "image":
      return typeof value === "string" && value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cell-thumb" src={value} alt="" />
      ) : (
        <span className="muted">—</span>
      );
    case "bool":
      return value ? <span className="badge ok">Có</span> : <span className="badge off">Không</span>;
    case "status":
      return value === "published" ? (
        <span className="badge ok">Đã xuất bản</span>
      ) : (
        <span className="badge warn">Nháp</span>
      );
    case "datetime":
      return <>{formatDateTime(value)}</>;
    case "number":
      return <>{String(value ?? 0)}</>;
    case "ref-categories":
      return <>{(typeof value === "string" && categories.get(value)) || <span className="muted">—</span>}</>;
    default:
      return <>{value == null || value === "" ? <span className="muted">—</span> : String(value)}</>;
  }
}

export function EntityList({
  cfg,
  rows,
  categories,
  q,
}: {
  cfg: EntityConfig;
  rows: Row[];
  categories: Map<string, string>;
  q: string;
}) {
  return (
    <>
      <div className="page-head">
        <h1>{cfg.title}</h1>
        <Link href={`/admin/${cfg.key}/new`} className="btn primary">
          + Thêm {cfg.singular}
        </Link>
      </div>

      {cfg.searchColumns ? (
        <Form action={`/admin/${cfg.key}`} className="toolbar" role="search">
          <input name="q" defaultValue={q} placeholder={`Tìm ${cfg.singular}…`} maxLength={80} />
          <button className="btn small" type="submit">
            Tìm
          </button>
          {q ? (
            <Link href={`/admin/${cfg.key}`} className="btn small ghost">
              Xoá lọc
            </Link>
          ) : null}
        </Form>
      ) : null}

      {rows.length === 0 ? (
        <div className="panel empty-state">Chưa có {cfg.singular} nào.</div>
      ) : (
        <div className="panel table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {cfg.listColumns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id}>
                    {cfg.listColumns.map((c, i) => (
                      <td key={c.key}>
                        {i === 0 && c.kind !== "image" ? (
                          <Link href={`/admin/${cfg.key}/${id}`}>
                            <Cell col={c} value={row[c.key]} categories={categories} />
                          </Link>
                        ) : (
                          <Cell col={c} value={row[c.key]} categories={categories} />
                        )}
                      </td>
                    ))}
                    <td className="row-ops">
                      <Link href={`/admin/${cfg.key}/${id}`} className="btn small">
                        Sửa
                      </Link>
                      <form action={deleteEntity.bind(null, cfg.key, id)}>
                        <DeleteButton message={`Xoá ${cfg.singular} này? Thao tác không thể hoàn tác.`} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
