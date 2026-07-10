import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

export function AppShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader userName={userName} />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
