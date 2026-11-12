import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function PageBanner({ title, crumbs }: { title: string; crumbs: Crumb[] }) {
  return (
    <div className="page-banner">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`}>
              {i > 0 ? <span aria-hidden="true">›</span> : null}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1>{title}</h1>
      </div>
    </div>
  );
}
