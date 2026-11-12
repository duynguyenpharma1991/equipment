"use client";

/** Submit button for a delete Server Action form, guarded by a confirm dialog. */
export function DeleteButton({ label = "Xoá", message }: { label?: string; message: string }) {
  return (
    <button
      type="submit"
      className="btn small danger"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
