"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const denied = useSearchParams().get("denied") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setBusy(false);
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }
    // The browser client has just written the session cookies; refresh so the server sees them.
    router.replace("/admin");
    router.refresh();
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="login-card">
      <h1>Đăng nhập quản trị</h1>
      {denied ? (
        <div className="notice error" role="alert">
          Tài khoản này không có quyền quản trị.{" "}
          <button type="button" className="linklike" onClick={signOut}>
            Đăng xuất
          </button>
        </div>
      ) : null}
      <form onSubmit={onSubmit}>
        <div className="field full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field full">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? (
          <div className="notice error" role="alert">
            {error}
          </div>
        ) : null}
        <button className="btn primary block" type="submit" disabled={busy}>
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <Suspense fallback={<div className="login-card">Đang tải…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
