import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const header = "publicId,status,itemTitle,totalUsd,quotedWeightKg,finalWeightKg,hubTracking";
  const rows = orders.map((o) =>
    [
      o.publicId,
      o.status,
      JSON.stringify(o.itemTitle),
      o.totalUsd,
      o.quotedWeightKg ?? "",
      o.finalWeightKg ?? "",
      o.hubTracking ?? "",
    ].join(","),
  );
  return new NextResponse([header, ...rows].join("\n"), {
    headers: {
      "content-type": "text/csv",
      "content-disposition": "attachment; filename=bridge-orders.csv",
    },
  });
}
