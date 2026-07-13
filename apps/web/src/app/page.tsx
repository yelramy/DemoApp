import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="hero-sheen absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(11,79,108,0.35),transparent_55%),linear-gradient(120deg,#0b4f6c_0%,#073247_55%,#1a3a2f_100%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 40 40%22><path fill=%22%23ffffff%22 fill-opacity=%220.05%22 d=%22M0 39h40v1H0zM39 0v40h1V0z%22/></svg>')]" />
        <div className="container-bridge relative grid items-start gap-6 py-8 sm:py-12 lg:min-h-[88vh] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:py-16">
          <div className="fade-up text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:mb-4 sm:text-sm">
              Lebanon · Phone-first · USD
            </p>
            <h1 className="display mb-3 max-w-xl text-4xl leading-[1.05] sm:mb-5 sm:text-5xl md:text-7xl">
              Bridge
            </h1>
            <p className="mb-2 max-w-lg text-xl font-medium text-white/95 sm:mb-3 sm:text-2xl md:text-3xl">
              Shop the world. Pay with Whish.
            </p>
            <p className="mb-5 max-w-md text-sm leading-relaxed text-white/75 sm:mb-8 sm:text-base">
              Paste a product link on your phone. See the final USD price. Pay locally. We
              deliver to your door.
            </p>
            <div className="mb-2 hidden flex-wrap gap-3 sm:flex">
              <Link href="/app" className="btn bg-white text-[var(--sea-deep)]">
                Start shopping
              </Link>
              <Link
                href="/how-it-works"
                className="btn border border-white/30 bg-white/10 text-white"
              >
                How it works
              </Link>
            </div>
          </div>
          <div className="fade-up panel p-4 sm:p-5 md:p-7" style={{ animationDelay: "120ms" }}>
            <h2 className="display mb-1 text-xl text-[var(--sea-deep)] sm:mb-2 sm:text-2xl">
              Get an all-in quote
            </h2>
            <p className="mb-4 text-sm text-[var(--ink)]/70 sm:mb-5">
              Item + fees + shipping + customs — before you pay.
            </p>
            <QuoteForm />
          </div>
        </div>
      </section>

      <section className="container-bridge grid gap-4 py-12 sm:gap-8 sm:py-20 md:grid-cols-3">
        {[
          {
            t: "Whish-native",
            d: "Pay the Lebanese way. COD and OMT available when you need them.",
          },
          {
            t: "Transparent landed cost",
            d: "No WhatsApp mystery math. One USD total you can trust.",
          },
          {
            t: "Door tracking",
            d: "From foreign store to UAE hub to Lebanese customs to your building.",
          },
        ].map((item) => (
          <div key={item.t} className="panel p-5 sm:p-6">
            <h3 className="display mb-2 text-lg text-[var(--sea-deep)] sm:text-xl">{item.t}</h3>
            <p className="text-sm leading-relaxed text-[var(--ink)]/70">{item.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
