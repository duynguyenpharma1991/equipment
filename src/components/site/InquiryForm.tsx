"use client";

import { useId, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/types";

type Status = "idle" | "sending" | "ok" | "error" | "invalid";

export function InquiryForm({
  lang,
  labels,
  productId,
  productName,
}: {
  lang: Locale;
  labels: Dictionary["form"];
  productId?: string;
  productName?: string;
}) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  // Bots tend to submit instantly; humans take a few seconds.
  const openedAt = useRef<number | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = new FormData(e.currentTarget);
    setStatus("sending");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          company: form.get("company"),
          email: form.get("email"),
          phone: form.get("phone"),
          country: form.get("country"),
          message: form.get("message"),
          website: form.get("website"), // honeypot
          elapsedMs: openedAt.current ? Date.now() - openedAt.current : 0,
          locale: lang,
          productId: productId ?? null,
          productName: productName ?? null,
        }),
      });
      if (res.ok) {
        setStatus("ok");
        formRef.current?.reset();
      } else {
        setStatus(res.status === 400 ? "invalid" : "error");
      }
    } catch {
      setStatus("error");
    }
  }

  const id = (n: string) => `${uid}-${n}`;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onFocusCapture={() => {
        if (openedAt.current === null) openedAt.current = Date.now();
      }}
      noValidate={false}
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor={id("name")}>
            {labels.name} <em>*</em>
          </label>
          <input id={id("name")} name="name" required maxLength={200} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor={id("company")}>{labels.company}</label>
          <input id={id("company")} name="company" maxLength={200} autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor={id("email")}>
            {labels.email} <em>*</em>
          </label>
          <input id={id("email")} name="email" type="email" required maxLength={254} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor={id("phone")}>{labels.phone}</label>
          <input id={id("phone")} name="phone" type="tel" maxLength={50} autoComplete="tel" />
        </div>
        <div className="field full">
          <label htmlFor={id("country")}>{labels.country}</label>
          <input id={id("country")} name="country" maxLength={100} autoComplete="country-name" />
        </div>
        <div className="field full">
          <label htmlFor={id("message")}>
            {labels.message} <em>*</em>
          </label>
          <textarea
            id={id("message")}
            name="message"
            required
            minLength={5}
            maxLength={5000}
            placeholder={labels.messagePlaceholder}
            defaultValue={productName ? `${productName}\n` : ""}
          />
        </div>
        {/* Honeypot: hidden from people, tempting to bots */}
        <div className="hp" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-red" type="submit" disabled={status === "sending"}>
          {status === "sending" ? labels.sending : labels.submit}
        </button>
      </div>

      <div aria-live="polite">
        {status === "ok" ? <div className="alert alert-ok">{labels.success}</div> : null}
        {status === "error" ? <div className="alert alert-err">{labels.error}</div> : null}
        {status === "invalid" ? <div className="alert alert-err">{labels.invalid}</div> : null}
      </div>
    </form>
  );
}
