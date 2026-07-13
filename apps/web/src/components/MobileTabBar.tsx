"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MORE_LINKS = [
  { href: "/app/wishlist", label: "Wishlist" },
  { href: "/app/suite", label: "Ship-for-me suite" },
  { href: "/app/payer", label: "Payer dashboard" },
  { href: "/app/family", label: "Family" },
  { href: "/app/support", label: "Support" },
  { href: "/app/addresses", label: "Addresses" },
  { href: "/app/settings", label: "Settings" },
  { href: "/catalog", label: "Catalog" },
  { href: "/hubs", label: "Hubs" },
];

function IconShop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16l-1.2 12.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconOrders() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.5L21 8H7" />
    </svg>
  );
}
function IconAccount() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
function IconMore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.add("has-mobile-tabs");
    return () => document.body.classList.remove("has-mobile-tabs");
  }, []);

  const tabs = [
    { href: "/app", label: "Shop", icon: <IconShop />, match: (p: string) => p === "/app" || p.startsWith("/app/quote") },
    { href: "/app/orders", label: "Orders", icon: <IconOrders />, match: (p: string) => p.startsWith("/app/orders") },
    { href: "/app/cart", label: "Cart", icon: <IconCart />, match: (p: string) => p.startsWith("/app/cart") },
    { href: "/app/settings", label: "Account", icon: <IconAccount />, match: (p: string) => p.startsWith("/app/settings") },
  ];

  return (
    <>
      <nav className="mobile-tabbar" aria-label="Primary">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`mobile-tab ${t.match(pathname) ? "active" : ""}`}
          >
            {t.icon}
            <span>{t.label}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`mobile-tab ${open ? "active" : ""}`}
          onClick={() => setOpen(true)}
          aria-label="More"
        >
          <IconMore />
          <span>More</span>
        </button>
      </nav>

      {open ? (
        <>
          <button
            type="button"
            className="sheet-backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="sheet-panel" role="dialog" aria-modal="true" aria-label="More">
            <div className="sheet-handle" />
            <h2 className="display mb-3 text-2xl text-[var(--sea-deep)]">More</h2>
            <div className="grid gap-2">
              {MORE_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-2xl bg-white/80 px-4 py-3 text-base font-semibold text-[var(--sea-deep)]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
