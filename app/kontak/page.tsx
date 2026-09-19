import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { TrustSection } from "@/components/TrustSection";
import { DEMO_NOTICE, company } from "@/content/company";
import { linkWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Alamat kantor, WhatsApp, dan rekening resmi beserta peringatan anti-penitipan dana. Situs demo.",
};

const JALUR = [
  {
    judul: "Tanya paket umroh",
    keterangan: "Untuk pertanyaan umum soal paket, tanggal, dan harga.",
    context: { kind: "umum" } as const,
    sumber: "kontak-umum",
  },
  {
    judul: "Tanya Haji Khusus",
    keterangan: "Untuk masa tunggu, nomor porsi, dan skema pembayaran.",
    context: { kind: "haji" } as const,
    sumber: "kontak-haji",
  },
  {
    judul: "Tanya Badal Umroh",
    keterangan: "Badal dilaksanakan petugas di Makkah, tanpa keberangkatan dari Indonesia.",
    context: { kind: "badal" } as const,
    sumber: "kontak-badal",
  },
];

export default function KontakPage() {
  return (
    <main className="mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-3xl sm:text-4xl">Kontak</h1>
        <p className="mt-3 text-muted">
          Semua konsultasi berjalan lewat WhatsApp. Pilih jalur yang sesuai supaya pesan Anda sudah
          membawa konteksnya sejak kalimat pertama.
        </p>
        <p className="mt-2 text-sm text-muted">{DEMO_NOTICE}</p>
      </header>

      <div className="mt-8 space-y-3">
        {JALUR.map((j) => (
          <a
            key={j.judul}
            href={linkWa(j.context)}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-source={j.sumber}
            className="flex items-start gap-3 rounded-card border border-hairline bg-surface p-5 hover:border-primary"
          >
            <WhatsAppIcon className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <span className="block font-semibold">{j.judul}</span>
              <span className="mt-0.5 block text-sm text-muted">{j.keterangan}</span>
            </span>
          </a>
        ))}
      </div>

      <section aria-labelledby="kantor" className="mt-10 rounded-card border border-hairline bg-surface p-6">
        <h2 id="kantor" className="text-xl">
          Kantor (contoh)
        </h2>
        <p className="mt-2 text-muted">
          {company.address.street}
          <br />
          {company.address.city} {company.address.postalCode}
        </p>
        <p className="mt-3 text-sm text-muted">
          Jam kerja contoh: Senin sampai Jumat 09.00-17.00, Sabtu 09.00-14.00. Alamat ini fiktif,
          jadi tidak ada kantor yang bisa didatangi. Pada situs klien, bagian ini memuat alamat dan
          jam kerja yang sebenarnya.
        </p>
      </section>

      <div className="mt-6">
        <TrustSection />
      </div>
    </main>
  );
}
