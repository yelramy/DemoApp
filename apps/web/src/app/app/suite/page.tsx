import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SuiteClient } from "@/components/SuiteClient";

export default async function SuitePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-2 text-3xl text-[var(--sea-deep)]">Ship-for-me suite</h1>
      <p className="mb-6 text-sm text-[var(--ink)]/65">
        Shop yourself to our hub address, then forward to Lebanon.
      </p>
      <SuiteClient />
    </div>
  );
}
