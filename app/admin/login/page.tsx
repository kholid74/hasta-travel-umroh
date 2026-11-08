import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/auth";
import { homeFor } from "@/lib/admin/access";
import { DemoGateway } from "@/components/admin/DemoGateway";

export const metadata: Metadata = { title: "Pilih Akses Demo" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  const { switch: switching } = await searchParams;
  // With a valid session the gateway is only shown when the user asks to switch roles.
  if (session && switching !== "1") redirect(homeFor(session.role));
  return <DemoGateway current={session ? { role: session.role, personaId: session.personaId } : null} />;
}
