import { slugify } from "@/lib/utils";
import type { FieldDef } from "@/lib/admin/entities";
import type { SpecGroup } from "@/lib/types";

export type ParseResult = { values: Record<string, unknown>; error: string | null };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function str(form: FormData, name: string): string {
  const v = form.get(name);
  return typeof v === "string" ? v : "";
}

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value);
}

/** ISO timestamp -> value for <input type="datetime-local"> in Vietnam time. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? "" : new Date(t + VN_OFFSET_MS).toISOString().slice(0, 16);
}

function parseJsonField(form: FormData, name: string): unknown {
  const raw = str(form, name);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function sanitizeSpecs(input: unknown): SpecGroup[] | null {
  if (!Array.isArray(input)) return null;
  const groups: SpecGroup[] = [];
  for (const g of input.slice(0, 20)) {
    if (!g || typeof g !== "object") continue;
    const group = g as Record<string, unknown>;
    const rows = Array.isArray(group.rows) ? group.rows.slice(0, 60) : [];
    const cleanRows = rows
      .map((r) => {
        const row = (r ?? {}) as Record<string, unknown>;
        return {
          label_vi: clip(row.label_vi, 200),
          label_en: clip(row.label_en, 200),
          value: clip(row.value, 400),
        };
      })
      .filter((r) => r.label_vi || r.label_en || r.value);
    if (cleanRows.length === 0) continue;
    groups.push({ title_vi: clip(group.title_vi, 200), title_en: clip(group.title_en, 200), rows: cleanRows });
  }
  return groups;
}

export function parseFields(fields: FieldDef[], form: FormData, slugFrom?: string[]): ParseResult {
  const values: Record<string, unknown> = {};

  for (const f of fields) {
    const label = f.label;
    switch (f.type) {
      case "checkbox":
        values[f.name] = str(form, f.name) === "on";
        break;

      case "number": {
        const n = Number.parseInt(str(form, f.name), 10);
        values[f.name] = Number.isFinite(n) ? Math.max(-100000, Math.min(100000, n)) : 0;
        break;
      }

      case "datetime": {
        const raw = str(form, f.name).trim();
        if (!raw) {
          values[f.name] = null;
          break;
        }
        const date = new Date(`${raw.length === 16 ? `${raw}:00` : raw}+07:00`);
        if (Number.isNaN(date.getTime())) return { values, error: `“${label}” không phải ngày giờ hợp lệ.` };
        values[f.name] = date.toISOString();
        break;
      }

      case "lines": {
        const items = str(form, f.name)
          .split(/\r?\n/)
          .map((l) => l.trim().slice(0, 500))
          .filter(Boolean)
          .slice(0, 50);
        values[f.name] = items;
        break;
      }

      case "images": {
        const parsed = parseJsonField(form, f.name);
        if (parsed === undefined) return { values, error: `Dữ liệu “${label}” không hợp lệ.` };
        const urls = Array.isArray(parsed)
          ? parsed.filter((u): u is string => typeof u === "string" && (isHttpUrl(u) || u.startsWith("/"))).slice(0, 30)
          : [];
        values[f.name] = urls;
        break;
      }

      case "specs": {
        const parsed = parseJsonField(form, f.name);
        if (parsed === undefined) return { values, error: `Dữ liệu “${label}” không hợp lệ.` };
        values[f.name] = sanitizeSpecs(parsed) ?? [];
        break;
      }

      default: {
        // text | url | textarea | markdown | select | image | file | slug
        const raw = str(form, f.name);
        const s = f.type === "markdown" || f.type === "textarea" ? raw.replace(/\r\n/g, "\n").trim() : raw.trim();

        if (!s) {
          if (f.required) return { values, error: `Vui lòng nhập “${label}”.` };
          values[f.name] = f.blank ?? null;
          break;
        }
        if (f.max && s.length > f.max) return { values, error: `“${label}” tối đa ${f.max} ký tự.` };

        if (f.type === "url" && !isHttpUrl(s)) {
          return { values, error: `“${label}” phải là URL bắt đầu bằng http:// hoặc https://.` };
        }
        if ((f.type === "image" || f.type === "file") && !(isHttpUrl(s) || s.startsWith("/"))) {
          return { values, error: `“${label}” không hợp lệ.` };
        }
        if (f.type === "select") {
          if (f.options) {
            if (!f.options.some((o) => o.value === s)) return { values, error: `“${label}” không hợp lệ.` };
          } else if (!UUID_RE.test(s)) {
            return { values, error: `“${label}” không hợp lệ.` };
          }
        }
        if (f.type === "slug" && !SLUG_RE.test(s)) {
          return { values, error: "Slug chỉ gồm chữ thường a-z, số và dấu gạch ngang (ví dụ: may-dong-vi-bp-260)." };
        }
        values[f.name] = s;
      }
    }
  }

  // Auto-generate a blank slug from the first non-empty source field.
  const slugField = fields.find((f) => f.type === "slug");
  if (slugField && !values[slugField.name]) {
    for (const source of slugFrom ?? []) {
      const candidate = slugify(String(values[source] ?? ""));
      if (candidate) {
        values[slugField.name] = candidate;
        break;
      }
    }
    if (!values[slugField.name]) return { values, error: "Không thể tạo slug. Vui lòng nhập slug thủ công." };
  }

  return { values, error: null };
}
