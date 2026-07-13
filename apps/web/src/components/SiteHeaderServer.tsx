import { getSessionUser } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

export async function SiteHeaderServer() {
  const user = await getSessionUser();
  return (
    <SiteHeader
      userName={user?.name || user?.phone || user?.email}
      isStaff={user?.role === "ADMIN" || user?.role === "OPS"}
    />
  );
}
