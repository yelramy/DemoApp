import { MobileTabBar } from "@/components/MobileTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MobileTabBar />
    </>
  );
}
