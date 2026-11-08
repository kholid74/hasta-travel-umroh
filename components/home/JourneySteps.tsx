import { BookOpen, FileText, MessageCircle, Plane, Wallet } from "lucide-react";
import { PASSPORT_MIN_MONTHS } from "@/content/requirements";
import { Ornamen } from "./Motif";

/** Registration sequence. Terms are demo examples and say so. One short line per step. */
const LANGKAH = [
  { ikon: MessageCircle, judul: "Konsultasi", isi: "Ceritakan siapa yang berangkat dan kebutuhannya." },
  { ikon: Wallet, judul: "Uang muka", isi: "Contoh: Rp 5 juta, hanya ke rekening perusahaan." },
  { ikon: FileText, judul: "Dokumen", isi: `Paspor berlaku ≥ ${PASSPORT_MIN_MONTHS} bulan, foto, vaksin.` },
  { ikon: BookOpen, judul: "Manasik", isi: "Latihan tata cara Umrah dan pembagian perlengkapan." },
  { ikon: Plane, judul: "Pelunasan & berangkat", isi: "Contoh: lunas 40 hari sebelum keberangkatan." },
];

/**
 * Five-step timeline (PUBLIC-02A-R): vertical with a connector on mobile, horizontal on desktop.
 * The connector is drawn behind the icon discs, so it never runs under text.
 */
export function JourneySteps() {
  return (
    <section aria-labelledby="alur-judul" className="mx-auto w-full max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-28">
      <div className="max-w-[40rem]">
        <Ornamen className="text-gold-ink" />
        <h2 id="alur-judul" className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-[1.08]">Dari konsultasi sampai berangkat</h2>
        <p className="mt-4 text-muted">Contoh alur pendaftaran Umrah. Ketentuan sebenarnya dijelaskan tertulis sebelum Anda membayar.</p>
      </div>

      <ol className="relative mt-12 grid gap-0 lg:grid-cols-5 lg:gap-6">
        {/* Connector: vertical on mobile (left of the discs), horizontal on desktop (through their centres). */}
        <span aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-champagne lg:bottom-auto lg:left-[10%] lg:right-[10%] lg:top-6 lg:h-px lg:w-auto" />
        {LANGKAH.map(({ ikon: Ikon, judul, isi }, i) => (
          <li key={judul} className="relative grid grid-cols-[3rem_1fr] gap-x-4 pb-5 last:pb-0 lg:grid-cols-1 lg:justify-items-center lg:pb-0 lg:text-center">
            <span className="relative grid size-12 place-content-center rounded-full border border-champagne bg-paper text-emerald">
              <Ikon aria-hidden className="size-5" strokeWidth={1.6} />
            </span>
            <div className="pt-1 lg:pt-4">
              <p className="font-semibold">
                <span className="text-gold-ink tabular-nums">{i + 1}.</span> {judul}
              </p>
              <p className="mt-1 max-w-[16rem] text-sm text-muted">{isi}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
