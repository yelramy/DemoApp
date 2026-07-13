import Link from "next/link";

const steps = [
  {
    n: "01",
    t: "Send us the product",
    d: "Paste a link from Amazon, Noon, iHerb, Trendyol, or another supported store. If we cannot read it automatically, add the item details manually.",
  },
  {
    n: "02",
    t: "Review the delivered price",
    d: "Your quote separates the product, purchasing service, international shipping, payment cost, and estimated customs. You decide before spending anything.",
  },
  {
    n: "03",
    t: "Choose how to pay",
    d: "Pay with Whish, OMT, an eligible cash-on-delivery option, or a secure card link that you can share with someone abroad.",
  },
  {
    n: "04",
    t: "Follow it to your door",
    d: "We buy the item and coordinate the journey through our overseas hub, Lebanon customs, and local delivery. Every important handoff appears in your order timeline.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-bridge py-12 sm:py-20">
      <header className="max-w-3xl">
        <p className="section-kicker">How Bridge works</p>
        <h1 className="display mt-3 text-4xl leading-tight text-[var(--sea-deep)] sm:text-6xl">
          From a product link to your doorstep.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-[var(--ink)]/64">
          Bridge gives you one clear checkout and one trackable order—even when the store does
          not ship directly to Lebanon.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2">
        {steps.map((step) => (
          <article key={step.n} className="feature-card min-h-0 sm:p-7">
            <span className="feature-number">{step.n}</span>
            <h2 className="display mt-6 text-2xl text-[var(--sea-deep)] sm:text-3xl">{step.t}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]/64">{step.d}</p>
          </article>
        ))}
      </div>

      <section className="cta-card mt-10 text-center sm:mt-14">
        <h2 className="display text-3xl text-[var(--sea-deep)]">Have a product in mind?</h2>
        <p className="mt-3 text-sm text-[var(--ink)]/62">A quote is free and takes less than a minute.</p>
        <Link href="/#quote" className="btn btn-primary mt-6">Get a delivered-price quote</Link>
      </section>
    </div>
  );
}
