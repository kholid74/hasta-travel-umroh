import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_NOTICE } from "@/content/company";
import { packages } from "@/content/packages";
import {
  LABEL_STATUS,
  bulanTahun,
  hargaKeberangkatan,
  rupiahSingkat,
  statusKeberangkatan,
  tanggalPanjang,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Jadwal Keberangkatan",
  description:
    "Seluruh tanggal keberangkatan umroh dikelompokkan per bulan, dibaca dari data yang sama dengan katalog paket. Situs demo.",
};

export default function JadwalPage() {
  const hariIni = new Date().toISOString().slice(0, 10);

  // Sumber datanya sama persis dengan katalog — halaman ini hanya tampilan lain.
  const baris = packages
    .flatMap((paket) =>
      paket.departures
        .filter((d) => d.date >= hariIni)
        .map((d) => ({ paket, keberangkatan: d })),
    )
    .sort((a, b) => a.keberangkatan.date.localeCompare(b.keberangkatan.date));

  const perBulan = new Map<string, typeof baris>();
  for (const b of baris) {
    const kunci = b.keberangkatan.date.slice(0, 7);
    perBulan.set(kunci, [...(perBulan.get(kunci) ?? []), b]);
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Jadwal Keberangkatan</h1>
        <p className="mt-3 text-muted">
          Seluruh {baris.length} tanggal keberangkatan yang dijadwalkan, termasuk yang sudah penuh.
          Daftar ini dibaca dari data yang sama dengan katalog paket, jadi tidak akan berbeda
          dengan yang Anda lihat di halaman paket.
        </p>
        <p className="mt-2 text-sm text-muted">{DEMO_NOTICE}</p>
      </header>

      {baris.length === 0 && (
        <div className="mt-8 rounded-card border border-hairline bg-surface p-8 text-center">
          <p className="font-display text-xl">Belum ada keberangkatan terjadwal</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Semua tanggal pada data demo ini sudah lewat. Tanyakan jadwal terbaru lewat WhatsApp.
          </p>
          <Link
            href="/kontak"
            className="mt-4 inline-flex min-h-11 items-center rounded-card bg-primary px-4 text-sm font-semibold text-onprimary"
          >
            Buka halaman kontak
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-8">
        {[...perBulan.entries()].map(([kunci, isi]) => (
          <section key={kunci} aria-labelledby={`bulan-${kunci}`}>
            <h2 id={`bulan-${kunci}`} className="text-xl">
              {bulanTahun(`${kunci}-01`)}
              <span className="ml-2 text-sm font-normal text-muted">
                {isi.length} keberangkatan
              </span>
            </h2>
            <ul className="mt-3 space-y-2">
              {isi.map(({ paket, keberangkatan }) => {
                const status = statusKeberangkatan(keberangkatan.seatsAvailable);
                const warna =
                  status === "sold-out"
                    ? "text-warning"
                    : status === "limited"
                      ? "text-accent"
                      : "text-muted";
                return (
                  <li
                    key={keberangkatan.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 rounded-card border border-hairline bg-surface px-4 py-3"
                  >
                    <div className="min-w-[16rem] flex-1">
                      <p className="font-medium tabular-nums">
                        {tanggalPanjang(keberangkatan.date)}
                      </p>
                      <Link
                        href={`/paket-umroh/${paket.slug}?d=${keberangkatan.date}`}
                        className="text-[15px] underline underline-offset-4 hover:text-primary"
                      >
                        {paket.name}
                      </Link>
                      <p className="text-[15px] text-muted">
                        {keberangkatan.departureCity} · {keberangkatan.airline} ·{" "}
                        {paket.makkahHotel.distanceMeters} m dari Masjidil Haram
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[15px] font-semibold ${warna}`}>
                        {LABEL_STATUS[status]}
                        {status !== "sold-out" && ` · sisa ${keberangkatan.seatsAvailable}`}
                      </p>
                      <p className="font-display text-lg font-semibold tabular-nums text-secondary">
                        {rupiahSingkat(hargaKeberangkatan(paket, keberangkatan).quad)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
