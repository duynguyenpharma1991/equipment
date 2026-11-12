"use client";

import { useState } from "react";
import type { SpecGroup } from "@/lib/types";

const emptyRow = () => ({ label_vi: "", label_en: "", value: "" });
const emptyGroup = (): SpecGroup => ({
  title_vi: "Thông số kỹ thuật",
  title_en: "Technical parameters",
  rows: [emptyRow()],
});

export function SpecsEditor({ name, defaultValue }: { name: string; defaultValue?: SpecGroup[] }) {
  const [groups, setGroups] = useState<SpecGroup[]>(defaultValue ?? []);

  const patchGroup = (gi: number, patch: Partial<SpecGroup>) =>
    setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...patch } : g)));

  const patchRow = (gi: number, ri: number, patch: Partial<SpecGroup["rows"][number]>) =>
    setGroups((gs) =>
      gs.map((g, i) =>
        i === gi ? { ...g, rows: g.rows.map((r, j) => (j === ri ? { ...r, ...patch } : r)) } : g,
      ),
    );

  const moveRow = (gi: number, ri: number, delta: number) =>
    setGroups((gs) =>
      gs.map((g, i) => {
        if (i !== gi) return g;
        const rows = [...g.rows];
        const t = ri + delta;
        if (t < 0 || t >= rows.length) return g;
        [rows[ri], rows[t]] = [rows[t], rows[ri]];
        return { ...g, rows };
      }),
    );

  return (
    <div className="specs">
      <input type="hidden" name={name} value={JSON.stringify(groups)} />

      {groups.map((g, gi) => (
        <fieldset className="spec-group" key={gi}>
          <legend>Nhóm {gi + 1}</legend>
          <div className="spec-titles">
            <input
              value={g.title_vi}
              onChange={(e) => patchGroup(gi, { title_vi: e.target.value })}
              placeholder="Tiêu đề nhóm (VI)"
              maxLength={200}
            />
            <input
              value={g.title_en}
              onChange={(e) => patchGroup(gi, { title_en: e.target.value })}
              placeholder="Group title (EN)"
              maxLength={200}
            />
            <button
              type="button"
              className="btn small danger"
              onClick={() => setGroups((gs) => gs.filter((_, i) => i !== gi))}
            >
              Xoá nhóm
            </button>
          </div>

          <div className="spec-rows">
            <div className="spec-row head">
              <span>Hạng mục (VI)</span>
              <span>Item (EN)</span>
              <span>Giá trị / Value</span>
              <span />
            </div>
            {g.rows.map((r, ri) => (
              <div className="spec-row" key={ri}>
                <input value={r.label_vi} onChange={(e) => patchRow(gi, ri, { label_vi: e.target.value })} maxLength={200} />
                <input value={r.label_en} onChange={(e) => patchRow(gi, ri, { label_en: e.target.value })} maxLength={200} />
                <input value={r.value} onChange={(e) => patchRow(gi, ri, { value: e.target.value })} maxLength={400} />
                <span className="row-actions">
                  <button type="button" onClick={() => moveRow(gi, ri, -1)} disabled={ri === 0} aria-label="Lên">
                    ▲
                  </button>
                  <button type="button" onClick={() => moveRow(gi, ri, 1)} disabled={ri === g.rows.length - 1} aria-label="Xuống">
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => patchGroup(gi, { rows: g.rows.filter((_, j) => j !== ri) })}
                    aria-label="Xoá dòng"
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
          <button type="button" className="btn small" onClick={() => patchGroup(gi, { rows: [...g.rows, emptyRow()] })}>
            + Thêm dòng
          </button>
        </fieldset>
      ))}

      <button type="button" className="btn small" onClick={() => setGroups((gs) => [...gs, emptyGroup()])}>
        + Thêm nhóm thông số
      </button>
    </div>
  );
}
