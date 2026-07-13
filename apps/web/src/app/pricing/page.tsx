import Link from "next/link";
import { money } from "@/lib/format";

const priceParts = [
  ["The product", "The store price plus any local shipping charged before it reaches our hub."],
  ["Bridge service", "Usually 7% of the product value, with a $6 minimum for buy-for-me orders."],
  ["International shipping", "Based on chargeable weight and route. UAE air starts near $12/kg with a $15 minimum."],
  ["Customs and clearance", "An estimate based on product category and declared value, shown before payment."],
];

export default function PricingPage() {
  return (
    <div className="container-bridge py-12 sm:py-20">
      <header className="max-w-3xl">
        <p className="section-kicker">Clear by design</p>
        <h1 className="display mt-3 text-4xl leading-tight text-[var(--sea-deep)] sm:text-6xl">
          Understand every dollar in your quote.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-[var(--ink)]/64">
          We calculate the expected delivered cost before you order. Your quote includes an
          itemized breakdown, so you know what you are paying for.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2">
        {priceParts.map(([title, body], index) => (
          <article key={title} className="feature-card min-h-0">
            <span className="feature-number">0{index + 1}</span>
            <h2 className="display mt-6 text-2xl text-[var(--sea-deep)]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]/64">{body}</p>
          </article>
        ))}
      </div>

      <section className="process-card mt-8 text-white sm:mt-10">
        <p className="section-kicker text-[var(--sun)]">A practical example</p>
        <h2 className="display mt-3 text-3xl sm:text-4xl">A {money(40)} beauty item from the UAE</h2>
        <p className="mt-4 max-w-2xl leading-7 text-white/65">
          At roughly 1 kg, the expected delivered total is often around {money(70)}–{money(85)}.
          The exact amount depends on dimensions, store delivery, and customs category. Your
          actual quote shows the full calculation before checkout.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/#quote" className="btn btn-primary">Price my product</Link>
        <Link href="/faq" className="btn btn-ghost">Read common questions</Link>
      </div>
    </div>
  );
}
