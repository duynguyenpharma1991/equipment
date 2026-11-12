"use client";

import { useEffect } from "react";

/** Registers /sw.js in production only (avoids stale caches while developing). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      /* registration is best-effort */
    });
  }, []);
  return null;
}
