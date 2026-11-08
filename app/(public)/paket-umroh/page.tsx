import type { Metadata } from "next";
import { KatalogClient } from "@/components/KatalogClient";
import { CatatanDemo, PageIntro } from "@/components/public/ui";
import { packages } from "@/content/packages";
import { fotoKubahHijau } from "@/content/photos";
import { businessToday } from "@/lib/departures";
import { toRow } from "@/lib/katalog";

export const metadata: Metadata = {
  title: "Paket Umrah",
  description:
    "Katalog paket Umrah dengan jarak hotel ke Masjidil Haram dan Masjid Nabawi dalam meter, harga per tipe kamar, dan ketersediaan kursi per tanggal. Situs demo.",
};

// ISR: HTML dibangun ulang paling lama tiap jam; KatalogClient juga menyaring ulang di browser
// dengan tanggal Jakarta saat ini, sehingga cache tidak pernah menawarkan keberangkatan lampau.
export const revalidate = 3600;

export default function KatalogPage() {
  const hariIni = businessToday();
  const rows = packages.map((p) => toRow(p, hariIni)).filter((r) => r.departures.length > 0);

  return (
    <main>
      <PageIntro
        judul={<>Paket <em className="italic text-primary">Umrah</em></>}
        foto={fotoKubahHijau}
        posisiFoto="object-[62%_70%]"
        lead={
          <p>
            Bandingkan paket berdasarkan tanggal dan kota keberangkatan, jarak hotel ke masjid, dan harga untuk tiap tipe
            kamar. Tanggal yang sudah penuh tetap ditampilkan supaya Anda tahu pilihan sebenarnya.
          </p>
        }
      >
        <CatatanDemo className="mt-5" />
      </PageIntro>

      <div className="band-light">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
          <KatalogClient rows={rows} serverToday={hariIni} />
        </div>
      </div>
    </main>
  );
}
