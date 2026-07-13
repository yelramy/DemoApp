import { money } from "@/lib/format";

export default function PricingPage() {
  return (
    <div className="container-bridge py-16">
      <h1 className="display mb-4 text-4xl text-[var(--sea-deep)]">Pricing</h1>
      <p className="mb-8 max-w-2xl text-[var(--ink)]/70">
        You always see an all-in quote first. No surprise WhatsApp fees after the fact.
      </p>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["Buy-for-me fee", "max($6, 7% of item)"],
          ["UAE air shipping", "from $12/kg · $15 min"],
          ["Customs", "estimate shown · category based"],
        ].map(([t, d]) => (
          <div key={t} className="panel p-6">
            <h2 className="display text-xl text-[var(--sea-deep)]">{t}</h2>
            <p className="mt-2 text-sm text-[var(--ink)]/70">{d}</p>
          </div>
        ))}
      </div>
      <div className="panel mt-8 p-6">
        <h2 className="display mb-2 text-2xl text-[var(--sea-deep)]">Example</h2>
        <p className="text-sm text-[var(--ink)]/70">
          A {money(40)} beauty item around 1 kg from UAE typically lands near {money(70)}–
          {money(85)} all-in depending on customs category — confirmed on your quote screen.
        </p>
      </div>
    </div>
  );
}
