"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Shell for the single mobile sticky action on a public page (PUBLIC-02B).
 *
 * - It hides while any `[data-sticky-hide]` element (a page's own CTA block, the closing band, the
 *   footer) is on screen, so two consultation actions never compete and the page end is never covered.
 * - Hidden means moved off-screen, `inert` and `aria-hidden`: it cannot take focus or be read out.
 * - It respects the iOS home-indicator inset (`env(safe-area-inset-bottom)`).
 * - While shown, globals.css adds `scroll-padding-bottom`, so keyboard focus and in-page anchors stop
 *   above the bar instead of underneath it. No spacer element is added below the footer.
 */
export function StickyBar({
  kind, breakpoint, children,
}: { kind: "umum" | "detail"; breakpoint: "md" | "lg"; children: ReactNode }) {
  const pathname = usePathname();
  const [tersembunyi, setTersembunyi] = useState(false);

  useEffect(() => {
    const zona = Array.from(document.querySelectorAll("[data-sticky-hide]"));
    if (zona.length === 0) return;
    const terlihat = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) terlihat.add(e.target);
        else terlihat.delete(e.target);
      }
      setTersembunyi(terlihat.size > 0);
    });
    zona.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div
      data-sticky-cta={kind}
      data-state={tersembunyi ? "tersembunyi" : "tampil"}
      aria-hidden={tersembunyi || undefined}
      inert={tersembunyi || undefined}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.5)] transition-transform duration-200 ${
        breakpoint === "md" ? "md:hidden" : "lg:hidden"
      } ${tersembunyi ? "pointer-events-none translate-y-[110%]" : "translate-y-0"}`}
    >
      {children}
    </div>
  );
}
