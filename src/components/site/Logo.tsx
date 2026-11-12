import Link from "next/link";

export function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-35 12 12)" />
        <path d="M9.2 7.6l5.6 8.8" />
      </svg>
    </span>
  );
}

export function Logo({ href, name, tagline }: { href: string; name: string; tagline?: string }) {
  return (
    <Link href={href} className="logo" aria-label={name}>
      <LogoMark />
      <span>
        {name}
        {tagline ? <small>{tagline}</small> : null}
      </span>
    </Link>
  );
}
