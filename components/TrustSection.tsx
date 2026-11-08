import { ExternalLink, ShieldCheck } from "lucide-react";
import { company } from "@/content/company";

/** "Izin PPIU (contoh fiktif): DEMO-000 …" — never presented as a real approval. */
export const labelIzin = (jenis: "PPIU" | "PIHK") =>
  `Izin ${jenis} (contoh fiktif): ${jenis === "PPIU" ? company.licensePPIU : company.licensePIHK}`;

/** `tanpaKantor`: the page already shows the office address (Kontak), so only the account is repeated here. */
export function TrustSection({ ringkas = false, tanpaKantor = false }: { ringkas?: boolean; tanpaKantor?: boolean }) {
  return (
    <section
      id="legalitas"
      aria-labelledby="trust-heading"
      className="scroll-mt-24 rounded-card border border-hairline bg-surface p-6"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
        <div>
          <h2 id="trust-heading" className="text-xl">
            Cek legalitas kami, jangan percaya kata-kata saja
          </h2>
          <p className="mt-2 text-sm text-muted">
            {labelIzin("PPIU")} · {labelIzin("PIHK")}
          </p>
        </div>
      </div>

      {company.licenseCheckUrl ? (
        <a
          href={company.licenseCheckUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary transition-colors hover:bg-secondary"
        >
          Periksa izin di portal resmi
          <ExternalLink aria-hidden className="size-4" strokeWidth={1.75} />
        </a>
      ) : null}

      <p className="mt-3 max-w-2xl text-sm text-muted">
        <strong className="font-semibold text-ink">Situs demo:</strong> nomor izin di atas adalah contoh fiktif
        dan tidak terdaftar di mana pun. Travel sungguhan wajib memiliki izin resmi; nomornya dapat dicocokkan
        melalui kanal resmi {company.licenseAuthority}, bukan dari gambar sertifikat di situs.
      </p>

      {!ringkas && (
        <div className={`mt-6 grid gap-6 border-t border-hairline pt-6 ${tanpaKantor ? "" : "sm:grid-cols-2"}`}>
          <div className={tanpaKantor ? "hidden" : ""}>
            <h3 className="text-base">Kantor yang bisa didatangi</h3>
            <p className="mt-1.5 text-sm text-muted">
              {company.address.street}
              <br />
              {company.address.city} {company.address.postalCode}
            </p>
          </div>
          <div>
            <h3 className="text-base">Rekening resmi</h3>
            <p className="mt-1.5 text-sm text-muted">
              {company.bank.name} · {company.bank.accountNumber}
              <br />
              a.n. {company.bank.accountHolder}
            </p>
            <p className="mt-2 text-sm font-medium text-warning">
              Pembayaran hanya ke rekening atas nama perusahaan. Jangan menitipkan uang ke rekening
              pribadi siapa pun, termasuk yang mengaku agen kami.
            </p>
          </div>
        </div>
      )}

      {!ringkas && (
        <div className="mt-6 border-t border-hairline pt-6">
          <h3 className="text-base">Cara memastikan situs travel bukan tiruan</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>Periksa alamat domain di bilah browser — tiruan biasanya menambah atau mengubah satu huruf.</li>
            <li>Cocokkan nomor izin melalui kanal resmi {company.licenseAuthority}, bukan dengan gambar sertifikat yang dipasang di situs.</li>
            <li>Pastikan nama pemilik rekening adalah nama perusahaan, bukan nama orang.</li>
            <li>Curigai harga yang jauh di bawah pasaran. Selisih beberapa juta wajar; selisih belasan juta hampir selalu ada yang dikorbankan.</li>
          </ol>
        </div>
      )}
    </section>
  );
}
