import Image from "next/image";
import Link from "next/link";
import { hotelMeta } from "@/components/HotelDistanceBadge";
import { fotoKaabaHaji, fotoKubahHijau, type Foto } from "@/content/photos";
import type { Hotel } from "@/content/types";
import { KECEPATAN_JALAN_LANSIA, menitJalan, rupiahSingkat } from "@/lib/format";
import type { KatalogRow } from "@/lib/katalog";
import { Ornamen } from "./Motif";

type Baris = { hotel: Hotel; paket: KatalogRow };

/** Hotels used by packages that still have open departures, nearest first, with the cheapest such package. */
function daftarHotel(rows: KatalogRow[], kota: "makkahHotel" | "madinahHotel"): Baris[] {
  const peta = new Map<string, Baris>();
  for (const paket of rows) {
    if (paket.departures.length === 0) continue;
    const hotel = paket[kota];
    const ada = peta.get(hotel.name);
    if (!ada || paket.price.quad < ada.paket.price.quad) peta.set(hotel.name, { hotel, paket });
  }
  return [...peta.values()].sort((a, b) => a.hotel.distanceMeters - b.hotel.distanceMeters);
}

const TERDEKAT = 5;
const TERDEKAT_PONSEL = 3;

/**
 * Map-like schematic: the mosque at the left end, one dot per hotel at its true distance on a linear
 * scale. Decorative summary only (aria-hidden) — the list below carries the same data as text.
 */
function Penggaris({ baris }: { baris: Baris[] }) {
  const maks = Math.max(1000, Math.ceil(Math.max(...baris.map((b) => b.hotel.distanceMeters)) / 500) * 500);
  const x = (m: number) => 4 + (m / maks) * 92;
  return (
    <svg viewBox="0 0 100 18" preserveAspectRatio="none" aria-hidden className="h-10 w-full overflow-visible">
      <line x1="4" y1="9" x2="96" y2="9" stroke="var(--color-champagne)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <rect x="0" y="3" width="2.5" height="12" fill="var(--color-forest)" />
      {baris.map(({ hotel }) => (
        <line key={hotel.name} x1={x(hotel.distanceMeters)} y1="4" x2={x(hotel.distanceMeters)} y2="14" stroke="var(--color-emerald)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

function Item({ hotel, paket, className = "" }: Baris & { className?: string }) {
  return (
    <li className={className}>
      <Link
        href={`/paket-umroh/${paket.slug}`}
        className="grid min-h-14 grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3 hover:text-emerald"
      >
        <span className="font-display text-2xl leading-none tabular-nums text-forest">
          {hotel.distanceMeters}<span className="text-base"> m</span>
        </span>
        <span className="min-w-0">
          <span className="block font-semibold leading-snug">{hotel.name}</span>
          <span className="block text-sm text-muted">
            ±{menitJalan(hotel.distanceMeters)} menit ·{" "}
            {/* Phones: route and step-free status only (what matters for elderly pilgrims); stars from sm up. */}
            <span className="sm:hidden">{hotelMeta(hotel).replace(/^Bintang \d · /, "")}</span>
            <span className="hidden sm:inline">{hotelMeta(hotel)}</span>
          </span>
        </span>
        <span className="text-right text-xs text-muted">
          mulai
          <span className="block text-sm font-semibold text-ink tabular-nums">{rupiahSingkat(paket.price.quad)}</span>
        </span>
      </Link>
    </li>
  );
}

function Kota({ judul, masjid, foto, posisi, baris }: { judul: string; masjid: string; foto: Foto; posisi: string; baris: Baris[] }) {
  // Phones show the 3 nearest, larger screens 5; every other hotel stays one tap away in the disclosure.
  // Rows 4–5 are rendered in both places and shown in exactly one (display:none leaves the a11y tree).
  const lainnyaPonsel = baris.slice(TERDEKAT_PONSEL);
  const lainnya = baris.slice(TERDEKAT);
  const rentang = (b: Baris[]) => `${b.length} hotel lain, ${b[0].hotel.distanceMeters}–${b.at(-1)!.hotel.distanceMeters} m`;
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface" data-hotel-city={judul}>
      <div className="relative h-28 sm:h-36">
        <Image src={foto.src} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className={`object-cover ${posisi}`} />
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-2xl">{judul}</h3>
        <p className="text-sm text-muted">Jarak hotel ke pelataran {masjid}</p>
        <div className="mt-4">
          <Penggaris baris={baris} />
          <div aria-hidden className="mt-1 flex justify-between text-xs text-muted">
            <span>{masjid}</span>
            <span>lebih jauh</span>
          </div>
        </div>
        <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
          {baris.slice(0, TERDEKAT).map((b, i) => (
            <Item key={b.hotel.name} {...b} className={i >= TERDEKAT_PONSEL ? "hidden sm:block" : ""} />
          ))}
        </ul>
        {lainnyaPonsel.length > 0 && (
          <details className={`disclosure border-t border-hairline ${lainnya.length === 0 ? "sm:hidden" : ""}`}>
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 py-3 text-sm font-semibold text-emerald [&::-webkit-details-marker]:hidden">
              <span className="sm:hidden">{rentang(lainnyaPonsel)}</span>
              {lainnya.length > 0 && <span className="hidden sm:inline">{rentang(lainnya)}</span>}
            </summary>
            <ul className="divide-y divide-hairline border-t border-hairline">
              {lainnyaPonsel.map((b, i) => (
                <Item key={b.hotel.name} {...b} className={i < TERDEKAT - TERDEKAT_PONSEL ? "sm:hidden" : ""} />
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

export function HotelDistances({ rows }: { rows: KatalogRow[] }) {
  return (
    <section aria-labelledby="hotel-judul" className="mx-auto w-full max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-28">
      <div className="max-w-[42rem]">
        <Ornamen className="text-gold-ink" />
        <h2 id="hotel-judul" className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-[1.08]">Seberapa dekat hotelnya ke masjid?</h2>
        <p className="mt-4 text-muted">
          Hotel yang dipakai paket kami, dari yang terdekat. Waktu jalan dihitung dengan langkah jamaah lansia
          ({KECEPATAN_JALAN_LANSIA} meter per menit). Harga “mulai” adalah harga dasar kamar ber-4 terendah di antara paket
          yang memakai hotel itu.
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
        <Kota judul="Makkah" masjid="Masjidil Haram" foto={fotoKaabaHaji} posisi="object-[50%_45%]" baris={daftarHotel(rows, "makkahHotel")} />
        <Kota judul="Madinah" masjid="Masjid Nabawi" foto={fotoKubahHijau} posisi="object-[50%_82%]" baris={daftarHotel(rows, "madinahHotel")} />
      </div>
    </section>
  );
}
