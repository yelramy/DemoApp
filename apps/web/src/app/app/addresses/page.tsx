import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AddressesClient } from "@/components/AddressesClient";

export default async function AddressesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-6 text-3xl text-[var(--sea-deep)]">Addresses</h1>
      <AddressesClient />
    </div>
  );
}
