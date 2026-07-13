const pages: Record<string, { title: string; body: string }> = {
  terms: {
    title: "Terms of Service",
    body: "Bridge provides quoting, payment collection, and order coordination. Physical logistics are fulfilled by partners. Quotes expire. Customs estimates may vary within disclosed policy. Banned goods are refused.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "We process phone, email, address, and order data to fulfill deliveries. OTP logs are retained briefly. You may request export or deletion subject to accounting retention.",
  },
  refunds: {
    title: "Refunds & Damage",
    body: "Out-of-stock after payment: refund or alternate within 24h. Damage/loss claims within 72h of delivery with photos. Partner liability caps apply as disclosed at checkout.",
  },
  prohibited: {
    title: "Prohibited items",
    body: "Weapons, illicit drugs, counterfeit goods, loose lithium batteries, alcohol/tobacco (policy), perishables without cold chain, and items banned by airline or Lebanese customs.",
  },
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) {
    return (
      <div className="container-bridge py-16">
        <h1 className="display text-3xl">Not found</h1>
      </div>
    );
  }
  return (
    <div className="container-bridge py-16">
      <div className="panel max-w-3xl p-8">
        <h1 className="display mb-4 text-4xl text-[var(--sea-deep)]">{page.title}</h1>
        <p className="leading-relaxed text-[var(--ink)]/75">{page.body}</p>
      </div>
    </div>
  );
}
