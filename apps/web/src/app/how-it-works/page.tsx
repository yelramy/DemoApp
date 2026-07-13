export default function HowItWorksPage() {
  const steps = [
    {
      n: "01",
      t: "Paste a link",
      d: "Amazon.ae, Noon, or enter the item manually if the parser can’t read the price.",
    },
    {
      n: "02",
      t: "See the final USD price",
      d: "Item, buy fee, shipping, customs estimate, and payment buffer — before you pay.",
    },
    {
      n: "03",
      t: "Pay the Lebanese way",
      d: "Whish first. COD and OMT when you need them. Diaspora can pay for family.",
    },
    {
      n: "04",
      t: "We buy & ship",
      d: "Our UAE hub receives, photos, consolidates, flies to Lebanon, clears, delivers.",
    },
  ];
  return (
    <div className="container-bridge py-16">
      <h1 className="display mb-4 text-4xl text-[var(--sea-deep)] md:text-5xl">How it works</h1>
      <p className="mb-10 max-w-2xl text-[var(--ink)]/70">
        Bridge is the checkout layer. Logistics partners move the boxes. You get one trackable order.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {steps.map((s) => (
          <div key={s.n} className="panel p-6">
            <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)]">{s.n}</p>
            <h2 className="display mt-2 text-2xl text-[var(--sea-deep)]">{s.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/70">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
