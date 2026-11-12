// One-time (idempotent) Supabase provisioning through the Management API.
//
//   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."        # dashboard → Account → Access Tokens
//   $env:ADMIN_EMAIL           = "you@example.com"
//   $env:ADMIN_PASSWORD        = "a-strong-password"
//   node scripts/setup-supabase.mjs [--seed]
//
// What it does:
//   1. runs every file in supabase/migrations (idempotent SQL)
//   2. optionally loads supabase/seed/demo_data.sql  (--seed)
//   3. creates the admin auth user and registers it in public.admins
//   4. disables public sign-ups (the admin account is the only one needed)
// Nothing secret is written to disk or printed.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ref = process.env.SUPABASE_PROJECT_REF || "djqnmpkbvvmyrdjfawqh";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const withSeed = process.argv.includes("--seed");

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const api = `https://api.supabase.com/v1/projects/${ref}`;
const projectUrl = `https://${ref}.supabase.co`;

async function mgmt(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${url.replace(api, "")} -> ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
}

const sql = (query) => mgmt("POST", `${api}/database/query`, { query });

async function runFiles(dir, label) {
  const files = (await readdir(path.join(root, dir))).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const query = await readFile(path.join(root, dir, file), "utf8");
    process.stdout.write(`${label}: ${file} ... `);
    await sql(query);
    console.log("ok");
  }
}

async function getServiceKey() {
  const keys = await mgmt("GET", `${api}/api-keys?reveal=true`);
  const legacy = keys.find((k) => k.name === "service_role");
  const secret = keys.find((k) => k.type === "secret");
  const key = (legacy ?? secret)?.api_key;
  if (!key) throw new Error("Could not find a service_role / secret API key for this project.");
  return key;
}

async function ensureAdmin() {
  if (!adminEmail || !adminPassword) {
    console.log("admin: skipped (set ADMIN_EMAIL and ADMIN_PASSWORD to create the admin user)");
    return;
  }
  const serviceKey = await getServiceKey();
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };

  let userId;
  const created = await fetch(`${projectUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email: adminEmail, password: adminPassword, email_confirm: true }),
  });
  if (created.ok) {
    userId = (await created.json()).id;
    console.log("admin: user created");
  } else {
    // Already exists -> find it and (re)set the password.
    const list = await fetch(`${projectUrl}/auth/v1/admin/users?per_page=200`, { headers });
    const users = (await list.json()).users ?? [];
    const existing = users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());
    if (!existing) throw new Error(`Could not create or find admin user: ${created.status} ${await created.text()}`);
    userId = existing.id;
    const upd = await fetch(`${projectUrl}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ password: adminPassword, email_confirm: true }),
    });
    if (!upd.ok) throw new Error(`Could not update admin user: ${upd.status} ${await upd.text()}`);
    console.log("admin: user already existed (password updated)");
  }

  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error("Unexpected user id from Auth API");
  const safeEmail = adminEmail.replace(/'/g, "''");
  await sql(
    `insert into public.admins (user_id, email) values ('${userId}', '${safeEmail}')
     on conflict (user_id) do update set email = excluded.email;`,
  );
  console.log("admin: registered in public.admins");
}

async function disableSignups() {
  await mgmt("PATCH", `${api}/config/auth`, { disable_signup: true });
  console.log("auth: public sign-ups disabled");
}

try {
  await runFiles("supabase/migrations", "migration");
  if (withSeed) await runFiles("supabase/seed", "seed");
  await ensureAdmin();
  await disableSignups();
  console.log("\nDone.");
} catch (err) {
  console.error("\nFailed:", err.message);
  process.exit(1);
}
