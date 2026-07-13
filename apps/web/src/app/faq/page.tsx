import Link from "next/link";

const faqs = [
  ["Which stores can I order from?", "You can request products from major UAE, US, and Turkish stores, including Amazon, Noon, iHerb, and Trendyol. Restricted or prohibited products cannot be accepted."],
  ["Is the quote the final amount?", "The quote is the best delivered-cost estimate available before purchase. If a store changes its price, the product differs from its listing, or customs creates a significant adjustment, we show the change clearly before proceeding whenever possible."],
  ["How can I pay?", "Whish is the primary payment method. OMT, eligible cash on delivery, and secure card payment links for family or friends abroad are also available in supported cases."],
  ["How long does delivery take?", "Timing depends on the store, origin hub, customs, and your location. Your quote and order timeline provide the most relevant estimate and each major status update."],
  ["Do you deliver throughout Lebanon?", "Yes. Local delivery is handled by partners across Lebanon. Cash-on-delivery limits and service times can vary by area."],
  ["Can someone abroad pay for my order?", "Yes. At checkout, create a secure payment link and send it to the payer. They can pay without accessing the rest of your account."],
  ["What if my item arrives damaged or incorrect?", "Open a claim from the order page as soon as possible and include photos. Our support team will review the store, hub, and delivery records and explain the available resolution."],
];

export default function FaqPage() {
  return (
    <div className="container-bridge py-12 sm:py-20">
      <header className="max-w-3xl">
        <p className="section-kicker">Help center</p>
        <h1 className="display mt-3 text-4xl text-[var(--sea-deep)] sm:text-6xl">Questions, answered clearly.</h1>
        <p className="mt-5 leading-7 text-[var(--ink)]/64">What to expect before, during, and after your international order.</p>
      </header>
      <div className="mt-10 space-y-3 sm:mt-14">
        {faqs.map(([question, answer], index) => (
          <details key={question} className="group rounded-[18px] border border-black/[0.07] bg-white px-5 py-1 shadow-[0_10px_30px_rgba(7,59,67,.04)] sm:px-6">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-extrabold text-[var(--sea-deep)]">
              <span><span className="mr-3 text-xs text-[var(--accent)]">0{index + 1}</span>{question}</span>
              <span className="text-xl font-normal transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="max-w-3xl pb-5 text-sm leading-7 text-[var(--ink)]/64">{answer}</p>
          </details>
        ))}
      </div>
      <section className="cta-card mt-10 text-center">
        <h2 className="display text-3xl text-[var(--sea-deep)]">Still need help?</h2>
        <p className="mt-3 text-sm text-[var(--ink)]/62">Send us your question and our team will help.</p>
        <Link href="/contact" className="btn btn-primary mt-6">Contact support</Link>
      </section>
    </div>
  );
}
