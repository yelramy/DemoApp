import Link from "next/link";
import { prisma } from "@bridge/db";

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-6 text-4xl text-[var(--sea-deep)]">Guides</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="panel block p-6">
            <h2 className="display text-2xl text-[var(--sea-deep)]">{p.title}</h2>
            <p className="mt-2 text-sm text-[var(--ink)]/65">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
