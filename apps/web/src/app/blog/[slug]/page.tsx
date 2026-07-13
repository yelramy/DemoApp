import { notFound } from "next/navigation";
import { prisma } from "@bridge/db";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();
  return (
    <div className="container-bridge py-10">
      <article className="panel mx-auto max-w-3xl p-8 md:p-10">
        <h1 className="display text-4xl text-[var(--sea-deep)]">{post.title}</h1>
        <p className="mt-3 text-sm text-[var(--ink)]/55">{post.excerpt}</p>
        <div className="mt-8 whitespace-pre-wrap leading-relaxed text-[var(--ink)]/80">
          {post.body}
        </div>
      </article>
    </div>
  );
}
