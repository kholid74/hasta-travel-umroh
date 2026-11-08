import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Footprints } from "lucide-react";
import { LABEL_TIPE, PenggarisJarak, StatusKursi, fotoPaket, tagLayanan } from "@/components/public/ui";
import type { Foto } from "@/content/photos";
import type { Departure } from "@/content/types";
import type { KatalogRow } from "@/lib/katalog";
import {
  hargaKeberangkatan, menitJalan, rupiahSingkat, statusKeberangkatan, tanggalPanjang,
} from "@/lib/format";

/**
 * Package card shared by the homepage and the catalogue.
 *
 * - `varian="foto"` (homepage, approved in PUBLIC-02A-R): destination photo on top.
 * - `varian="katalog"` (PUBLIC-02C): no photo. With 18 packages and three destination photos, repeated
 *   photos read as "different hotels"; instead the card leads with what actually differs — type and
 *   duration, service tags from the package data, and the Makkah hotel distance on a small ruler.
 *
 * Both show date + city + seats, quad price as the headline with triple/double beneath, and one
 * "Lihat detail" action. A sold-out date stays visible and explorable, and says so plainly.
 */
export function PackageCard({
  paket, keberangkatan, jumlahTanggalLain = 0, foto, unggulan = false, varian = "foto",
  sizes = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw", className = "",
}: {
  paket: KatalogRow;
  keberangkatan: Departure;
  /** Other matching open dates (catalogue filter context). */
  jumlahTanggalLain?: number;
  foto?: Foto;
  /** Homepage featured card: keeps the PUBLIC-02A data hook. */
  unggulan?: boolean;
  varian?: "foto" | "katalog";
  sizes?: string;
  className?: string;
}) {
  const harga = hargaKeberangkatan(paket, keberangkatan);
  const penuh = statusKeberangkatan(keberangkatan.seatsAvailable) === "sold-out";
  const href = `/paket-umroh/${paket.slug}?d=${keberangkatan.date}`;
  const katalog = varian === "katalog";
  const tags = tagLayanan(paket.tags);
  const hotel = paket.makkahHotel;

  return (
    <article
      data-departure-card={unggulan || undefined}
      data-package-card={paket.slug}
      data-penuh={penuh || undefined}
      data-varian={varian}
      className={`group relative flex flex-col overflow-hidden rounded-card border border-hairline bg-surface shadow-[0_1px_2px_rgba(23,33,28,0.05)] transition-shadow hover:shadow-[0_10px_28px_-14px_rgba(23,33,28,0.35)] ${className}`}
    >
      {katalog ? (
        <div className="flex items-center justify-between gap-3 border-b border-hairline bg-raised px-4 py-2.5 sm:px-5">
          <span className="text-sm font-semibold">{LABEL_TIPE[paket.type]} · {paket.duration} hari</span>
          {penuh && <span className="rounded-card bg-forest px-2 py-0.5 text-xs font-semibold text-ivory">Tanggal ini penuh</span>}
        </div>
      ) : (
        <FotoKartu foto={foto ?? fotoPaket(paket.id)} paket={paket} penuh={penuh} sizes={sizes} />
      )}

      <div className={`flex flex-1 flex-col ${katalog ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}>
        <h3 className={katalog ? "text-[1.5rem] leading-tight" : "text-[1.65rem] leading-tight"}>
          <Link href={href} className="after:absolute after:inset-0 after:rounded-card hover:text-emerald">
            {paket.name}
          </Link>
        </h3>

        {katalog && tags.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Keunggulan layanan">
            {tags.map((t) => (
              <li key={t} className="rounded-full border border-emerald/30 px-2.5 py-0.5 text-xs font-semibold text-emerald">{t}</li>
            ))}
          </ul>
        )}

        {katalog && (
          <div className="mt-4">
            <p className="flex items-baseline justify-between gap-3 text-sm">
              <span><span className="font-display text-2xl tabular-nums text-forest">{hotel.distanceMeters} m</span> ke Masjidil Haram</span>
              <span className="shrink-0 text-muted">±{menitJalan(hotel.distanceMeters)} menit jalan</span>
            </p>
            <div className="mt-2"><PenggarisJarak meter={hotel.distanceMeters} /></div>
            <p className="mt-2 text-sm text-muted">
              {hotel.name} · bintang {hotel.starRating}{hotel.stepFree ? " · bebas tangga" : ""}
            </p>
          </div>
        )}

        <ul className={`${katalog ? "mt-4 border-t border-hairline pt-4" : "mt-4"} space-y-2.5 text-sm`}>
          <li className="flex items-start gap-2.5">
            <CalendarDays aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={1.75} />
            <span className="flex flex-1 flex-wrap justify-between gap-x-3">
              <span><span className="font-semibold tabular-nums">{tanggalPanjang(keberangkatan.date)}</span> dari {keberangkatan.departureCity}</span>
              <StatusKursi seats={keberangkatan.seatsAvailable} className="text-sm" />
            </span>
          </li>
          {!katalog && (
            <li className="flex items-start gap-2.5">
              <Footprints aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={1.75} />
              <span>
                {hotel.name}: <span className="font-semibold tabular-nums">{hotel.distanceMeters} m</span> ke
                Masjidil Haram, ±{menitJalan(hotel.distanceMeters)} menit jalan
              </span>
            </li>
          )}
        </ul>

        {(penuh || jumlahTanggalLain > 0) && (
          <p className="mt-3 text-sm text-muted" data-tanggal-lain={jumlahTanggalLain}>
            {penuh
              ? jumlahTanggalLain > 0
                ? `Pilih salah satu dari ${jumlahTanggalLain} tanggal lain di halaman detail.`
                : "Detail paket tetap bisa dilihat; tanyakan jadwal berikutnya lewat konsultasi."
              : `+${jumlahTanggalLain} tanggal lain yang cocok.`}
          </p>
        )}

        <div className={`mt-auto ${katalog ? "pt-5" : "pt-6"}`}>
          <div className="flex items-end justify-between gap-4 border-t border-hairline pt-4">
            <div>
              <p className="text-xs text-muted">Harga per orang · kamar ber-4</p>
              <p className="font-display text-3xl leading-tight tabular-nums text-forest" data-harga-quad={harga.quad}>{rupiahSingkat(harga.quad)}</p>
            </div>
            <span className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-card border border-emerald/40 px-3.5 text-sm font-semibold text-emerald transition-colors group-hover:border-emerald group-hover:bg-emerald group-hover:text-paper">
              Lihat detail
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-2 text-xs text-muted tabular-nums">
            Kamar ber-3 {rupiahSingkat(harga.triple)} · ber-2 {rupiahSingkat(harga.double)}
          </p>
        </div>
      </div>
    </article>
  );
}

function FotoKartu({ foto, paket, penuh, sizes }: { foto: Foto; paket: KatalogRow; penuh: boolean; sizes: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden">
      <Image src={foto.src} alt={foto.alt} fill sizes={sizes} className="object-cover" />
      <span className="absolute left-3 top-3 rounded-card bg-paper px-2.5 py-1 text-xs font-semibold text-deep">
        {paket.duration} hari · {LABEL_TIPE[paket.type].replace("Umrah ", "")}
      </span>
      {penuh && (
        <span className="absolute right-3 top-3 rounded-card bg-forest px-2 py-1 text-xs font-semibold text-ivory">Tanggal ini penuh</span>
      )}
    </div>
  );
}
