import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/dal";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return <AppShell userName={user.name}>{children}</AppShell>;
}
