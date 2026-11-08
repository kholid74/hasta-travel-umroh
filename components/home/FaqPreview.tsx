import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { faq } from "@/content/faq";
import { Ornamen } from "./Motif";

const PILIHAN = [
  "Berapa uang muka untuk mengunci kursi?",
  "Ke rekening mana pembayaran dikirim?",
  "Kalau saya batal berangkat, apakah uang kembali?",
  "Bagaimana dengan jamaah lansia atau pengguna kursi roda?",
];

export function FaqPreview() {
  const items = PILIHAN.map((q) => faq.find((f) => f.q === q)).filter((f) => f !== undefined);
  return (
    <section aria-labelledby="faq-judul" className="mx-auto w-full max-w-[1200px] px-4 py-24 sm:px-6 sm:py-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <Ornamen className="text-gold-ink" />
          <h2 id="faq-judul" className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-[1.08]">Yang sering ditanyakan keluarga</h2>
          <Link href="/faq" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-emerald underline underline-offset-4 hover:text-ink">
            Semua pertanyaan
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </div>
        <div className="divide-y divide-hairline">
          {items.map((item) => (
            <details key={item.q} className="disclosure group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="max-w-[44rem] pb-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
