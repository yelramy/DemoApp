import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SupportClient } from "@/components/SupportClient";

export default async function SupportPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-6 text-3xl text-[var(--sea-deep)]">Support</h1>
      <SupportClient />
    </div>
  );
}
