import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { DetailClient } from "@/components/DetailClient";
import { HotelDistanceBadge, hotelMeta } from "@/components/HotelDistanceBadge";
import { TrustSection } from "@/components/TrustSection";
import { DEMO_NOTICE } from "@/content/company";
import { faqDetailPaket } from "@/content/faq";
import { packages, paketBySlug } from "@/content/packages";
import type { Hotel, PackageType } from "@/content/types";
import { menitJalan } from "@/lib/format";

const LABEL_TIPE: Record<PackageType, string> = {
  "umroh-reguler": "Umroh Reguler",
  "umroh-plus": "Umroh Plus",
  "umroh-ramadhan": "Umroh Ramadhan",
};

const PENJELASAN_RUTE: Record<Hotel["route"], string> = {
  direct: "Rute langsung menyusuri pelataran, tanpa menyeberang jalan raya.",
  underground: "Rute melewati terowongan atau basement yang terhubung ke pelataran masjid.",
  crossing: "Rute mengharuskan menyeberang jalan atau memutar lewat jembatan penyeberangan.",
};

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paket = paketBySlug(slug);
  if (!paket) return {};
  return {
    title: paket.name,
    description: `${paket.name}. Hotel Makkah ${paket.makkahHotel.name} berjarak ${paket.makkahHotel.distanceMeters} m dari Masjidil Haram, hotel Madinah ${paket.madinahHotel.name} berjarak ${paket.madinahHotel.distanceMeters} m dari Masjid Nabawi. Situs demo.`,
  };
}

function BlokHotel({ kota, hotel }: { kota: string; hotel: Hotel }) {
  return (
    <div className="rounded-card border border-hairline bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{kota}</p>
      <h3 className="mt-1 text-lg">{hotel.name}</h3>
      <div className="mt-3">
        <HotelDistanceBadge hotel={hotel} />
      </div>
      <p className="mt-2 text-sm text-muted">{hotelMeta(hotel)}</p>
      <ul className="mt-4 space-y-1.5 border-t border-hairline pt-4 text-sm text-muted">
        <li>
          <span className="font-medium text-ink">{hotel.distanceMeters} meter</span> ke{" "}
          {hotel.landmark}, diukur berjalan kaki ke pintu terdekat.
        </li>
        <li>
          <span className="font-medium text-ink">±{menitJalan(hotel.distanceMeters)} menit</span>{" "}
          pada kecepatan jalan santai jamaah lansia, sekitar 50 meter per menit. Jamaah yang lebih
          cepat akan tiba lebih awal dari angka ini.
        </li>
        <li>{PENJELASAN_RUTE[hotel.route]}</li>
        <li>
          {hotel.stepFree
            ? "Rute bebas tangga: bisa dilalui kursi roda dan koper tanpa harus diangkat."
            : "Rute memiliki tangga atau tanjakan. Untuk pengguna kursi roda, tanyakan lebih dulu sebelum memilih paket ini."}
        </li>
      </ul>
    </div>
  );
}

export default async function DetailPaketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paket = paketBySlug(slug);
  if (!paket) notFound();

  const hariIni = new Date().toISOString().slice(0, 10);
  const departures = paket.departures
    .filter((d) => d.date >= hariIni)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 pb-28 sm:px-6 sm:py-12 md:pb-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/paket-umroh" className="underline underline-offset-4 hover:text-primary">
          Paket Umroh
        </Link>
        <span aria-hidden> · </span>
        <span>{paket.name}</span>
      </nav>

      <header className="mt-4 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {LABEL_TIPE[paket.type]} · {paket.duration} hari
        </p>
        <h1 className="mt-1.5 text-3xl sm:text-4xl">{paket.name}</h1>
        <p className="mt-2 text-sm text-muted">{DEMO_NOTICE}</p>
      </header>

      <div className="mt-6">
        {departures.length > 0 ? (
          <DetailClient namaPaket={paket.name} hargaDasar={paket.price} departures={departures} />
        ) : (
          <p className="rounded-card border border-hairline bg-surface p-5 text-muted">
            Belum ada tanggal keberangkatan yang dijadwalkan untuk paket ini.
          </p>
        )}
      </div>

      <section aria-labelledby="hotel" className="mt-10">
        <h2 id="hotel" className="text-2xl">
          Hotel dan jarak ke masjid
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Angka di bawah bisa Anda cek sendiri di peta. Kami menuliskannya dalam meter karena
          &ldquo;dekat masjid&rdquo; berarti hal yang berbeda untuk orang yang berbeda — dan
          perbedaan 200 meter dengan 800 meter bisa menentukan seseorang sempat ikut shalat
          berjamaah atau tidak.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <BlokHotel kota="Makkah" hotel={paket.makkahHotel} />
          <BlokHotel kota="Madinah" hotel={paket.madinahHotel} />
        </div>
      </section>

      <section aria-labelledby="itinerary" className="mt-10">
        <h2 id="itinerary" className="text-2xl">
          Rencana perjalanan
        </h2>
        <ol className="mt-5 space-y-2">
          {paket.itinerary.map((hari) => (
            <li key={hari.day}>
              <details open className="rounded-card border border-hairline bg-surface">
                <summary className="flex cursor-pointer list-none items-baseline gap-3 p-4">
                  <span className="font-display text-sm font-semibold tabular-nums text-accent">
                    Hari {hari.day}
                  </span>
                  <span className="font-medium">{hari.title}</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted sm:pl-[5.5rem]">{hari.description}</p>
              </details>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="termasuk" className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-card border border-hairline bg-surface p-5">
          <h2 id="termasuk" className="text-lg">
            Sudah termasuk
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {paket.facilities.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card border border-hairline bg-surface p-5">
          <h2 className="text-lg">Belum termasuk</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {paket.exclusions.map((e) => (
              <li key={e} className="flex gap-2.5">
                <X aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={2} />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="syarat" className="mt-10">
        <h2 id="syarat" className="text-2xl">
          Syarat pendaftaran
        </h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {paket.requirements.map((s) => (
            <li key={s} className="rounded-card border border-hairline bg-surface px-4 py-3">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pembimbing" className="mt-10">
        <h2 id="pembimbing" className="text-2xl">
          Pembimbing
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Setiap rombongan didampingi satu pembimbing ibadah berbahasa Indonesia sejak manasik
          sampai kembali ke Tanah Air. Pada situs demo ini nama dan foto pembimbing sengaja tidak
          ditampilkan — data seperti itu akan terlihat seperti data asli, dan justru itu yang paling
          sering dipalsukan situs tiruan.
        </p>
      </section>

      <section aria-labelledby="faq" className="mt-10">
        <h2 id="faq" className="text-2xl">
          Pertanyaan yang paling sering diajukan
        </h2>
        <div className="mt-4 space-y-2">
          {faqDetailPaket.map((item) => (
            <details key={item.q} className="rounded-card border border-hairline bg-surface">
              <summary className="cursor-pointer list-none p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <TrustSection ringkas />
      </div>
    </main>
  );
}
