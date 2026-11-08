import type { Metadata } from "next";
import { Building2, Clock, MessageCircleQuestion } from "lucide-react";
import { CatatanDemo, JudulBagian, PageIntro } from "@/components/public/ui";
import { TrustSection } from "@/components/TrustSection";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { company } from "@/content/company";
import { type WaContext, linkWa, pesanWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Konsultasi Umrah, Haji Khusus, dan pertanyaan lain lewat WhatsApp dengan pesan yang sudah membawa konteks, plus alamat kantor dan rekening resmi. Situs demo.",
};

type Jalur = { id: string; judul: string; untuk: string; context: WaContext; sumber: string; tombol: string };

const UTAMA: Jalur[] = [
  {
    id: "umrah",
    judul: "Konsultasi Umrah",
    untuk: "Memilih paket, tanggal, kota keberangkatan, dan tipe kamar.",
    context: { kind: "umum" },
    sumber: "kontak-umum",
    tombol: "Konsultasi Umrah",
  },
  {
    id: "haji",
    judul: "Konsultasi Haji Khusus",
    untuk: "Perkiraan masa tunggu, nomor porsi, setoran awal, dan skema cicilan.",
    context: { kind: "haji", kategori: "khusus" },
    sumber: "kontak-haji",
    tombol: "Konsultasi Haji Khusus",
  },
];

const LAIN: Jalur[] = [
  {
    id: "badal",
    judul: "Badal Umrah",
    untuk: "Dilaksanakan petugas di Makkah, tanpa keberangkatan jamaah dari Indonesia.",
    context: { kind: "badal" },
    sumber: "kontak-badal",
    tombol: "Tanya Badal Umrah",
  },
  {
    id: "lainnya",
    judul: "Pertanyaan lain",
    untuk: "Dokumen, pembayaran, atau hal lain yang belum ada di FAQ.",
    context: { kind: "lainnya" },
    sumber: "kontak-lainnya",
    tombol: "Kirim pertanyaan",
  },
];

/** The message the visitor is about to send, minus the demo footer line (shown separately). */
const isiPesan = (c: WaContext) => pesanWa(c).split("\n\n[")[0];

function KartuJalur({ j, utama }: { j: Jalur; utama: boolean }) {
  return (
    <article className={`flex flex-col rounded-card border border-hairline p-6 ${utama ? "bg-surface" : "bg-paper"}`} data-kontak-jalur={j.id}>
      <h3 className={utama ? "text-3xl leading-tight" : "text-2xl leading-tight"}>{j.judul}</h3>
      <p className="mt-2 text-muted">{j.untuk}</p>
      <details className="disclosure mt-4 border-t border-hairline">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 pt-3 text-sm font-semibold text-emerald [&::-webkit-details-marker]:hidden">
          Lihat isi pesan
        </summary>
        <p className="mt-2 whitespace-pre-line rounded-card bg-raised p-3 text-sm">{isiPesan(j.context)}</p>
      </details>
      <div className="mt-auto pt-5">
        <a
          href={linkWa(j.context)}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source={j.sumber}
          data-wa-audience="operator"
          className={
            utama
              ? "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-card bg-primary px-5 font-semibold text-onprimary hover:bg-primary-hover"
              : "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-card border border-forest/40 px-5 font-semibold text-forest hover:border-forest"
          }
        >
          <WhatsAppIcon className="size-5" />
          {j.tombol}
        </a>
      </div>
    </article>
  );
}

export default function KontakPage() {
  return (
    <main>
      <PageIntro
        judul={<>Hubungi <em className="italic text-primary">kami</em></>}
        lead={
          <p>
            Semua konsultasi berjalan lewat WhatsApp. Pilih topiknya, dan pesan Anda sudah membawa konteks sejak kalimat
            pertama, jadi tidak perlu menjelaskan ulang.
          </p>
        }
      >
        <CatatanDemo className="mt-5" wa />
      </PageIntro>

      <div className="band-light">
        <div className="mx-auto w-full max-w-[1200px] space-y-16 px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
          <section aria-labelledby="jalur-utama" data-sticky-hide>
            <h2 id="jalur-utama" className="sr-only">Pilih jenis konsultasi</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {UTAMA.map((j) => <KartuJalur key={j.id} j={j} utama />)}
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {LAIN.map((j) => <KartuJalur key={j.id} j={j} utama={false} />)}
            </div>
          </section>

          <section aria-labelledby="kantor" className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
            <JudulBagian id="kantor" judul="Kantor dan jam layanan" lead={<p>Alamat dan jam di bawah adalah contoh pada situs demo.</p>} />
            <ul className="divide-y divide-hairline border-y border-hairline">
              <li className="flex gap-4 py-5">
                <Building2 aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald" strokeWidth={1.6} />
                <p>
                  {company.address.street}
                  <br />
                  {company.address.city} {company.address.postalCode}
                </p>
              </li>
              <li className="flex gap-4 py-5">
                <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald" strokeWidth={1.6} />
                <p>
                  Senin sampai Jumat 09.00–17.00, Sabtu 09.00–14.00.
                  <span className="mt-1 block text-sm text-muted">
                    Boleh datang tanpa janji. Menghubungi lebih dulu lewat WhatsApp membuat kami bisa menyiapkan rincian paket
                    yang ingin Anda bandingkan.
                  </span>
                </p>
              </li>
              <li className="flex gap-4 py-5">
                <MessageCircleQuestion aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald" strokeWidth={1.6} />
                <p className="text-sm text-muted">
                  Pemilik travel yang ingin membuat situs seperti ini? Itu kontak terpisah milik {company.studio.name},
                  ada di <a href="#tentang-demo" className="font-semibold text-emerald underline underline-offset-4">panel demo di bagian bawah</a>,
                  bukan jalur konsultasi jamaah di atas.
                </p>
              </li>
            </ul>
          </section>

          <TrustSection tanpaKantor />
        </div>
      </div>
    </main>
  );
}
