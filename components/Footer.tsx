import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { company } from "@/content/company";
import { labelIzin } from "@/components/TrustSection";
import { WaDemoNote } from "@/components/WaDemoNote";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { linkWa } from "@/lib/whatsapp";

/**
 * Two audiences, two areas (PUBLIC-01): the upper footer belongs to the (fictional) travel
 * operator; the "Tentang demo ini" panel below is for business owners and holds Kalsara's
 * studio CTA and the demo workspace entry, visually separated so it is not mistaken for the
 * operator's contact.
 */
export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface" data-sticky-hide>
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <Image src="/logo-lockup.png" alt={company.name} width={636} height={263} className="h-16 w-auto" />
          <p className="mt-2 text-sm text-muted">
            {company.address.street}
            <br />
            {company.address.city} {company.address.postalCode}
          </p>
          <p className="mt-3 text-sm text-muted">
            {labelIzin("PPIU")}
            <br />
            <Link href="/tentang#legalitas" className="underline underline-offset-4 hover:text-primary">
              Cara memeriksa izin travel
            </Link>
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <ul className="space-y-1 text-sm">
            {[
              ["/paket-umroh", "Paket Umrah"],
              ["/haji-khusus", "Haji Khusus"],
              ["/jadwal-keberangkatan", "Jadwal Keberangkatan"],
              ["/faq", "FAQ"],
              ["/tentang", "Tentang Kami"],
              ["/kontak", "Kontak"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-9 items-center hover:text-primary">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold">Konsultasi dengan {company.name}</p>
          <a
            href={linkWa({ kind: "umum" })}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-source="footer-operator"
            data-wa-audience="operator"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary"
          >
            <WhatsAppIcon />
            Konsultasi via WhatsApp
          </a>
          <WaDemoNote className="mt-2" />
        </div>
      </div>

      <section aria-labelledby="tentang-demo" className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6" data-area="demo-showcase">
        <div className="grid gap-6 rounded-card border border-dashed border-muted/40 bg-background p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Tentang demo ini · untuk pemilik travel</p>
            <h2 id="tentang-demo" className="mt-2 text-xl">
              Situs ini adalah showcase {company.studio.name}, bukan biro perjalanan
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Seluruh data perusahaan, nomor izin, harga, dan testimoni di situs ini fiktif. Nama hotel, jarak ke
              masjid, dan nama maskapai adalah informasi publik yang bisa Anda verifikasi sendiri; nama maskapai
              disebut sebagai informasi rute, bukan tanda kemitraan atau afiliasi.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <a
              href={linkWa({ kind: "studio" })}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-source="footer-studio"
              data-wa-audience="studio"
              className="inline-flex min-h-11 items-center gap-2 rounded-card border border-primary px-4 text-sm font-semibold text-primary"
            >
              <WhatsAppIcon />
              Buat website travel seperti ini
            </a>
            <Link
              href="/admin/login"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4 hover:text-primary"
            >
              Coba workspace demo
              <ArrowUpRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
            <p className="text-xs text-muted md:text-right">Akses demo tanpa akun — bukan login sungguhan.</p>
          </div>
        </div>
      </section>

      <div className="border-t border-hairline">
        <p className="mx-auto w-full max-w-[1200px] px-4 py-4 text-xs text-muted sm:px-6">
          DATA DEMO · Dibuat oleh {company.studio.name} sebagai contoh situs katalog Umrah &amp; Haji. Bukan
          penyelenggara perjalanan ibadah.
        </p>
      </div>
    </footer>
  );
}
