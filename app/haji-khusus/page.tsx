import type { Metadata } from "next";
import { Check } from "lucide-react";
import { HotelDistanceBadge, hotelMeta } from "@/components/HotelDistanceBadge";
import { TrustSection } from "@/components/TrustSection";
import { DEMO_NOTICE } from "@/content/company";
import { hajiPackages } from "@/content/haji";
import type { HajiPackage } from "@/content/types";
import { dolar } from "@/lib/format";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { linkWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Haji Khusus",
  description:
    "Paket Haji Khusus dengan masa tunggu, skema pembayaran, dan jarak hotel yang ditulis terbuka. Situs demo.",
};

function KartuHaji({ paket }: { paket: HajiPackage }) {
  const tanpaAntre = paket.waitingYears === 0;
  return (
    <article className="rounded-card border border-hairline bg-surface p-6">
      <h2 className="text-2xl">{paket.name}</h2>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-hairline py-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-sm text-muted">Masa tunggu</dt>
          <dd className="font-display text-xl font-semibold text-secondary">
            {tanpaAntre ? "Tanpa antre" : `± ${paket.waitingYears} tahun`}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Perkiraan berangkat</dt>
          <dd className="font-display text-xl font-semibold text-secondary">
            {paket.estimatedDepartureYear}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Biaya</dt>
          <dd className="font-display text-xl font-semibold text-secondary">
            {dolar(paket.priceUSD)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Setoran awal</dt>
          <dd className="font-display text-xl font-semibold text-secondary">
            {dolar(paket.dpUSD)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-muted">
        <span className="font-semibold text-ink">Soal kuota:</span> {paket.quotaNote}
      </p>
      <p className="mt-2 text-sm text-muted">
        <span className="font-semibold text-ink">Pembayaran:</span> {paket.installmentNote} Kurs
        rupiah mengikuti tanggal pembayaran, jadi nilai rupiahnya dikonfirmasi saat konsultasi.
        Angkanya tidak dipatok di halaman ini karena kurs berubah.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          { kota: "Makkah", hotel: paket.makkahHotel },
          { kota: "Madinah", hotel: paket.madinahHotel },
        ].map(({ kota, hotel }) => (
          <div key={kota}>
            <p className="text-sm font-medium text-secondary">
              {kota} · {hotel.name}
            </p>
            <div className="mt-1.5">
              <HotelDistanceBadge hotel={hotel} />
            </div>
            <p className="mt-1 text-sm text-muted">{hotelMeta(hotel)}</p>
          </div>
        ))}
      </div>

      <details className="mt-5 border-t border-hairline pt-4">
        <summary className="cursor-pointer list-none py-3 text-sm font-semibold text-primary">
          Lihat fasilitas dan syarat pendaftaran
        </summary>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-base">Sudah termasuk</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {paket.facilities.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-base">Syarat pendaftaran</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {paket.requirements.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <a
        href={linkWa({ kind: "haji", namaPaket: paket.name })}
        target="_blank"
        rel="noopener noreferrer"
        data-wa-source="haji"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary transition-colors hover:bg-secondary"
      >
        <WhatsAppIcon />
        Tanya masa tunggu &amp; pembayaran
      </a>
    </article>
  );
}

export default function HajiKhususPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Haji Khusus</h1>
        <p className="mt-3 text-muted">
          Haji Khusus tidak dijual seperti umroh. Yang Anda daftarkan bukan tanggal keberangkatan,
          melainkan antrean. Karena itu halaman ini menampilkan masa tunggu dan skema pembayaran
          lebih dulu, bukan hitung mundur seat.
        </p>
        <p className="mt-2 text-sm text-muted">{DEMO_NOTICE}</p>
      </header>

      <div className="mt-8 space-y-6">
        {hajiPackages.map((p) => (
          <KartuHaji key={p.id} paket={p} />
        ))}
      </div>

      <div className="mt-10">
        <TrustSection />
      </div>
    </main>
  );
}
