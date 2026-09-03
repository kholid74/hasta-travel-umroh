import { company } from "@/content/company";
import { tanggalPanjang } from "@/lib/format";

/**
 * Baris penutup yang menandai bahwa pesan datang dari situs demo, bukan dari
 * jamaah sungguhan. CTA paket tetap membawa konteks paket apa adanya — itu
 * fitur yang sedang didemonstrasikan.
 */
const PENUTUP_DEMO = `\n\n— Pesan ini dikirim dari situs demo ${company.name} (${company.studio.name})`;

export type WaContext =
  | { kind: "umum" }
  | { kind: "paket"; namaPaket: string; tanggal: string; kota: string }
  | { kind: "haji"; namaPaket?: string }
  | { kind: "badal" }
  | { kind: "studio" };

export function pesanWa(context: WaContext): string {
  switch (context.kind) {
    case "umum":
      return "Assalamualaikum, saya ingin tahu lebih lanjut soal paket Umroh & Haji." + PENUTUP_DEMO;
    case "paket":
      return (
        `Assalamualaikum, saya tertarik dengan ${context.namaPaket} keberangkatan ` +
        `${tanggalPanjang(context.tanggal)} dari ${context.kota}. Mohon informasi lengkapnya.` +
        PENUTUP_DEMO
      );
    case "haji":
      return (
        "Assalamualaikum, saya ingin tanya soal paket Haji Khusus" +
        (context.namaPaket ? ` ${context.namaPaket}` : "") +
        ", terutama masa tunggu dan skema pembayarannya." +
        PENUTUP_DEMO
      );
    case "badal":
      return "Assalamualaikum, saya ingin tanya soal layanan Badal Umroh." + PENUTUP_DEMO;
    case "studio":
      return `Halo ${company.studio.name}, saya ingin membuat website travel seperti demo ${company.name} ini.`;
  }
}

export function linkWa(context: WaContext): string {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(pesanWa(context))}`;
}
