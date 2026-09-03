import type { Metadata } from "next";
import { DEMO_NOTICE } from "@/content/company";
import { LABEL_TOPIK, type Topik, faq } from "@/content/faq";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { linkWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang paling sering diajukan sebelum mendaftar umroh: uang muka, pelunasan, pembatalan, dan dokumen. Situs demo.",
};

const URUTAN: Topik[] = ["pendaftaran", "pembayaran", "pembatalan", "dokumen", "layanan"];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-3xl sm:text-4xl">Pertanyaan yang sering diajukan</h1>
        <p className="mt-3 text-muted">
          Pertanyaan yang paling sering kami terima sebelum jamaah mendaftar, dijawab dengan angka
          dan ketentuan, bukan dengan ajakan menghubungi admin.
        </p>
        <p className="mt-2 text-sm text-muted">{DEMO_NOTICE}</p>
      </header>

      <div className="mt-8 space-y-8">
        {URUTAN.map((topik) => {
          const isi = faq.filter((f) => f.topik === topik);
          if (isi.length === 0) return null;
          return (
            <section key={topik} aria-labelledby={`topik-${topik}`}>
              <h2 id={`topik-${topik}`} className="text-xl">
                {LABEL_TOPIK[topik]}
              </h2>
              <div className="mt-3 space-y-2">
                {isi.map((item) => (
                  <details key={item.q} className="rounded-card border border-hairline bg-surface">
                    <summary className="cursor-pointer list-none p-4 font-medium">{item.q}</summary>
                    <p className="px-4 pb-4 text-sm text-muted">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 rounded-card border border-hairline bg-surface p-6">
        <h2 className="text-xl">Pertanyaan Anda belum terjawab?</h2>
        <p className="mt-2 text-sm text-muted">
          Kirim pertanyaannya langsung. Kalau menyangkut satu paket tertentu, buka halaman paketnya
          lalu tekan tombol di sana — pesan Anda akan otomatis membawa nama paket dan tanggalnya.
        </p>
        <a
          href={linkWa({ kind: "umum" })}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="faq"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary"
        >
          <WhatsAppIcon />
          Tanya lainnya via WhatsApp
        </a>
      </div>
    </main>
  );
}
