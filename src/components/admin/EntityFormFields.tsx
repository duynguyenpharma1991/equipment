import { ImageField } from "@/components/admin/ImageField";
import { ImagesField } from "@/components/admin/ImagesField";
import { SpecsEditor } from "@/components/admin/SpecsEditor";
import { toLocalInput } from "@/lib/admin/parse";
import type { FieldDef } from "@/lib/admin/entities";
import type { SpecGroup } from "@/lib/types";

export type RefOptions = Partial<Record<"categories" | "products", { value: string; label: string }[]>>;

function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function Control({ f, value, refs, id }: { f: FieldDef; value: unknown; refs: RefOptions; id: string }) {
  switch (f.type) {
    case "textarea":
      return <textarea id={id} name={f.name} defaultValue={asString(value)} rows={3} maxLength={f.max} />;
    case "markdown":
      return <textarea id={id} name={f.name} defaultValue={asString(value)} rows={14} className="mono" />;
    case "lines":
      return (
        <textarea
          id={id}
          name={f.name}
          defaultValue={Array.isArray(value) ? (value as string[]).join("\n") : ""}
          rows={6}
        />
      );
    case "number":
      return <input id={id} type="number" name={f.name} defaultValue={asString(value ?? 0)} step={1} />;
    case "checkbox":
      return (
        <label className="check">
          <input id={id} type="checkbox" name={f.name} defaultChecked={value === true} /> {f.label}
        </label>
      );
    case "datetime":
      return <input id={id} type="datetime-local" name={f.name} defaultValue={toLocalInput(asString(value))} />;
    case "slug":
      return (
        <input
          id={id}
          name={f.name}
          defaultValue={asString(value)}
          maxLength={120}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Chữ thường a-z, số và dấu gạch ngang"
          placeholder="tự động tạo nếu để trống"
        />
      );
    case "select": {
      const options = f.options ?? (f.optionsFrom ? refs[f.optionsFrom] ?? [] : []);
      return (
        <select id={id} name={f.name} defaultValue={asString(value)}>
          {f.required || f.options ? null : <option value="">— Không chọn —</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    case "image":
      return <ImageField name={f.name} defaultValue={asString(value) || null} folder={f.name.includes("thumb") ? "videos" : "images"} />;
    case "file":
      return <ImageField name={f.name} defaultValue={asString(value) || null} kind="file" />;
    case "images":
      return <ImagesField name={f.name} defaultValue={Array.isArray(value) ? (value as string[]) : []} />;
    case "specs":
      return <SpecsEditor name={f.name} defaultValue={Array.isArray(value) ? (value as SpecGroup[]) : []} />;
    default:
      return (
        <input
          id={id}
          type={f.type === "url" ? "url" : "text"}
          name={f.name}
          defaultValue={asString(value)}
          maxLength={f.max}
          required={f.required}
        />
      );
  }
}

export function EntityFormFields({
  fields,
  values,
  refs = {},
}: {
  fields: FieldDef[];
  values: Record<string, unknown>;
  refs?: RefOptions;
}) {
  return (
    <div className="form-grid">
      {fields.map((f) => (
        <FieldBlock key={f.name} f={f} value={values[f.name]} refs={refs} />
      ))}
    </div>
  );
}

function FieldBlock({ f, value, refs }: { f: FieldDef; value: unknown; refs: RefOptions }) {
  const id = `f-${f.name}`;
  return (
    <>
      {f.section ? <h3 className="form-section">{f.section}</h3> : null}
      <div className={`field${f.half ? "" : " full"}`}>
        {f.type !== "checkbox" ? (
          <label htmlFor={id}>
            {f.label}
            {f.required ? <em> *</em> : null}
          </label>
        ) : null}
        <div>
          <Control f={f} value={value} refs={refs} id={id} />
        </div>
        {f.help ? <p className="help">{f.help}</p> : null}
      </div>
    </>
  );
}

