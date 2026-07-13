import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { computeQuote, loadPricingConfig } from "@/lib/pricing";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.toLowerCase() || "";
  const products = await prisma.catalogProduct.findMany({
    where: q
      ? {
          active: true,
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : { active: true },
    orderBy: { title: "asc" },
  });
  return NextResponse.json({ products });
}
