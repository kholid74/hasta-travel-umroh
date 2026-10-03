import { requireSession } from "@/lib/admin/auth";
import { DemoProvider } from "@/components/admin/Store";
import { Shell } from "@/components/admin/Shell";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <DemoProvider><Shell>{children}</Shell></DemoProvider>;
}
