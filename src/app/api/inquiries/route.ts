import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Best-effort per-instance throttle (serverless instances don't share memory,
// so this only blunts naive bursts; the honeypot + RLS limits do the rest).
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_HITS;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot filled or form submitted implausibly fast: pretend success, store nothing.
  const elapsed = Number(body.elapsedMs);
  if (text(body.website, 100) || (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 800)) {
    return NextResponse.json({ ok: true });
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (tooMany(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = text(body.name, 200);
  const email = text(body.email, 254);
  const message = text(body.message, 5000);
  if (!name || !EMAIL_RE.test(email) || message.length < 5) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const productId = text(body.productId, 40);
  const locale = body.locale === "en" ? "en" : "vi";

  const { error } = await createPublicClient()
    .from("inquiries")
    .insert({
      name,
      email,
      message,
      company: text(body.company, 200) || null,
      phone: text(body.phone, 50) || null,
      country: text(body.country, 100) || null,
      product_id: UUID_RE.test(productId) ? productId : null,
      product_name: text(body.productName, 300) || null,
      locale,
      status: "new",
    });

  if (error) {
    console.error("[inquiries] insert failed:", error.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
