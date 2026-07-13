import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="container-bridge flex items-center justify-between gap-4 py-5">
      <Link href="/" className="display text-2xl text-[var(--sea-deep)]">
        Bridge
      </Link>
      <nav className="hidden items-center gap-5 text-sm font-semibold text-[var(--sea-deep)] md:flex">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/pay-for-family">Pay for family</Link>
        <Link href="/app">Shop</Link>
        {user?.role === "ADMIN" || user?.role === "OPS" ? (
          <Link href="/admin">Admin</Link>
        ) : null}
        <Link href="/partner">Partner</Link>
      </nav>
      <div className="flex items-center gap-2">
        {user ? (
          <Link href="/app" className="btn btn-primary text-sm">
            {user.name?.split(" ")[0] ?? "Account"}
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary text-sm">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
