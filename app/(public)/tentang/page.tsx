import type { Metadata } from "next";
import { Foto } from "@/components/Foto";
import { PenandaMeter } from "@/components/PenandaMeter";
import { TrustSection } from "@/components/TrustSection";
import { DEMO_NOTICE, company } from "@/content/company";
import { fotoNabawi } from "@/content/photos";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Profil, izin resmi dan cara memverifikasinya, serta alasan kami menuliskan jarak hotel dalam meter. Situs demo.",
};

export default function TentangPage() {
  return (
    <main className="mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-3xl sm:text-4xl">Tentang {company.name}</h1>
        <p className="mt-3 text-lg text-muted">
          {company.tagline} — {company.name} menemani perjalanan ibadah Anda menuju Baitullah,
          dengan persiapan yang matang dan layanan yang penuh perhatian.
        </p>
        <p className="mt-2 text-sm text-muted">{DEMO_NOTICE}</p>
      </header>

      <section aria-labelledby="kenapa" className="mt-10">
        <h2 id="kenapa" className="text-2xl">
          Kenapa kami menulis jarak dalam meter
        </h2>
        <p className="mt-3 text-muted">
          Hampir semua travel menulis &ldquo;hotel dekat Masjidil Haram&rdquo;. Masalahnya,
          &ldquo;dekat&rdquo; tidak punya satuan. Hotel 200 meter dan hotel 900 meter sama-sama bisa
          disebut dekat, padahal untuk jamaah berusia 70 tahun selisih itu menentukan ia masih
          sanggup kembali ke masjid untuk shalat berikutnya atau tidak.
        </p>
        <p className="mt-3 text-muted">
          Karena itu setiap paket di situs ini menuliskan jarak dalam meter, tipe rutenya, dan
          apakah rute itu bebas tangga. Waktu jalan kaki dihitung pada kecepatan jamaah lansia —
          sekitar 50 meter per menit — bukan kecepatan orang muda yang sedang buru-buru. Kalau angka
          kami terasa terlalu lambat untuk Anda, itu memang disengaja: melebihkan ke arah lambat
          adalah satu-satunya arah kesalahan yang tidak merugikan siapa pun.
        </p>
      </section>

      <div className="mt-8">
        <Foto foto={fotoNabawi} className="aspect-[4/3] w-full" />
      </div>

      <figure className="mt-8 rounded-card border border-hairline bg-surface p-6">
        <PenandaMeter />
        <figcaption className="mt-3 text-sm text-muted">
          Tiga hotel yang sama-sama bisa disebut “dekat masjid”. Selisihnya baru terlihat setelah
          jaraknya ditulis.
        </figcaption>
      </figure>

      <section aria-labelledby="apa-adanya" className="mt-10">
        <h2 id="apa-adanya" className="text-2xl">
          Apa yang kami tampilkan apa adanya
        </h2>
        <ul className="mt-3 space-y-2 text-muted">
          <li>Paket yang sudah penuh tetap ditampilkan dengan status Sold Out, tidak disembunyikan.</li>
          <li>Harga ditulis untuk tiga jenis okupansi kamar, bukan hanya angka termurah.</li>
          <li>Hotel yang jauh dari masjid ditulis jaraknya sama jelasnya dengan yang dekat.</li>
          <li>Nomor izin bisa dicek sendiri, bukan hanya dipajang sebagai gambar sertifikat.</li>
        </ul>
      </section>

      <section aria-labelledby="pembimbing" className="mt-10">
        <h2 id="pembimbing" className="text-2xl">
          Pembimbing
        </h2>
        <p className="mt-3 text-muted">
          Setiap rombongan didampingi pembimbing ibadah berbahasa Indonesia sejak manasik sampai
          kembali ke Tanah Air. Nama dan foto pembimbing sengaja tidak dicantumkan di situs demo
          ini: data semacam itu akan terlihat seperti data asli, sementara halaman ini bukan milik
          travel yang benar-benar ada.
        </p>
      </section>

      <div className="mt-10">
        <TrustSection />
      </div>
    </main>
  );
}
