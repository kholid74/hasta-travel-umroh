import type { Metadata } from "next";
import { KatalogClient } from "@/components/KatalogClient";
import { DEMO_NOTICE } from "@/content/company";
import { packages } from "@/content/packages";
import { bulanTersedia, durasiTersedia, toRow } from "@/lib/katalog";

export const metadata: Metadata = {
  title: "Paket Umroh",
  description:
    "Katalog paket umroh dengan jarak hotel ke Masjidil Haram dan Masjid Nabawi dalam meter, lengkap dengan tipe akses dan waktu jalan kaki. Situs demo.",
};

export default function KatalogPage() {
  // Tanggal acuan diambil saat build — situs ini statis, tidak ada jam server
  // yang berjalan. Keberangkatan yang sudah lewat akan hilang saat build ulang.
  const hariIni = new Date().toISOString().slice(0, 10);
  const rows = packages.map((p) => toRow(p, hariIni)).filter((r) => r.departures.length > 0);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Paket Umroh</h1>
        <p className="mt-3 text-muted">
          Setiap paket menampilkan jarak hotel ke masjid dalam meter, tipe aksesnya, dan perkiraan
          waktu jalan kaki pada kecepatan jamaah lansia — sekitar 50 meter per menit. Angkanya bisa
          Anda cek sendiri di peta.
        </p>
        <p className="mt-2 text-sm text-muted">{DEMO_NOTICE}</p>
      </header>

      <KatalogClient
        rows={rows}
        bulanOptions={bulanTersedia(rows)}
        durasiOptions={durasiTersedia(rows)}
      />
    </main>
  );
}
