import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Viewport } from "next";
import { MobileConsultBar } from "@/components/MobileConsultBar";

// PUBLIC-02B: let the sticky bar extend under the iOS home indicator and pad itself with
// env(safe-area-inset-bottom). Scoped to public pages; the admin workspace is unchanged.
export const viewport: Viewport = { viewportFit: "cover" };

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><Header /><div className="flex-1">{children}</div><Footer /><MobileConsultBar /></>;
}
