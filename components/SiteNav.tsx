"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { company } from "@/content/company";
import { WA_DEMO_NOTE, audienceOf, consultContextForPath, linkWa } from "@/lib/whatsapp";

export const PUBLIC_NAV = [
  { href: "/paket-umroh", label: "Paket Umrah" },
  { href: "/haji-khusus", label: "Haji Khusus" },
  { href: "/jadwal-keberangkatan", label: "Jadwal" },
  { href: "/faq", label: "FAQ" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
] as const;

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Desktop navigation (≥ 1024 px) with the current page marked. */
export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="hidden flex-1 lg:block lg:border-l lg:border-hairline lg:pl-10">
      <ul className="flex items-center gap-5 whitespace-nowrap text-sm">
        {PUBLIC_NAV.map((n) => {
          const active = isActive(pathname, n.href);
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 hover:text-primary ${active ? "border-primary text-primary" : "border-transparent"}`}
              >
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Operator consultation button; its prefilled message follows the current page. */
export function HeaderConsultButton() {
  const context = consultContextForPath(usePathname());
  return (
    <a
      href={linkWa(context)}
      target="_blank"
      rel="noopener noreferrer"
      data-wa-source="header"
      data-wa-audience={audienceOf(context)}
      title={WA_DEMO_NOTE}
      className="hidden min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary transition-colors hover:bg-primary-hover md:inline-flex"
    >
      <WhatsAppIcon />
      Konsultasi via WhatsApp
    </a>
  );
}

/**
 * Mobile/tablet menu (< 1024 px). A native modal <dialog> keeps focus inside, closes on Escape,
 * and makes the page behind it inert; focus returns to the Menu button when it closes.
 */
export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const context = consultContextForPath(pathname);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="menu-situs"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-card border border-hairline px-3 text-sm font-semibold lg:hidden"
      >
        <Menu aria-hidden className="size-5" strokeWidth={1.75} />
        Menu
      </button>
      <dialog
        id="menu-situs"
        ref={dialogRef}
        aria-labelledby="menu-situs-judul"
        className="site-menu"
        onClose={() => { setOpen(false); buttonRef.current?.focus(); }}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-[640px] flex-col px-4 pb-8 pt-3 sm:px-6">
          <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3">
            <span className="flex items-center gap-2.5">
              <Image src="/logo-mark.png" alt="" aria-hidden width={173} height={263} className="h-10 w-auto" />
              <span className="font-display text-lg">{company.name}</span>
            </span>
            <h2 id="menu-situs-judul" className="sr-only">Menu situs</h2>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-card border border-hairline px-3 text-sm font-semibold"
            >
              <X aria-hidden className="size-5" strokeWidth={1.75} />
              Tutup
            </button>
          </div>

          <nav aria-label="Navigasi utama ponsel" className="mt-4">
            <ul className="divide-y divide-hairline">
              {PUBLIC_NAV.map((n) => {
                const active = isActive(pathname, n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-14 items-center justify-between font-display text-2xl ${active ? "text-primary" : ""}`}
                    >
                      {n.label}
                      {active && <span className="font-sans text-xs uppercase tracking-[0.15em]">Halaman ini</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 rounded-card border border-hairline bg-surface p-4">
            <a
              href={linkWa(context)}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-source="menu"
              data-wa-audience={audienceOf(context)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-card bg-primary px-4 font-semibold text-onprimary"
            >
              <WhatsAppIcon className="size-5" />
              Konsultasi via WhatsApp
            </a>
            <p className="mt-2 text-xs text-muted">{WA_DEMO_NOTE}</p>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Tentang demo ini</p>
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
            >
              Coba workspace demo
              <ArrowUpRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
            <p className="text-xs text-muted">Pilih peran tanpa akun. Akses demo, bukan login sungguhan.</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
