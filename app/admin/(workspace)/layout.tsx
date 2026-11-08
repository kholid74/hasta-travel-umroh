import { requireSession } from "@/lib/admin/auth";
import { DemoProvider } from "@/components/admin/Store";
import { Shell } from "@/components/admin/Shell";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("staff");
  // key: a role switch remounts the provider so identity, navigation and guards update together.
  return <DemoProvider key={`${session.role}:${session.personaId}`} access={{ role: session.role, personaId: session.personaId }}><Shell>{children}</Shell></DemoProvider>;
}
