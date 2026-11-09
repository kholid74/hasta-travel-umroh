import { company } from "@/content/company";
import { tanggalPanjang } from "@/lib/format";

/**
 * Two audiences use WhatsApp on this showcase (PUBLIC-01):
 *
 * A. "operator" — a prospective pilgrim contacting the (fictional) Hasta Travel. On this demo the
 *    destination is Kalsara Digital Studio's demonstration number, so every operator message ends
 *    with a line that says so plainly. No operator phone number is invented.
 * B. "studio"   — a business owner interested in Kalsara's software services.
 */
export const WA_DEMO_NOTE =
  "Demo: pesan dikirim ke nomor demonstrasi Kalsara Digital Studio, bukan ke biro perjalanan sungguhan.";

const PENUTUP_DEMO = `\n\n[Pesan contoh dari situs demo ${company.name}. Nomor tujuan adalah kontak demonstrasi ${company.studio.name}, bukan biro perjalanan umroh/haji.]`;

export type WaContext =
  | { kind: "umum"; referralCode?: string }
  | { kind: "paket"; namaPaket: string; tanggal: string; kota: string; referralCode?: string }
  | { kind: "haji"; namaPaket?: string; kategori?: "khusus" | "mujamalah"; referralCode?: string }
  | { kind: "badal"; referralCode?: string }
  | { kind: "lainnya"; referralCode?: string }
  | { kind: "studio" };

export type WaAudience = "operator" | "studio";
export const audienceOf = (context: WaContext): WaAudience => (context.kind === "studio" ? "studio" : "operator");

export function pesanWa(context: WaContext): string {
  const ref = "referralCode" in context && context.referralCode ? `\nKode referensi mitra: ${context.referralCode}` : "";
  switch (context.kind) {
    case "umum":
      return (
        "Assalamu'alaikum, saya ingin konsultasi paket Umrah.\n" +
        "Rencana berangkat (bulan): \nJumlah jamaah: \nKota keberangkatan: " +
        ref +
        PENUTUP_DEMO
      );
    case "paket":
      return (
        `Assalamu'alaikum, saya tertarik dengan ${context.namaPaket} keberangkatan ` +
        `${tanggalPanjang(context.tanggal)} dari ${context.kota}.\n` +
        "Tipe kamar (quad/triple/double): \nJumlah jamaah: \nMohon informasi lengkapnya." +
        ref +
        PENUTUP_DEMO
      );
    case "haji":
      // Haji Khusus is a queue (nomor porsi); Haji Mujamalah has no queue, so it never asks about waiting time.
      if (context.kategori === "mujamalah") {
        return (
          `Assalamu'alaikum, saya ingin bertanya tentang ${context.namaPaket ?? "Haji Mujamalah"}: ` +
          "ketersediaan, ketentuan pendaftaran, dan pengembalian dana bila visa tidak terbit." +
          ref +
          PENUTUP_DEMO
        );
      }
      return (
        `Assalamu'alaikum, saya ingin konsultasi ${context.namaPaket ?? "Haji Khusus"}: ` +
        "perkiraan masa tunggu, setoran awal, dan skema pelunasan." +
        ref +
        PENUTUP_DEMO
      );
    case "badal":
      return "Assalamu'alaikum, saya ingin bertanya tentang layanan Badal Umrah." + ref + PENUTUP_DEMO;
    case "lainnya":
      return "Assalamu'alaikum, saya ingin bertanya:\n" + ref + PENUTUP_DEMO;
    case "studio":
      return `Halo ${company.studio.name}, saya pemilik travel dan ingin membuat website serta sistem seperti demo ${company.name} ini.`;
  }
}

export function linkWa(context: WaContext): string {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(pesanWa(context))}`;
}

/** Generic consultation context for a public route (header button, mobile bar). */
export function consultContextForPath(pathname: string): WaContext {
  return pathname.startsWith("/haji-khusus") ? { kind: "haji", kategori: "khusus" } : { kind: "umum" };
}
