"use client";

import Form from "next/form";
import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/types";

export type NavCategory = { slug: string; name: string };

export function NavMenu({
  lang,
  labels,
  searchLabel,
  searchPlaceholder,
  categories,
}: {
  lang: Locale;
  labels: Dictionary["nav"];
  searchLabel: string;
  searchPlaceholder: string;
  categories: NavCategory[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const base = `/${lang}`;

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕ " : "☰ "}
        {open ? labels.close : labels.menu}
      </button>
      <nav id="site-nav" className={`nav${open ? " open" : ""}`} aria-label="Main">
        <ul>
          <li>
            <Link href={base} onClick={close}>
              {labels.home}
            </Link>
          </li>
          <li>
            <Link href={`${base}/about`} onClick={close}>
              {labels.about}
            </Link>
          </li>
          <li className="has-dropdown">
            <Link href={`${base}/products`} onClick={close}>
              {labels.products}
            </Link>
            {categories.length > 0 ? (
              <ul className="dropdown">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`${base}/category/${c.slug}`} onClick={close}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
          <li>
            <Link href={`${base}/videos`} onClick={close}>
              {labels.videos}
            </Link>
          </li>
          <li>
            <Link href={`${base}/news`} onClick={close}>
              {labels.news}
            </Link>
          </li>
          <li>
            <Link href={`${base}/contact`} onClick={close}>
              {labels.contact}
            </Link>
          </li>
        </ul>
        <Form action={`${base}/search`} className="search-box" role="search">
          <input name="q" type="search" placeholder={searchPlaceholder} aria-label={searchLabel} maxLength={80} />
          <button type="submit" aria-label={searchLabel}>
            ⌕
          </button>
        </Form>
      </nav>
    </>
  );
}
