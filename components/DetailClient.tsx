"use client";

import { useEffect, useState } from "react";
import { AirlineLogo } from "@/components/AirlineLogo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { Departure, OccupancyPrice } from "@/content/types";
import {
  LABEL_STATUS,
  hargaKeberangkatan,
  rupiah,
  rupiahSingkat,
  statusKeberangkatan,
  tanggalPanjang,
} from "@/lib/format";
import { linkWa } from "@/lib/whatsapp";

const LABEL_OKUPANSI: Record<keyof OccupancyPrice, string> = {
  quad: "Sekamar berempat (quad)",
  triple: "Sekamar bertiga (triple)",
  double: "Sekamar berdua (double)",
};

function Status({ seats }: { seats: number }) {
  const status = statusKeberangkatan(seats);
  const warna =
    status === "sold-out" ? "text-warning" : status === "limited" ? "text-accent" : "text-muted";
  return (
    <span className={`font-semibold ${warna}`}>
      {LABEL_STATUS[status]}
      {status !== "sold-out" && ` · sisa ${seats} seat`}
    </span>
  );
}

/**
 * Pemilih tanggal keberangkatan. Satu halaman kanonik per paket — tanggal cukup
 * mengubah harga, seat, maskapai, dan isi pesan WhatsApp, tanpa pindah halaman.
 */
export function DetailClient({
  namaPaket,
  hargaDasar,
  departures,
}: {
  namaPaket: string;
  hargaDasar: OccupancyPrice;
  departures: Departure[];
}) {
  const [dipilih, setDipilih] = useState<Departure>(departures[0]);

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    const cocok = departures.find((x) => x.date === d);
    // Menyelaraskan state dengan URL SETELAH hydration. Membacanya saat render
    // akan membuat HTML server berbeda dengan klien, padahal HTML server memang
    // harus berisi daftar penuh supaya bisa diindeks mesin pencari.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cocok) setDipilih(cocok);
  }, [departures]);

  function pilih(keberangkatan: Departure) {
    setDipilih(keberangkatan);
    window.history.replaceState(null, "", `?d=${keberangkatan.date}`);
  }

  const harga = hargaKeberangkatan({ price: hargaDasar }, dipilih);
  const wa = linkWa({
    kind: "paket",
    namaPaket,
    tanggal: dipilih.date,
    kota: dipilih.departureCity,
  });

  return (
    <>
      <section
        aria-labelledby="pilih-tanggal"
        className="rounded-card border border-hairline bg-surface p-5"
      >
        <h2 id="pilih-tanggal" className="text-lg">
          Pilih tanggal keberangkatan
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {departures.map((d) => {
            const aktif = d.id === dipilih.id;
            const habis = statusKeberangkatan(d.seatsAvailable) === "sold-out";
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => pilih(d)}
                aria-pressed={aktif}
                className={`min-h-11 rounded-card border px-3 text-sm ${
                  aktif
                    ? "border-primary bg-primary font-semibold text-onprimary"
                    : "border-hairline bg-surface"
                }`}
              >
                {tanggalPanjang(d.date)}
                <span className={aktif ? "text-onprimary/75" : "text-muted"}>
                  {" · "}
                  {d.departureCity}
                  {habis ? " · sold out" : ""}
                </span>
              </button>
            );
          })}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-hairline pt-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Keberangkatan</dt>
            <dd className="font-medium">{tanggalPanjang(dipilih.date)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Kota keberangkatan</dt>
            <dd className="font-medium">{dipilih.departureCity}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Maskapai</dt>
            <dd>
              <AirlineLogo airline={dipilih.airline} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Ketersediaan</dt>
            <dd>
              <Status seats={dipilih.seatsAvailable} />
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="harga"
        className="mt-6 rounded-card border border-hairline bg-surface p-5"
      >
        <h2 id="harga" className="text-lg">
          Harga per jamaah
        </h2>
        <p className="mt-1 text-sm text-muted">
          Harga berbeda menurut jumlah orang sekamar. Angka di bawah untuk keberangkatan{" "}
          {tanggalPanjang(dipilih.date)}.
        </p>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {(Object.keys(LABEL_OKUPANSI) as (keyof OccupancyPrice)[]).map((k) => (
              <tr key={k} className="border-t border-hairline first:border-t-0">
                <th scope="row" className="py-2.5 text-left font-normal">
                  {LABEL_OKUPANSI[k]}
                </th>
                <td className="py-2.5 text-right font-display text-lg font-semibold tabular-nums text-secondary">
                  {rupiah(harga[k])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="detail"
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-card bg-primary px-5 font-semibold text-onprimary transition-colors hover:bg-secondary sm:w-auto"
        >
          <WhatsAppIcon className="size-5" />
          Tanya paket ini via WhatsApp
        </a>
      </section>

      {/* CTA yang selalu terlihat di mobile — harga dan tanggal ikut terbawa. */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-hairline bg-surface px-4 py-3 md:hidden">
        <div>
          <p className="text-xs text-muted">{tanggalPanjang(dipilih.date)}</p>
          <p className="font-display text-lg font-semibold tabular-nums text-secondary">
            {rupiahSingkat(harga.quad)}
          </p>
        </div>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="sticky-mobile"
          className="inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary"
        >
          <WhatsAppIcon />
          Tanya paket ini
        </a>
      </div>
    </>
  );
}
