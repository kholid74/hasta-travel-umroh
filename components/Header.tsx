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
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-10 gap-y-1 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" aria-hidden width={173} height={263} className="h-10 w-auto" />
          <span className="font-display text-lg text-ink">{company.name}</span>
        </Link>
        {/* Menu membungkus ke baris kedua di ponsel, bukan menggulir: semua tautan langsung terlihat. */}
        <nav aria-label="Navigasi utama" className="order-last w-full md:order-none md:w-auto md:flex-1 md:border-l md:border-hairline md:pl-10">
          <ul className="flex flex-wrap items-center gap-x-5 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-11 items-center hover:text-primary">
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
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary transition-colors hover:bg-secondary md:ml-0"
        >
          <WhatsAppIcon />
          <span className="md:hidden">WhatsApp</span>
          <span className="hidden md:inline">Konsultasi via WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
