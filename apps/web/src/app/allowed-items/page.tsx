import { prisma } from "@bridge/db";

export default async function AllowedItemsPage() {
  const bans = await prisma.bannedKeyword.findMany({ orderBy: { keyword: "asc" } });
  return (
    <div className="container-bridge py-16">
      <h1 className="display mb-4 text-4xl text-[var(--sea-deep)]">Allowed & banned</h1>
      <p className="mb-8 max-w-2xl text-sm text-[var(--ink)]/70">
        Launch categories: beauty, supplements, fashion soft goods, accessories. Hard blocks below.
      </p>
      <div className="panel p-6">
        <h2 className="display mb-3 text-xl">Banned keywords</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {bans.map((b) => (
            <li key={b.id} className="rounded-xl bg-[var(--foam)] px-3 py-2 text-sm">
              <strong>{b.keyword}</strong> · {b.severity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
