import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const [posts, macros, contacts, flags] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.supportMacro.findMany(),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.featureFlag.findMany(),
  ]);
  return NextResponse.json({ posts, macros, contacts, flags });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.type === "blog") {
    const post = await prisma.blogPost.upsert({
      where: { slug: body.slug },
      update: {
        title: body.title,
        excerpt: body.excerpt,
        body: body.body,
        published: body.published ?? true,
      },
      create: {
        slug: body.slug,
        title: body.title,
        excerpt: body.excerpt || "",
        body: body.body || "",
        published: body.published ?? true,
      },
    });
    return NextResponse.json({ post });
  }
  if (body.type === "macro") {
    const macro = await prisma.supportMacro.create({
      data: { title: body.title, body: body.body },
    });
    return NextResponse.json({ macro });
  }
  return NextResponse.json({ error: "unknown" }, { status: 400 });
}
