import { notFound } from "next/navigation";

// Any unmatched path under /vi or /en renders the localized not-found page.
export default function CatchAll() {
  notFound();
}
