import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { CheckoutForm } from "@/components/CheckoutForm";
import { HubCompare } from "@/components/HubCompare";
import { AddToCartButton } from "@/components/AddToCartButton";
import { QuoteExpiry } from "@/components/QuoteExpiry";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) notFound();
  const user = await getSessionUser();
  if (!user) redirect(`/login`);

  const payload = JSON.parse(quote.payloadJson) as {
    parsed: {
      title: string;
      imageUrl?: string | null;
      store: string;
      url: string;
      hubHint: string;
      confidence: number;
      notes?: string;
      variantLabel?: string;
      screenshotUrl?: string;
    };
  };

  const expired = quote.expiresAt < new Date();

  return (
    <div className="container-bridge grid gap-5 py-5 sm:gap-8 sm:py-8 lg:grid-cols-[1fr_0.9fr] lg:py-10">
      <section className="panel overflow-hidden order-2 lg:order-1">
        {payload.parsed.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={payload.parsed.imageUrl}
            alt=""
            className="h-44 w-full object-cover sm:h-56"
          />
        ) : (
          <div className="flex h-28 items-center justify-center bg-[var(--foam)] text-[var(--sea)] sm:h-40">
            Bridge quote
          </div>
        )}
        <div className="p-4 sm:p-6 md:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--mist)]">
            {payload.parsed.store} · hub {payload.parsed.hubHint}
          </p>
          <h1 className="display mb-3 text-2xl text-[var(--sea-deep)] sm:text-3xl">
            {payload.parsed.title}
          </h1>
          <a
            href={payload.parsed.url}
            className="text-sm font-semibold text-[var(--sea)]"
            target="_blank"
            rel="noreferrer"
          >
            View original product
          </a>
          {payload.parsed.variantLabel ? (
            <p className="mt-3 text-sm font-semibold text-[var(--sea)]">
              Variant: {payload.parsed.variantLabel}
            </p>
          ) : null}
          {payload.parsed.notes ? (
            <p className="mt-4 rounded-xl bg-[var(--sand)] p-3 text-sm">
              {payload.parsed.notes}
            </p>
          ) : null}
          {payload.parsed.screenshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payload.parsed.screenshotUrl}
              alt="Manual screenshot"
              className="mt-4 max-h-48 rounded-xl object-contain"
            />
          ) : null}
        </div>
      </section>

      <section className="panel order-1 p-4 sm:p-6 md:p-8 lg:order-2">
        <h2 className="display mb-3 text-xl text-[var(--sea-deep)] sm:mb-4 sm:text-2xl">
          All-in USD
        </h2>
        <dl className="space-y-2 text-sm">
          {[
            ["Item", quote.itemSubtotal],
            ["Buy-for-me fee", quote.buyFee],
            [`Shipping (${quote.chargeableKg} kg)`, quote.shipping],
            ["Customs estimate", quote.customsEstimate],
            ["Payment fee buffer", quote.paymentFee],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4">
              <dt className="text-[var(--ink)]/65">{label}</dt>
              <dd className="font-semibold">{money(Number(value))}</dd>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-base">
            <dt className="font-bold">Total</dt>
            <dd className="display text-2xl text-[var(--sea-deep)]">
              {money(quote.total)}
            </dd>
          </div>
        </dl>
        <QuoteExpiry expiresAt={quote.expiresAt.toISOString()} />
        {expired ? (
          <p className="mt-4 text-sm text-[var(--danger)]">
            Quote expired.{" "}
            <Link href="/app" className="font-semibold underline">
              Create a new one
            </Link>
          </p>
        ) : (
          <>
            <CheckoutForm quoteId={quote.id} total={quote.total} />
            <AddToCartButton
              title={payload.parsed.title}
              url={payload.parsed.url}
              imageUrl={payload.parsed.imageUrl}
              priceUsd={quote.itemSubtotal}
              weightKg={quote.chargeableKg}
              hub={quote.hub}
            />
            <HubCompare
              title={payload.parsed.title}
              priceUsd={quote.itemSubtotal}
              weightKg={quote.chargeableKg}
            />
          </>
        )}
      </section>
    </div>
  );
}
