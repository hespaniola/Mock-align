import { AppNav } from "@/components/shell/app-nav";
import { Ambient } from "@/components/shell/ambient";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ambient />
      <AppNav />
      <main id="main" className="mx-auto min-h-dvh max-w-6xl px-5 pb-32 pt-24 sm:px-8 sm:pb-24 sm:pt-32">
        {children}
      </main>
    </>
  );
}
