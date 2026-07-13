export default function FaqPage() {
  const faqs = [
    ["How do I pay?", "Whish is primary. COD (limited), OMT, and diaspora card pay links are supported."],
    ["Do you ship everywhere in Lebanon?", "Yes via partner last-mile. COD caps vary by area."],
    ["What if customs is higher than the estimate?", "We disclose estimate policy at quote. Large overages get an adjustment invoice."],
    ["Can family abroad pay?", "Yes — create a pay link at checkout and share it."],
  ];
  return (
    <div className="container-bridge py-16">
      <h1 className="display mb-8 text-4xl text-[var(--sea-deep)]">FAQ</h1>
      <div className="space-y-4">
        {faqs.map(([q, a]) => (
          <div key={q} className="panel p-5">
            <h2 className="font-bold text-[var(--sea-deep)]">{q}</h2>
            <p className="mt-2 text-sm text-[var(--ink)]/70">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
