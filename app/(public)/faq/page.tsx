import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CatatanDemo, PageIntro } from "@/components/public/ui";
import { WaDemoNote } from "@/components/WaDemoNote";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LABEL_TOPIK, type Topik, faq } from "@/content/faq";
import { linkWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang paling sering diajukan sebelum mendaftar Umrah: uang muka, pelunasan, pembatalan, dokumen, dan layanan. Situs demo.",
};

const URUTAN: Topik[] = ["pendaftaran", "pembayaran", "pembatalan", "dokumen", "layanan"];

export default function FaqPage() {
  const kelompok = URUTAN.map((topik) => ({ topik, isi: faq.filter((f) => f.topik === topik) })).filter((k) => k.isi.length > 0);
  return (
    <main>
      <PageIntro
        judul={<>Pertanyaan yang <em className="italic text-primary">sering diajukan</em></>}
        lead={<p>Jawaban singkat soal pendaftaran, pembayaran, pembatalan, dokumen, dan layanan, dengan angka dan ketentuannya.</p>}
      >
        <CatatanDemo className="mt-5" />
      </PageIntro>

      <div className="band-light">
        <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <nav aria-label="Topik pertanyaan">
              <p className="text-sm font-semibold">Topik</p>
              <ul className="mt-2 flex flex-wrap gap-2 lg:flex-col lg:gap-0">
                {kelompok.map(({ topik, isi }) => (
                  <li key={topik}>
                    <a
                      href={`#topik-${topik}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-control bg-surface px-3.5 text-sm font-semibold hover:border-emerald lg:w-full lg:justify-between lg:rounded-none lg:border-0 lg:border-b lg:border-hairline lg:bg-transparent lg:px-0"
                    >
                      {LABEL_TOPIK[topik]}
                      <span className="text-muted tabular-nums">{isi.length}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 hidden rounded-card border border-hairline bg-surface p-5 lg:block" data-sticky-hide>
              <p className="font-display text-xl leading-tight">Pertanyaan Anda belum ada di sini?</p>
              <a
                href={linkWa({ kind: "umum" })}
                target="_blank"
                rel="noopener noreferrer"
                data-wa-source="faq-samping"
                data-wa-audience="operator"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary hover:bg-primary-hover"
              >
                <WhatsAppIcon />
                Konsultasi
              </a>
            </div>
          </aside>

          <div className="min-w-0 space-y-12">
            {kelompok.map(({ topik, isi }) => (
              <section key={topik} aria-labelledby={`topik-${topik}`} className="scroll-mt-6">
                <h2 id={`topik-${topik}`} className="text-2xl sm:text-3xl">{LABEL_TOPIK[topik]}</h2>
                <div className="mt-3 divide-y divide-hairline border-y border-hairline">
                  {isi.map((item) => (
                    <details key={item.q} className="disclosure" data-faq>
                      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                        {item.q}
                      </summary>
                      <p className="max-w-[44rem] pb-5 text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <section aria-labelledby="faq-lanjut" className="rounded-card border border-hairline bg-surface p-6" data-sticky-hide>
              <h2 id="faq-lanjut" className="text-2xl">Pertanyaan Anda belum terjawab?</h2>
              <p className="mt-2 max-w-[40rem] text-muted">
                Kirim pertanyaannya lewat WhatsApp. Kalau menyangkut satu paket, buka halaman paketnya lalu tekan tombol
                konsultasi di sana: pesan Anda otomatis membawa nama paket dan tanggalnya.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={linkWa({ kind: "umum" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa-source="faq"
                  data-wa-audience="operator"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-primary px-5 font-semibold text-onprimary hover:bg-primary-hover"
                >
                  <WhatsAppIcon className="size-5" />
                  Konsultasi via WhatsApp
                </a>
                <Link href="/paket-umroh" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-forest/40 px-5 font-semibold text-forest hover:border-forest">
                  Lihat paket Umrah
                  <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                </Link>
              </div>
              <WaDemoNote className="mt-3" />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
