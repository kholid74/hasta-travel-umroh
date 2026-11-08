import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Footprints, Minus, Plane, Route, UsersRound } from "lucide-react";
import {
  DetailProvider, HargaKamar, HargaRingkas, PenutupDetail, PilihKeberangkatan, RingkasanPilihan, StickyDetail,
} from "@/components/DetailClient";
import { hotelMeta } from "@/components/HotelDistanceBadge";
import { CatatanDemo, JudulBagian, LABEL_TIPE, PageIntro, fotoPaket } from "@/components/public/ui";
import { TrustSection } from "@/components/TrustSection";
import { faqDetailPaket } from "@/content/faq";
import { packages, paketBySlug } from "@/content/packages";
import { REQUIREMENT_NOTE } from "@/content/requirements";
import type { Hotel, ItineraryDay } from "@/content/types";
import { businessToday } from "@/lib/departures";
import { KECEPATAN_JALAN_LANSIA, menitJalan } from "@/lib/format";

const PENJELASAN_RUTE: Record<Hotel["route"], string> = {
  direct: "Rute langsung menyusuri pelataran, tanpa menyeberang jalan raya.",
  underground: "Rute melewati terowongan atau basement yang terhubung ke pelataran masjid.",
  crossing: "Rute mengharuskan menyeberang jalan atau memutar lewat jembatan penyeberangan.",
};

// ISR: dibangun ulang paling lama tiap jam; DetailClient juga memeriksa tanggal di browser.
export const revalidate = 3600;

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const paket = paketBySlug(slug);
  if (!paket) return {};
  return {
    title: paket.name,
    description: `${paket.name}. Hotel Makkah ${paket.makkahHotel.name} berjarak ${paket.makkahHotel.distanceMeters} m dari Masjidil Haram, hotel Madinah ${paket.madinahHotel.name} berjarak ${paket.madinahHotel.distanceMeters} m dari Masjid Nabawi. Situs demo.`,
  };
}

/**
 * Groups the itinerary into travel stages (Madinah → Makkah → return) using the day titles. Every day
 * is kept; if the markers are missing (a custom itinerary), everything stays in one stage.
 */
function tahapPerjalanan(hari: ItineraryDay[]): { judul: string; hari: ItineraryDay[] }[] {
  const keMakkah = hari.findIndex((h) => /menuju Makkah/i.test(h.title));
  const pulang = hari.findIndex((h) => /^Kembali ke Tanah Air/i.test(h.title));
  if (keMakkah < 1 || pulang <= keMakkah) return [{ judul: "Seluruh perjalanan", hari }];
  return [
    { judul: "Berangkat dan Madinah", hari: hari.slice(0, keMakkah) },
    { judul: "Makkah dan ibadah Umrah", hari: hari.slice(keMakkah, pulang) },
    { judul: "Pulang ke Tanah Air", hari: hari.slice(pulang) },
  ];
}

function BlokHotel({ kota, hotel }: { kota: string; hotel: Hotel }) {
  return (
    <div className="rounded-card border border-hairline bg-surface p-5" data-hotel-kota={kota}>
      <p className="text-sm font-semibold text-emerald">{kota}</p>
      <h3 className="mt-1 text-2xl leading-tight">{hotel.name}</h3>
      <p className="mt-1 text-sm text-muted">{hotelMeta(hotel)}</p>
      <p className="mt-4 font-display text-5xl leading-none tabular-nums text-forest">
        {hotel.distanceMeters}<span className="ml-1 text-2xl">m</span>
      </p>
      <p className="mt-1 text-sm">ke {hotel.landmark}, diukur berjalan kaki ke pintu terdekat</p>
      <ul className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm text-muted">
        <li className="flex gap-2.5">
          <Footprints aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={1.75} />
          <span>
            <span className="font-semibold text-ink">±{menitJalan(hotel.distanceMeters)} menit</span> pada langkah jamaah lansia
            (sekitar {KECEPATAN_JALAN_LANSIA} meter per menit).
          </span>
        </li>
        <li className="flex gap-2.5">
          <Route aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={1.75} />
          <span>{PENJELASAN_RUTE[hotel.route]}</span>
        </li>
        <li className="flex gap-2.5">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={1.75} />
          <span>
            {hotel.stepFree
              ? "Bebas tangga: bisa dilalui kursi roda dan koper tanpa diangkat."
              : "Ada tangga atau tanjakan. Pengguna kursi roda sebaiknya bertanya dulu sebelum memilih paket ini."}
          </span>
        </li>
      </ul>
    </div>
  );
}

export default async function DetailPaketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paket = paketBySlug(slug);
  if (!paket) notFound();

  const hariIni = businessToday();
  // Semua tanggal dikirim ke klien agar tautan lama (?d=) bisa dijelaskan, bukan disembunyikan diam-diam.
  const semuaKeberangkatan = [...paket.departures].sort((a, b) => a.date.localeCompare(b.date));
  const tahap = tahapPerjalanan(paket.itinerary);

  return (
    <DetailProvider namaPaket={paket.name} hargaDasar={paket.price} departures={semuaKeberangkatan} serverToday={hariIni}>
      <main>
        <PageIntro
          bentuk="lebar"
          foto={fotoPaket(paket.id)}
          posisiFoto="object-[50%_45%]"
          remah={[{ href: "/paket-umroh", label: "Paket Umrah" }]}
          judul={paket.name}
          sesudahJudul={<p className="mt-2 text-muted">{LABEL_TIPE[paket.type]} · {paket.duration} hari</p>}
        >
          <dl className="mt-5 grid max-w-[46rem] grid-cols-2 gap-x-6 gap-y-3 border-t border-hairline pt-4 sm:mt-6 sm:grid-cols-4 sm:gap-y-4 sm:pt-5">
            <div>
              <dt className="text-xs text-muted">Durasi</dt>
              <dd className="font-display text-2xl">{paket.duration} hari</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Hotel ke Masjidil Haram</dt>
              <dd className="font-display text-2xl tabular-nums">{paket.makkahHotel.distanceMeters} m</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Hotel ke Masjid Nabawi</dt>
              <dd className="font-display text-2xl tabular-nums">{paket.madinahHotel.distanceMeters} m</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Mulai, per orang</dt>
              <dd className="font-display text-2xl text-primary"><HargaRingkas /></dd>
            </div>
          </dl>
          <CatatanDemo className="mt-5" />
        </PageIntro>

        <div className="band-light">
          <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0 space-y-16">
              <PilihKeberangkatan />
              <HargaKamar />

              <section aria-labelledby="hotel">
                <JudulBagian id="hotel" judul="Hotel dan jarak ke masjid" lead={<p>Angka ini bisa Anda cek sendiri di peta.</p>} />
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <BlokHotel kota="Makkah" hotel={paket.makkahHotel} />
                  <BlokHotel kota="Madinah" hotel={paket.madinahHotel} />
                </div>
              </section>

              <section aria-labelledby="termasuk">
                <JudulBagian id="termasuk" judul="Yang termasuk dan tidak" />
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-card border border-hairline bg-surface p-5">
                    <h3 className="text-xl">Sudah termasuk</h3>
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
                    <h3 className="text-xl">Belum termasuk</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {paket.exclusions.map((e) => (
                        <li key={e} className="flex gap-2.5">
                          <Minus aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={2} />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-5 flex gap-3 rounded-card border border-hairline bg-paper p-5 text-sm" id="pembimbing">
                  <UsersRound aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald" strokeWidth={1.6} />
                  <p className="text-muted">
                    <span className="font-semibold text-ink">Pembimbing.</span> Setiap rombongan didampingi satu pembimbing ibadah
                    berbahasa Indonesia sejak manasik sampai kembali ke Tanah Air. Nama dan foto pembimbing sengaja tidak
                    ditampilkan di situs demo ini, supaya tidak terlihat seperti data orang sungguhan.
                  </p>
                </div>
              </section>

              <section aria-labelledby="itinerary">
                <JudulBagian
                  id="itinerary"
                  judul="Rencana perjalanan"
                  lead={<p>{paket.itinerary.length} hari, dikelompokkan per tahap. Buka tahap untuk membaca rincian setiap hari.</p>}
                />
                <div className="mt-6 space-y-3" data-itinerary>
                  {tahap.map((t, i) => (
                    <details key={t.judul} open={i === 0} className="disclosure rounded-card border border-hairline bg-surface" data-tahap>
                      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                        <Plane aria-hidden className={`size-5 shrink-0 text-emerald ${i === tahap.length - 1 && tahap.length > 1 ? "rotate-180" : ""}`} strokeWidth={1.6} />
                        <span>
                          <span className="block font-semibold">{t.judul}</span>
                          <span className="block text-sm text-muted">
                            Hari {t.hari[0].day}{t.hari.length > 1 ? `–${t.hari.at(-1)!.day}` : ""} · {t.hari.length} hari
                          </span>
                        </span>
                      </summary>
                      <ol className="border-t border-hairline px-5 pb-2">
                        {t.hari.map((h) => (
                          <li key={h.day} className="grid grid-cols-[4.5rem_1fr] gap-x-3 border-b border-hairline py-4 last:border-b-0" data-hari={h.day}>
                            <span className="font-display text-lg tabular-nums text-gold-ink">Hari {h.day}</span>
                            <span>
                              <span className="block font-semibold">{h.title}</span>
                              <span className="mt-1 block text-sm text-muted">{h.description}</span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  ))}
                </div>
              </section>

              <section aria-labelledby="syarat">
                <JudulBagian id="syarat" judul="Syarat pendaftaran" lead={<p className="text-sm">{REQUIREMENT_NOTE}</p>} />
                <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
                  {paket.requirements.map((s) => (
                    <li key={s} className="flex gap-2.5 rounded-card border border-hairline bg-surface px-4 py-3">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={2} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="faq">
                <JudulBagian id="faq" judul="Pertanyaan yang sering diajukan" />
                <div className="mt-4 divide-y divide-hairline border-y border-hairline">
                  {faqDetailPaket.map((item) => (
                    <details key={item.q} className="disclosure">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                        {item.q}
                      </summary>
                      <p className="max-w-[44rem] pb-5 text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>

              <TrustSection ringkas />
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-6">
                <RingkasanPilihan />
              </div>
            </div>
          </div>
        </div>

        <PenutupDetail />
        <StickyDetail />
      </main>
    </DetailProvider>
  );
}
