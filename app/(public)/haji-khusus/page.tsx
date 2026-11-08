import type { Metadata } from "next";
import { Check, Hourglass, Plane, Wallet } from "lucide-react";
import { hotelMeta } from "@/components/HotelDistanceBadge";
import { CatatanDemo, JudulBagian, PageIntro, PenutupKonsultasi } from "@/components/public/ui";
import { TrustSection } from "@/components/TrustSection";
import { WaDemoNote } from "@/components/WaDemoNote";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { faqHaji, hajiPackages } from "@/content/haji";
import { fotoTendaMina } from "@/content/photos";
import { REQUIREMENT_NOTE, hajiKhususRequirements } from "@/content/requirements";
import type { HajiPackage } from "@/content/types";
import { dolar } from "@/lib/format";
import { linkWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Haji Khusus",
  description:
    "Haji Khusus dijelaskan apa adanya: nomor porsi, perkiraan masa tunggu, tahapan pembayaran, dan perbandingan program. Haji Mujamalah dijelaskan terpisah. Situs demo.",
};

const tombolUtama =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-primary px-6 font-semibold text-onprimary transition-colors hover:bg-primary-hover";

function Hotel({ kota, hotel }: { kota: string; hotel: HajiPackage["makkahHotel"] }) {
  return (
    <div>
      <dt className="text-xs text-muted">Hotel {kota}</dt>
      <dd className="mt-0.5">
        <span className="font-semibold">{hotel.name}</span>
        <span className="block text-sm text-muted">
          <span className="font-semibold text-ink tabular-nums">{hotel.distanceMeters} m</span> ke {hotel.landmark} · {hotelMeta(hotel)}
        </span>
      </dd>
    </div>
  );
}

/** One Haji Khusus programme, laid out so two cards side by side read as a comparison. */
function ProgramKhusus({ paket }: { paket: HajiPackage }) {
  return (
    <article className="flex flex-col rounded-card border border-hairline bg-surface p-6" data-haji-kategori="khusus" data-haji-program={paket.slug}>
      <h3 className="text-3xl leading-tight">{paket.name}</h3>
      <p className="mt-3 font-display text-4xl leading-none tabular-nums text-forest">{dolar(paket.priceUSD)}</p>
      <p className="mt-1 text-sm text-muted">per orang · setoran awal {dolar(paket.dpUSD)}</p>

      <dl className="mt-5 hidden grid-cols-2 gap-4 border-t border-hairline pt-5 md:grid">
        <div>
          <dt className="text-xs text-muted">Perkiraan masa tunggu</dt>
          <dd className="font-display text-2xl">± {paket.waitingYears} tahun*</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Perkiraan berangkat</dt>
          <dd className="font-display text-2xl tabular-nums">{paket.estimatedDepartureYear}*</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted">Lama di Tanah Suci</dt>
          <dd className="font-semibold">{paket.durationDays} hari</dd>
        </div>
      </dl>

      <dl className="mt-5 space-y-4 border-t border-hairline pt-5 text-sm">
        <Hotel kota="Makkah" hotel={paket.makkahHotel} />
        <Hotel kota="Madinah" hotel={paket.madinahHotel} />
      </dl>

      <p className="mt-5 border-t border-hairline pt-5 text-sm text-muted">
        <span className="font-semibold text-ink">Pembayaran:</span> {paket.installmentNote}
      </p>

      <details className="disclosure mt-5 border-t border-hairline" data-haji-rincian>
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 pt-4 font-semibold text-emerald [&::-webkit-details-marker]:hidden">
          Kuota dan fasilitas
        </summary>
        <p className="mt-3 text-sm text-muted"><span className="font-semibold text-ink">Soal kuota:</span> {paket.quotaNote}</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {paket.facilities.map((f) => (
            <li key={f} className="flex gap-2">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-auto pt-6">
        <a
          href={linkWa({ kind: "haji", namaPaket: paket.name, kategori: "khusus" })}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="haji-khusus"
          data-wa-audience="operator"
          className={`${tombolUtama} w-full`}
        >
          <WhatsAppIcon className="size-5" />
          Tanya program ini
        </a>
      </div>
    </article>
  );
}

/** Phones: the two programmes side by side in one small table, so they stay comparable on 360 px. */
function TabelBanding({ program }: { program: HajiPackage[] }) {
  const baris: [string, (p: HajiPackage) => string][] = [
    ["Biaya per orang", (p) => dolar(p.priceUSD)],
    ["Setoran awal", (p) => dolar(p.dpUSD)],
    ["Perkiraan masa tunggu", (p) => `± ${p.waitingYears} tahun*`],
    ["Perkiraan berangkat", (p) => `${p.estimatedDepartureYear}*`],
    ["Lama di Tanah Suci", (p) => `${p.durationDays} hari`],
    ["Hotel ke Masjidil Haram", (p) => `${p.makkahHotel.distanceMeters} m`],
  ];
  return (
    <table className="mt-6 w-full table-fixed overflow-hidden rounded-card border border-hairline bg-surface text-sm md:hidden" data-haji-banding>
      <caption className="sr-only">Perbandingan program Haji Khusus</caption>
      <thead>
        <tr className="border-b border-hairline">
          <th scope="col" className="w-[34%] px-2.5 py-3 text-left text-xs font-normal text-muted">Program</th>
          {program.map((p) => (
            <th key={p.id} scope="col" className="px-2.5 py-3 text-left font-display text-lg font-normal leading-tight">{p.name.replace("Haji Khusus ", "")}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {baris.map(([label, nilai]) => (
          <tr key={label} className="border-b border-hairline last:border-b-0">
            <th scope="row" className="px-2.5 py-3 text-left text-xs font-normal text-muted">{label}</th>
            {program.map((p) => <td key={p.id} className="whitespace-nowrap px-2.5 py-3 font-semibold tabular-nums">{nilai(p)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DI_HALAMAN_INI = [
  ["#alur", "Alur"],
  ["#program", "Program"],
  ["#syarat", "Syarat"],
  ["#tanya", "FAQ"],
  ["#mujamalah", "Mujamalah"],
];

export default function HajiKhususPage() {
  const khusus = hajiPackages.filter((p) => p.kategori === "khusus");
  const mujamalah = hajiPackages.filter((p) => p.kategori === "mujamalah");
  const setoran = khusus.map((p) => `${p.name.replace("Haji Khusus ", "")} ${dolar(p.dpUSD)}`).join(" · ");

  const alur = [
    { ikon: Wallet, judul: "Setoran awal & nomor porsi", isi: `Setoran awal mendaftarkan Anda ke antrean dan menerbitkan nomor porsi. Contoh setoran: ${setoran}.` },
    { ikon: Hourglass, judul: "Masa tunggu & cicilan", isi: "Selama menunggu, sisa biaya dicicil. Tahun berangkat mengikuti kuota yang ditetapkan setiap tahun." },
    { ikon: Plane, judul: "Pelunasan & keberangkatan", isi: "Pelunasan dilakukan pada tahun keberangkatan, disusul manasik dan persiapan dokumen." },
  ];

  return (
    <main>
      <PageIntro
        bentuk="lebar"
        foto={fotoTendaMina}
        posisiFoto="object-[50%_60%]"
        judul={<>Haji <em className="italic text-primary">Khusus</em></>}
        lead={
          <p>
            Berbeda dengan Umrah, Haji Khusus tidak dipesan per tanggal. Setelah setoran awal, Anda mendapat nomor porsi dan
            perkiraan tahun berangkat. Halaman ini menjelaskan alurnya, membandingkan program, dan menuliskan masa tunggu
            sebagai perkiraan, bukan janji.
          </p>
        }
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap" data-sticky-hide>
          <a href="#program" className={tombolUtama}>Bandingkan program</a>
          <a
            href={linkWa({ kind: "haji", kategori: "khusus" })}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-source="haji-intro"
            data-wa-audience="operator"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-ink/35 px-6 font-semibold hover:border-ink/70"
          >
            <WhatsAppIcon className="size-5" />
            Tanya masa tunggu
          </a>
        </div>
        <CatatanDemo className="mt-5" wa />
      </PageIntro>

      <div className="band-light">
        <div className="mx-auto w-full max-w-[1200px] space-y-16 px-4 pb-20 pt-8 sm:space-y-20 sm:px-6 sm:pt-12">
          <nav aria-label="Di halaman ini" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex gap-2 whitespace-nowrap">
              {DI_HALAMAN_INI.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="inline-flex min-h-11 items-center rounded-full border border-control bg-surface px-4 text-sm font-semibold hover:border-emerald">{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="alur-haji" id="alur" className="scroll-mt-6">
            <JudulBagian id="alur-haji" judul="Dari pendaftaran sampai berangkat" lead={<p>Tiga tahap Haji Khusus, termasuk kapan pembayaran dilakukan.</p>} />
            <ol className="relative mt-10 grid gap-0 md:grid-cols-3 md:gap-8">
              <span aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-champagne md:bottom-auto md:left-[16%] md:right-[16%] md:top-6 md:h-px md:w-auto" />
              {alur.map(({ ikon: Ikon, judul, isi }, i) => (
                <li key={judul} className="relative grid grid-cols-[3rem_1fr] gap-x-4 pb-6 last:pb-0 md:grid-cols-1 md:pb-0">
                  <span className="relative grid size-12 place-content-center rounded-full border border-champagne bg-paper text-emerald">
                    <Ikon aria-hidden className="size-5" strokeWidth={1.6} />
                  </span>
                  <div className="pt-1 md:pt-4">
                    <p className="font-semibold"><span className="text-gold-ink tabular-nums">{i + 1}.</span> {judul}</p>
                    <p className="mt-1 text-sm text-muted">{isi}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="program-haji-khusus" id="program" className="scroll-mt-6">
            <JudulBagian
              id="program-haji-khusus"
              judul="Bandingkan program Haji Khusus"
              lead={<p>Harga dalam dolar AS; nilai rupiah mengikuti kurs pada tanggal pembayaran dan dikonfirmasi saat konsultasi.</p>}
            />
            <TabelBanding program={khusus} />
            <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2">
              {khusus.map((p) => <ProgramKhusus key={p.id} paket={p} />)}
            </div>
            <p className="mt-4 max-w-[46rem] text-xs text-muted">
              * Perkiraan contoh pada situs demo; dapat berubah mengikuti kuota yang ditetapkan setiap tahun. Tidak ada travel
              yang bisa menjanjikan tahun keberangkatan.
            </p>
          </section>

          <section aria-labelledby="syarat-haji" id="syarat" className="scroll-mt-6">
            <JudulBagian id="syarat-haji" judul="Syarat pendaftaran" lead={<p className="text-sm">{REQUIREMENT_NOTE}</p>} />
            <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
              {hajiKhususRequirements.map((s) => (
                <li key={s} className="flex gap-2.5 rounded-card border border-hairline bg-surface px-4 py-3">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={2} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="faq-haji" id="tanya" className="scroll-mt-6">
            <JudulBagian id="faq-haji" judul="Pertanyaan tentang Haji Khusus" />
            <div className="mt-4 divide-y divide-hairline border-y border-hairline">
              {faqHaji.map((item) => (
                <details key={item.q} className="disclosure">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {item.q}
                  </summary>
                  <p className="max-w-[44rem] pb-5 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      {mujamalah.length > 0 && (
        <section aria-labelledby="haji-mujamalah" id="mujamalah" className="band-sand scroll-mt-6 border-y border-hairline">
          <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
            <div>
              <h2 id="haji-mujamalah" className="text-3xl sm:text-[2.5rem] sm:leading-[1.08]">Haji Mujamalah — jalur terpisah</h2>
              <p className="mt-4 max-w-[36rem]">
                Haji Mujamalah bukan Haji Khusus: tidak memakai nomor porsi, dan visanya diterbitkan atas undangan Pemerintah
                Arab Saudi. Kepastian visa baru diketahui menjelang musim haji.
              </p>
              <p className="mt-5 max-w-[36rem] rounded-card border border-warning/50 bg-paper p-4 text-sm" role="note">
                <span className="font-semibold">Contoh tampilan.</span> Ketersediaan layanan ini dan seluruh ketentuannya
                memerlukan konfirmasi operator travel sungguhan. Situs ini tidak menjanjikan kepastian visa.
              </p>
            </div>
            {mujamalah.map((p) => (
              <article key={p.id} className="rounded-card border border-hairline bg-paper p-6" data-haji-kategori="mujamalah">
                <h3 className="text-3xl leading-tight">{p.name}</h3>
                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-hairline pt-4">
                  <div><dt className="text-xs text-muted">Nomor porsi</dt><dd className="font-semibold">Tidak memerlukan</dd></div>
                  <div><dt className="text-xs text-muted">Rencana musim</dt><dd className="font-semibold tabular-nums">{p.estimatedDepartureYear}*</dd></div>
                  <div><dt className="text-xs text-muted">Biaya</dt><dd className="font-display text-2xl tabular-nums">{dolar(p.priceUSD)}</dd></div>
                  <div><dt className="text-xs text-muted">Uang muka</dt><dd className="font-display text-2xl tabular-nums">{dolar(p.dpUSD)}</dd></div>
                </dl>
                <p className="mt-2 text-xs text-muted">* Bergantung pada penerbitan visa oleh Pemerintah Arab Saudi; tidak dapat dijamin.</p>
                <div className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm text-muted">
                  <p><span className="font-semibold text-ink">Soal visa:</span> {p.quotaNote}</p>
                  <p><span className="font-semibold text-ink">Pembayaran:</span> {p.installmentNote}</p>
                </div>
                <a
                  href={linkWa({ kind: "haji", namaPaket: p.name, kategori: "mujamalah" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa-source="haji-mujamalah"
                  data-wa-audience="operator"
                  className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-card border border-forest/40 px-5 font-semibold text-forest hover:border-forest"
                >
                  <WhatsAppIcon className="size-5" />
                  Tanya ketersediaan & ketentuan
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="band-light">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6">
          <TrustSection />
        </div>
      </div>

      <PenutupKonsultasi
        judul="Ingin memperkirakan tahun keberangkatan Anda?"
        lead={<p>Tanyakan masa tunggu terkini, setoran awal, dan skema cicilan. Pesan WhatsApp sudah berisi pertanyaan dasarnya.</p>}
      >
        <a
          href={linkWa({ kind: "haji", kategori: "khusus" })}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="haji-penutup"
          data-wa-audience="operator"
          className={tombolUtama}
        >
          <WhatsAppIcon className="size-5" />
          Konsultasi Haji Khusus
        </a>
        <WaDemoNote className="mt-4" />
      </PenutupKonsultasi>
    </main>
  );
}
