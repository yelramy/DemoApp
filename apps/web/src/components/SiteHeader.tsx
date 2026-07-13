"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MARKETING = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/catalog", label: "Catalog" },
  { href: "/hubs", label: "Hubs" },
  { href: "/trust", label: "Trust" },
  { href: "/pay-for-family", label: "Pay for family" },
  { href: "/blog", label: "Guides" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  userName,
  isStaff,
}: {
  userName?: string | null;
  isStaff?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const inApp = pathname.startsWith("/app");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(247,243,236,0.92)] backdrop-blur-md pt-[var(--safe-top)]">
      <div className="container-bridge flex h-[var(--header-h)] items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 text-[var(--sea-deep)]" aria-label="Bridge home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--sea-deep)] text-sm font-black text-[var(--sun)]">B</span>
          <span className="display text-2xl">Bridge</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-[var(--sea-deep)]/70 lg:flex">
          {MARKETING.slice(0, 5).map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          {isStaff ? <Link href="/admin/console">Admin</Link> : null}
        </nav>

        <div className="flex items-center gap-2">
          {userName ? (
            <Link href="/app" className="btn btn-primary hidden min-h-11 px-4 text-sm sm:inline-flex">
              My account
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden px-2 text-sm font-bold text-[var(--sea-deep)]/70 sm:block">
                Log in
              </Link>
              <Link href="/#quote" className="btn btn-primary hidden min-h-11 px-4 text-sm sm:inline-flex">
                Get a quote
              </Link>
            </>
          )}
          {!inApp ? (
            <button
              type="button"
              className="btn btn-ghost min-h-11 min-w-11 px-3 lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <span aria-hidden="true" className="text-lg leading-none">☰</span>
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="sheet-backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="sheet-panel" role="dialog" aria-modal="true">
            <div className="sheet-handle" />
            <h2 className="display mb-3 text-2xl text-[var(--sea-deep)]">Menu</h2>
            <div className="grid gap-2">
              <Link
                href="/app"
                className="rounded-2xl bg-[var(--sea)] px-4 py-3 text-center text-base font-bold text-white"
                onClick={() => setOpen(false)}
              >
                Start shopping
              </Link>
              {MARKETING.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-2xl bg-white/80 px-4 py-3 text-base font-semibold text-[var(--sea-deep)]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              {isStaff ? (
                <Link
                  href="/admin/console"
                  className="rounded-2xl bg-white/80 px-4 py-3 text-base font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href="/partner"
                className="rounded-2xl bg-white/80 px-4 py-3 text-base font-semibold"
                onClick={() => setOpen(false)}
              >
                Partner
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
