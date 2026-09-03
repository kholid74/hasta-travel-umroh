import { Footprints } from "lucide-react";
import type { Hotel } from "@/content/types";
import { menitJalan } from "@/lib/format";

const LABEL_RUTE: Record<Hotel["route"], string> = {
  direct: "akses langsung",
  underground: "lewat terowongan",
  crossing: "menyeberang jalan",
};

/**
 * Warna sengaja netral — bukan hijau "aman" / merah "bahaya". Jamaah dengan
 * anggaran terbatas memang memilih hotel yang lebih jauh dengan sadar, dan
 * badge ini tidak berhak menghakimi pilihan itu.
 */
export function HotelDistanceBadge({ hotel }: { hotel: Hotel }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-card border border-hairline bg-surface px-2.5 py-1.5 text-[13px] leading-none text-muted">
      <Footprints aria-hidden className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
      <span className="font-semibold text-ink tabular-nums">{hotel.distanceMeters} m</span>
      <span aria-hidden>·</span>
      <span className="whitespace-nowrap">±{menitJalan(hotel.distanceMeters)} menit jalan santai</span>
    </span>
  );
}

/** Baris pendamping badge: bintang, tipe rute, dan bebas-tangga. */
export function hotelMeta(hotel: Hotel): string {
  const bagian = [`Bintang ${hotel.starRating}`, LABEL_RUTE[hotel.route]];
  if (hotel.stepFree) bagian.push("bebas tangga");
  return bagian.join(" · ");
}
