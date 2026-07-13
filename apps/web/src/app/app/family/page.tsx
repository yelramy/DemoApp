import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { FamilyClient } from "@/components/FamilyClient";

export default async function FamilyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-2 text-3xl text-[var(--sea-deep)]">Family & referrals</h1>
      <p className="mb-6 text-sm text-[var(--ink)]/65">
        Essentials lists + your referral code for $5 credit both ways.
      </p>
      <FamilyClient />
    </div>
  );
}
