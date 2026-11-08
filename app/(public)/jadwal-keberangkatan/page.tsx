import type { Metadata } from "next";
import { JadwalClient, type BarisJadwal } from "@/components/JadwalClient";
import { CatatanDemo, PageIntro } from "@/components/public/ui";
import { packages } from "@/content/packages";
import { businessToday, isOpenForRegistration } from "@/lib/departures";
import { hargaKeberangkatan } from "@/lib/format";

export const metadata: Metadata = {
  title: "Jadwal Keberangkatan",
  description:
    "Seluruh tanggal keberangkatan Umrah per bulan, bisa disaring menurut kota dan jenis paket, dibaca dari data yang sama dengan katalog. Situs demo.",
};

// ISR: dibangun ulang paling lama tiap jam; JadwalClient juga menyaring ulang di browser
// dengan tanggal Jakarta saat ini, jadi tanggal yang sudah lewat tidak pernah ditawarkan.
export const revalidate = 3600;

export default function JadwalPage() {
  const hariIni = businessToday();

  // Sumber datanya sama persis dengan katalog — halaman ini hanya tampilan lain.
  const baris: BarisJadwal[] = packages
    .flatMap((paket) =>
      paket.departures
        .filter((d) => isOpenForRegistration(d.date, hariIni))
        .map((d) => ({
          id: d.id,
          date: d.date,
          slug: paket.slug,
          namaPaket: paket.name,
          tipe: paket.type,
          durasi: paket.duration,
          departureCity: d.departureCity,
          airline: d.airline,
          seatsAvailable: d.seatsAvailable,
          jarakMakkah: paket.makkahHotel.distanceMeters,
          hargaQuad: hargaKeberangkatan(paket, d).quad,
        })),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <main>
      <PageIntro
        judul={<>Jadwal <em className="italic text-primary">keberangkatan</em></>}
        lead={<p>Semua tanggal Umrah yang masih bisa didaftar, per bulan. Pilih satu tanggal untuk melihat harga kamar dan konsultasi dengan tanggal itu.</p>}
      >
        <CatatanDemo className="mt-5" />
      </PageIntro>
      <div className="band-light">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
          <JadwalClient baris={baris} serverToday={hariIni} />
        </div>
      </div>
    </main>
  );
}
