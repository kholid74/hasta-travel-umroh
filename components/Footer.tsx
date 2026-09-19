import Image from "next/image";
import Link from "next/link";
import { company } from "@/content/company";
import { URL_SIMPU } from "@/components/TrustSection";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { linkWa } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-hairline bg-surface">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <Image
            src="/logo-lockup.png"
            alt={company.name}
            width={636}
            height={263}
            className="h-16 w-auto"
          />
          <p className="mt-2 text-sm text-muted">
            {company.address.street}
            <br />
            {company.address.city} {company.address.postalCode}
          </p>
          <p className="mt-3 text-sm text-muted">
            Izin PPIU {company.licensePPIU}
            <br />
            <a
              href={URL_SIMPU}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-primary"
            >
              Cek di SISKOPATUH Kemenag
            </a>
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <ul className="text-sm">
            {[
              ["/paket-umroh", "Paket Umroh"],
              ["/haji-khusus", "Haji Khusus"],
              ["/jadwal-keberangkatan", "Jadwal Keberangkatan"],
              ["/faq", "FAQ"],
              ["/tentang", "Tentang Kami"],
              ["/kontak", "Kontak"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center hover:text-primary">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold">Situs ini demo portofolio</p>
          <p className="mt-2 text-sm text-muted">
            Seluruh data perusahaan, nomor izin, harga, dan testimoni di situs ini fiktif. Nama
            hotel, jarak ke masjid, dan nama maskapai adalah informasi publik yang bisa Anda
            verifikasi sendiri.
          </p>
          <p className="mt-2 text-sm text-muted">
            Nama maskapai disebut sebagai informasi rute, bukan tanda kemitraan atau afiliasi.
          </p>
          <a
            href={linkWa({ kind: "studio" })}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-source="footer-studio"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-card border border-primary px-4 text-sm font-semibold text-primary"
          >
            <WhatsAppIcon />
            Saya ingin website seperti ini
          </a>
        </div>
      </div>

      <div className="border-t border-hairline">
        <p className="mx-auto w-full max-w-[1200px] px-4 py-4 text-xs text-muted sm:px-6">
          DATA DEMO · Dibuat oleh {company.studio.name} sebagai contoh situs katalog Umroh &amp;
          Haji. Bukan penyelenggara perjalanan ibadah.
        </p>
      </div>
    </footer>
  );
}
