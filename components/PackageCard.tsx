import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HotelDistanceBadge } from "@/components/HotelDistanceBadge";
import type { Departure, PackageType } from "@/content/types";
import type { KatalogRow } from "@/lib/katalog";
import {
  hargaKeberangkatan,
  rupiahSingkat,
  statusKeberangkatan,
  tanggalPanjang,
} from "@/lib/format";

const LABEL_TIPE: Record<PackageType, string> = {
  "umroh-reguler": "Umroh Reguler",
  "umroh-plus": "Umroh Plus",
  "umroh-ramadhan": "Umroh Ramadhan",
};

function Ketersediaan({ seats }: { seats: number }) {
  const status = statusKeberangkatan(seats);
  if (status === "sold-out") return <span className="font-semibold text-warning">Sold Out</span>;
  if (status === "limited")
    return <span className="font-semibold text-accent">Sisa {seats} seat</span>;
  return <span className="text-muted">Sisa {seats} seat</span>;
}

/**
 * Kartu sengaja hanya menampilkan sorotan: jarak hotel Makkah, tanggal terdekat,
 * ketersediaan, dan harga mulai. Sisanya — hotel Madinah, maskapai, itinerary —
 * ada di halaman detail. Kartu yang memuat semuanya membuat katalog sulit dipindai.
 */
export function PackageCard({
  paket,
  keberangkatan,
}: {
  paket: KatalogRow;
  keberangkatan: Departure;
  /** Tidak lagi ditampilkan di kartu; daftar tanggal lain ada di halaman detail. */
  jumlahTanggalLain?: number;
}) {
  const harga = hargaKeberangkatan(paket, keberangkatan);
  const hotel = paket.makkahHotel;

  return (
    <article className="flex h-full flex-col rounded-card border border-hairline bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">
        {LABEL_TIPE[paket.type]} · {paket.duration} hari
      </p>

      <h3 className="mt-2 text-2xl">
        <Link
          href={`/paket-umroh/${paket.slug}?d=${keberangkatan.date}`}
          className="hover:text-accent"
        >
          {paket.name}
        </Link>
      </h3>

      <div className="mt-4">
        <HotelDistanceBadge hotel={hotel} />
        <p className="mt-2 text-sm text-muted">
          {hotel.name} · bintang {hotel.starRating}
          {hotel.stepFree ? " · bebas tangga" : ""}
        </p>
      </div>

      <p className="mt-4 border-t border-hairline pt-4 text-sm">
        {tanggalPanjang(keberangkatan.date)}
        <span aria-hidden className="text-muted">
          {" · "}
        </span>
        <Ketersediaan seats={keberangkatan.seatsAvailable} />
      </p>

      <div className="mt-auto pt-5">
        <p className="text-xs text-muted">Mulai dari, sekamar berempat</p>
        <p className="font-display text-3xl tabular-nums">{rupiahSingkat(harga.quad)}</p>

        <Link
          href={`/paket-umroh/${paket.slug}?d=${keberangkatan.date}`}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary"
        >
          Detail paket
          <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}
