import Image from "next/image";
import Link from "next/link";
import { company } from "@/content/company";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { linkWa } from "@/lib/whatsapp";

const NAV = [
  { href: "/paket-umroh", label: "Paket Umroh" },
  { href: "/haji-khusus", label: "Haji Khusus" },
  { href: "/jadwal-keberangkatan", label: "Jadwal" },
  { href: "/faq", label: "FAQ" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

export function Header() {
  return (
    <header className="border-b border-hairline bg-surface">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-10 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" aria-hidden width={173} height={263} className="h-10 w-auto" />
          <span className="font-display text-lg text-ink">{company.name}</span>
        </Link>
        <nav aria-label="Navigasi utama" className="-mx-4 flex-1 overflow-x-auto px-4 sm:mx-0 sm:px-0 md:border-l md:border-hairline md:pl-10">
          <ul className="flex items-center gap-5 whitespace-nowrap text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-primary">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={linkWa({ kind: "umum" })}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="header"
          className="hidden min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary transition-colors hover:bg-secondary md:inline-flex"
        >
          <WhatsAppIcon />
          Konsultasi via WhatsApp
        </a>
      </div>
    </header>
  );
}
