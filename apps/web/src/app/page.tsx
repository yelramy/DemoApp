import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";

const benefits = [
  {
    icon: "01",
    title: "One price before you pay",
    body: "Product, international shipping, customs estimate, and Bridge fees—clearly itemized in USD.",
  },
  {
    icon: "02",
    title: "Pay locally",
    body: "Use Whish, OMT, eligible cash on delivery, or send a secure payment link to family abroad.",
  },
  {
    icon: "03",
    title: "Track every handoff",
    body: "Follow your order from the store to our hub, through customs, and all the way to your door.",
  },
];

const steps = [
  ["Paste", "Copy the product link from the store."],
  ["Review", "See your complete delivered-price estimate."],
  ["Pay", "Choose the local payment method that suits you."],
  ["Track", "Get updates until your package arrives."],
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="hero-grid relative">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="container-bridge relative grid gap-9 pb-14 pt-10 sm:pb-20 sm:pt-16 lg:min-h-[760px] lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:py-20">
          <div className="fade-up text-white">
            <div className="eyebrow mb-5">
              <span className="status-dot" />
              Built for shopping from Lebanon
            </div>
            <h1 className="display max-w-2xl text-[clamp(3rem,8vw,6.4rem)] leading-[0.92] tracking-[-0.055em]">
              The world&apos;s stores,
              <span className="block text-[var(--sun)]">delivered here.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
              Paste any product link. Bridge shows you the complete price in USD, handles the
              purchase and shipping, and delivers across Lebanon.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="#quote" className="btn btn-light">
                Get a free quote
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/how-it-works" className="btn btn-dark-ghost">
                See how it works
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/68">
              <span className="check-item">No signup to quote</span>
              <span className="check-item">No hidden fees</span>
              <span className="check-item">Local support</span>
            </div>
          </div>

          <div id="quote" className="fade-up scroll-mt-24" style={{ animationDelay: "100ms" }}>
            <div className="quote-card">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
                    Instant estimate
                  </p>
                  <h2 className="display text-2xl text-[var(--sea-deep)] sm:text-3xl">
                    What do you want to buy?
                  </h2>
                </div>
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--foam)] text-xl sm:flex">
                  ↗
                </div>
              </div>
              <QuoteForm />
              <p className="mt-4 text-center text-xs leading-5 text-[var(--ink)]/48">
                Your quote is free. You only pay when you&apos;re ready to order.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white/55">
        <div className="container-bridge grid grid-cols-2 gap-px py-5 text-center sm:grid-cols-4 sm:py-7">
          {["Amazon", "Noon", "iHerb", "Trendyol"].map((store) => (
            <div key={store} className="py-2 text-sm font-extrabold tracking-tight text-[var(--sea-deep)]/55 sm:text-base">
              {store}
            </div>
          ))}
        </div>
      </section>

      <section className="container-bridge py-16 sm:py-24">
        <div className="mb-9 max-w-2xl sm:mb-12">
          <p className="section-kicker">Shopping without the uncertainty</p>
          <h2 className="display mt-3 text-3xl leading-tight text-[var(--sea-deep)] sm:text-5xl">
            Everything that happens after “add to cart,” handled.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((item) => (
            <article key={item.title} className="feature-card">
              <span className="feature-number">{item.icon}</span>
              <h3 className="display mt-8 text-2xl text-[var(--sea-deep)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/62">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-bridge pb-16 sm:pb-24">
        <div className="process-card">
          <div className="max-w-xl">
            <p className="section-kicker text-[var(--sun)]">Simple from link to doorstep</p>
            <h2 className="display mt-3 text-3xl text-white sm:text-5xl">Four steps. One order.</h2>
            <p className="mt-4 leading-7 text-white/62">
              No freight jargon, complicated forwarding addresses, or surprise calculations.
            </p>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, body], index) => (
              <div key={title} className="process-step">
                <span>{index + 1}</span>
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-bridge pb-16 sm:pb-24">
        <div className="cta-card text-center">
          <p className="section-kicker">Ready when you are</p>
          <h2 className="display mx-auto mt-3 max-w-2xl text-3xl text-[var(--sea-deep)] sm:text-5xl">
            Start with a link. We&apos;ll take it from there.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--ink)]/62 sm:text-base">
            Get a clear delivered-price estimate in under a minute.
          </p>
          <Link href="#quote" className="btn btn-primary mt-7 px-7">
            Get my quote
          </Link>
        </div>
      </section>
    </div>
  );
}
