"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { AirlineLogo } from "@/components/AirlineLogo";
import { StatusKursi, labelKursi, tanggalPendek } from "@/components/public/ui";
import { StickyBar } from "@/components/StickyBar";
import { WaDemoNote } from "@/components/WaDemoNote";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useBusinessToday } from "@/components/useBusinessToday";
import type { Departure, OccupancyPrice } from "@/content/types";
import { openDepartures, unavailableReason } from "@/lib/departures";
import { hargaKeberangkatan, rupiah, rupiahSingkat, statusKeberangkatan, tanggalPanjang } from "@/lib/format";
import { linkWa } from "@/lib/whatsapp";

const LABEL_OKUPANSI: Record<keyof OccupancyPrice, string> = {
  quad: "Kamar ber-4 (quad)",
  triple: "Kamar ber-3 (triple)",
  double: "Kamar ber-2 (double)",
};
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Pilihan = {
  namaPaket: string;
  open: Departure[];
  dipilih: Departure | undefined;
  harga: OccupancyPrice | undefined;
  penuh: boolean;
  wa: string;
  requested: string | null;
  reason: ReturnType<typeof unavailableReason> | "unknown" | null;
  pilih: (d: Departure) => void;
};

const Ctx = createContext<Pilihan | null>(null);
const usePilihan = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("DetailProvider missing");
  return v;
};

/**
 * Selected-departure state for a package page (PUBLIC-02B). One canonical page per package: the date
 * changes price, seats, airline and the WhatsApp text without leaving the page, and stays in `?d=`.
 *
 * PUBLIC-01 rules kept: only dates after today (Jakarta) can be selected. Old links with a past or
 * unknown `?d=` are explained, not silently redirected, and the nearest open date is offered.
 */
export function DetailProvider({
  namaPaket, hargaDasar, departures, serverToday, children,
}: {
  namaPaket: string;
  hargaDasar: OccupancyPrice;
  /** All departures of the package (including past ones), sorted by date. */
  departures: Departure[];
  serverToday: string;
  children: ReactNode;
}) {
  const today = useBusinessToday(serverToday);
  const open = useMemo(() => openDepartures(departures, today), [departures, today]);
  const [requested, setRequested] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Read ?d= after hydration so the server HTML (all dates) and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRequested(new URLSearchParams(window.location.search).get("d"));
  }, []);

  const fromUrl = requested ? open.find((x) => x.date === requested) : undefined;
  const reason = requested && !fromUrl ? (ISO_DATE.test(requested) ? unavailableReason(requested, departures, today) : "unknown") : null;
  const dipilih = open.find((x) => x.id === selectedId) ?? fromUrl ?? open[0];

  // Keep the URL pointing at the date actually shown, so a shared link stays valid.
  useEffect(() => {
    if (reason && dipilih) window.history.replaceState(null, "", `?d=${dipilih.date}`);
  }, [reason, dipilih]);

  const nilai: Pilihan = {
    namaPaket,
    open,
    dipilih,
    harga: dipilih ? hargaKeberangkatan({ price: hargaDasar }, dipilih) : undefined,
    penuh: dipilih ? statusKeberangkatan(dipilih.seatsAvailable) === "sold-out" : false,
    wa: dipilih
      ? linkWa({ kind: "paket", namaPaket, tanggal: dipilih.date, kota: dipilih.departureCity })
      : linkWa({ kind: "umum" }),
    requested,
    reason,
    pilih: (d) => {
      setSelectedId(d.id);
      setRequested(d.date);
      window.history.replaceState(null, "", `?d=${d.date}`);
    },
  };
  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>;
}

/** Short "from" price for the page intro; follows the selected date. */
export function HargaRingkas() {
  const { harga, dipilih } = usePilihan();
  if (!harga || !dipilih) return <span className="text-muted">Belum ada tanggal</span>;
  return <span className="tabular-nums">{rupiahSingkat(harga.quad)}</span>;
}

function Pemberitahuan() {
  const { reason, requested, dipilih } = usePilihan();
  if (!reason) return null;
  return (
    <div role="status" className="mb-5 rounded-card border border-warning/50 bg-paper p-4 text-sm" data-state="tanggal-tidak-tersedia">
      <p className="font-semibold">
        {reason === "past" && requested
          ? `Keberangkatan ${tanggalPanjang(requested)} sudah lewat dan tidak bisa didaftar lagi.`
          : requested && ISO_DATE.test(requested)
            ? `Tanggal ${tanggalPanjang(requested)} tidak ada dalam jadwal paket ini.`
            : "Tanggal pada tautan ini tidak dikenali."}
      </p>
      <p className="mt-1 text-muted">
        {dipilih
          ? `Kami menampilkan tanggal terdekat yang masih tersedia, ${tanggalPanjang(dipilih.date)}. Pilih tanggal lain di bawah atau `
          : "Saat ini belum ada tanggal lain untuk paket ini. "}
        <Link href="/jadwal-keberangkatan" className="font-semibold text-emerald underline underline-offset-4 hover:text-ink">
          lihat jadwal semua paket
        </Link>
        .
      </p>
    </div>
  );
}

/** Step 1: choose a departure. Sold-out dates stay visible (and selectable for browsing). */
export function PilihKeberangkatan() {
  const { open, dipilih, pilih, penuh } = usePilihan();

  if (!dipilih) {
    return (
      <section aria-labelledby="pilih-tanggal" className="scroll-mt-6" data-state="tanpa-tanggal">
        <Pemberitahuan />
        <h2 id="pilih-tanggal" className="text-2xl sm:text-3xl">Belum ada tanggal yang bisa didaftar</h2>
        <p className="mt-2 text-muted">
          Semua keberangkatan paket ini sudah lewat atau belum dijadwalkan. Lihat paket lain di{" "}
          <Link href="/jadwal-keberangkatan" className="font-semibold text-emerald underline underline-offset-4">jadwal keberangkatan</Link>, atau
          tanyakan rencana keberangkatan berikutnya.
        </p>
        <a
          href={linkWa({ kind: "umum" })}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="detail-tanpa-tanggal"
          data-wa-audience="operator"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-5 font-semibold text-onprimary"
        >
          <WhatsAppIcon className="size-5" />
          Tanya jadwal berikutnya
        </a>
        <WaDemoNote className="mt-2" />
      </section>
    );
  }

  const alternatif = open.filter((d) => d.id !== dipilih.id && statusKeberangkatan(d.seatsAvailable) !== "sold-out").slice(0, 2);

  return (
    <section aria-labelledby="pilih-tanggal" id="tanggal" className="scroll-mt-6">
      <Pemberitahuan />
      <h2 id="pilih-tanggal" className="text-2xl sm:text-3xl">Pilih keberangkatan</h2>
      <p className="mt-1 text-sm text-muted">{open.length} tanggal yang masih bisa dilihat. Harga dan kursi mengikuti tanggal yang dipilih.</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {open.map((d) => {
          const aktif = d.id === dipilih.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => pilih(d)}
              aria-pressed={aktif}
              className={`flex min-h-14 items-center justify-between gap-3 rounded-card border px-4 py-2.5 text-left transition-colors ${
                aktif ? "border-forest bg-forest text-ivory" : "border-control bg-surface hover:border-forest"
              }`}
            >
              <span>
                <span className="font-semibold tabular-nums">{tanggalPanjang(d.date)}</span>
                <span className={aktif ? "text-ivory/80" : "text-muted"}> · {d.departureCity}</span>
              </span>
              <span className={`shrink-0 text-sm font-semibold ${aktif ? "text-ivory" : statusKeberangkatan(d.seatsAvailable) === "available" ? "text-success" : "text-warning"}`}>
                {labelKursi(d.seatsAvailable)}
              </span>
            </button>
          );
        })}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-card border border-hairline bg-surface p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">Berangkat</dt>
          <dd className="font-semibold tabular-nums">{tanggalPanjang(dipilih.date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Dari</dt>
          <dd className="font-semibold">{dipilih.departureCity}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Maskapai</dt>
          <dd><AirlineLogo airline={dipilih.airline} /></dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Kursi</dt>
          <dd><StatusKursi seats={dipilih.seatsAvailable} /></dd>
        </div>
      </dl>

      {penuh && (
        <div className="mt-4 rounded-card border border-warning/50 bg-paper p-4 text-sm" data-state="tanggal-penuh">
          <p className="font-semibold">Keberangkatan {tanggalPanjang(dipilih.date)} sudah penuh.</p>
          <p className="mt-1 text-muted">
            Rincian paket tetap bisa Anda lihat, tetapi pendaftaran hanya untuk tanggal yang masih ada kursinya.
            {alternatif.length > 0 ? " Tanggal terdekat yang masih tersedia:" : " Saat ini tidak ada tanggal lain yang tersedia untuk paket ini."}
          </p>
          {alternatif.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {alternatif.map((d) => (
                <button key={d.id} type="button" onClick={() => pilih(d)} className="inline-flex min-h-11 items-center gap-1.5 rounded-card border border-emerald/40 px-3 font-semibold text-emerald hover:border-emerald">
                  {tanggalPanjang(d.date)} · {d.departureCity}
                  <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Step 2: room-type prices for the selected date. The action lives in the sidebar / sticky bar. */
export function HargaKamar() {
  const { harga, dipilih } = usePilihan();
  if (!harga || !dipilih) return null;
  return (
    <section aria-labelledby="harga" className="scroll-mt-6">
      <h2 id="harga" className="text-2xl sm:text-3xl">Harga per orang</h2>
      <p className="mt-1 text-sm text-muted">
        Untuk keberangkatan {tanggalPanjang(dipilih.date)}. Harga berbeda menurut jumlah orang sekamar.
      </p>
      <table className="mt-4 w-full overflow-hidden rounded-card border border-hairline bg-surface text-sm" data-tabel-harga>
        <tbody>
          {(Object.keys(LABEL_OKUPANSI) as (keyof OccupancyPrice)[]).map((k) => (
            <tr key={k} className="border-t border-hairline first:border-t-0">
              <th scope="row" className="px-4 py-3.5 text-left font-normal">{LABEL_OKUPANSI[k]}</th>
              <td className="px-4 py-3.5 text-right font-display text-xl tabular-nums text-forest" data-harga={k} data-nilai={harga[k]}>
                {rupiah(harga[k])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TombolKonsultasi({ sumber, className = "", ringkas = false }: { sumber: string; className?: string; ringkas?: boolean }) {
  const { wa, penuh } = usePilihan();
  return (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      data-wa-source={sumber}
      data-wa-audience="operator"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-primary px-5 font-semibold text-onprimary transition-colors hover:bg-primary-hover ${className}`}
    >
      <WhatsAppIcon className="size-5" />
      {penuh ? (ringkas ? "Tanggal lain" : "Tanya tanggal lain") : ringkas ? "Konsultasi" : "Konsultasi paket ini"}
    </a>
  );
}

/** Desktop sidebar (≥ 1024 px): selected departure, price and the page's one consultation action. */
export function RingkasanPilihan() {
  const { namaPaket, dipilih, harga } = usePilihan();
  if (!dipilih || !harga) return null;
  return (
    <aside aria-label="Ringkasan pilihan" className="rounded-card border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(23,33,28,0.06),0_12px_32px_-20px_rgba(23,33,28,0.35)]" data-ringkasan>
      <p className="font-display text-xl leading-tight">{namaPaket}</p>
      <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-muted">Berangkat</dt><dd className="font-semibold tabular-nums">{tanggalPanjang(dipilih.date)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">Dari</dt><dd className="font-semibold">{dipilih.departureCity}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">Kursi</dt><dd><StatusKursi seats={dipilih.seatsAvailable} /></dd></div>
      </dl>
      <div className="mt-4 border-t border-hairline pt-4">
        <p className="text-xs text-muted">Harga per orang · kamar ber-4</p>
        <p className="font-display text-4xl leading-tight tabular-nums text-forest" data-ringkasan-harga={harga.quad}>{rupiahSingkat(harga.quad)}</p>
        <p className="mt-1 text-xs text-muted tabular-nums">Ber-3 {rupiahSingkat(harga.triple)} · ber-2 {rupiahSingkat(harga.double)}</p>
      </div>
      <TombolKonsultasi sumber="detail" className="mt-5 w-full" />
      <WaDemoNote className="mt-2" />
      <a href="#tanggal" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-emerald underline underline-offset-4">
        Ganti tanggal
      </a>
    </aside>
  );
}

/** Mobile/tablet sticky action (< 1024 px): date, seats and price travel with the button. */
export function StickyDetail() {
  const { dipilih, harga } = usePilihan();
  if (!dipilih || !harga) return null;
  return (
    <StickyBar kind="detail" breakpoint="lg">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">
            {tanggalPendek(dipilih.date)} · {dipilih.departureCity} · <StatusKursi seats={dipilih.seatsAvailable} className="text-xs" />
          </p>
          <p className="font-display text-xl leading-tight tabular-nums" data-sticky-harga={harga.quad}>
            {rupiahSingkat(harga.quad)} <span className="font-sans text-xs text-muted">/orang · ber-4</span>
          </p>
        </div>
        <TombolKonsultasi sumber="sticky-mobile" ringkas className="min-h-11 shrink-0 px-4 text-sm" />
      </div>
    </StickyBar>
  );
}

/** Closing consultation band; the sticky bar hides while it is on screen (no duplicate actions). */
export function PenutupDetail() {
  const { dipilih } = usePilihan();
  return (
    <section aria-labelledby="penutup-detail" className="border-t border-hairline" data-sticky-hide>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <h2 id="penutup-detail" className="max-w-[22ch] text-3xl sm:text-5xl sm:leading-[1.05]">Masih ada yang ingin ditanyakan?</h2>
        <p className="mt-4 max-w-[36rem] text-ink/90">
          {dipilih
            ? `Pesan WhatsApp sudah berisi nama paket dan tanggal ${tanggalPanjang(dipilih.date)} dari ${dipilih.departureCity}. Sebutkan jumlah jamaah dan tipe kamar yang Anda inginkan.`
            : "Tanyakan rencana keberangkatan berikutnya untuk paket ini."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <TombolKonsultasi sumber="detail-penutup" />
          <Link href="/paket-umroh" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-ink/35 px-6 font-semibold hover:border-ink/70">
            Bandingkan paket lain
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </div>
        <WaDemoNote className="mt-4" />
      </div>
    </section>
  );
}
