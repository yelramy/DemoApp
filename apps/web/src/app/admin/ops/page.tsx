import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminOpsClient } from "@/components/AdminOpsClient";

export default async function AdminOpsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "OPS") redirect("/app");
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-6 text-3xl text-[var(--sea-deep)]">
        Reconciliation & analytics
      </h1>
      <AdminOpsClient />
    </div>
  );
}
