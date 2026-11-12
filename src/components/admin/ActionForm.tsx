"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import type { ActionState } from "@/app/(admin)/admin/actions";

/**
 * Wraps a Server Action. The form is submitted through onSubmit (not the `action` prop)
 * so React doesn't reset the fields when the action returns a validation error.
 */
export function ActionForm({
  action,
  cancelHref,
  submitLabel = "Lưu",
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  cancelHref: string;
  submitLabel?: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form
      className="entity-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {children}
      {state.error ? (
        <div className="notice error" role="alert">
          {state.error}
        </div>
      ) : null}
      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={pending}>
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <Link href={cancelHref} className="btn ghost">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
