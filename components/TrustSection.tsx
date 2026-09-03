import { ExternalLink, ShieldCheck } from "lucide-react";
import { company } from "@/content/company";

/** Portal resmi Kemenag untuk mengecek izin PPIU/PIHK. */
export const URL_SIMPU = "https://simpu.kemenag.go.id";

export function TrustSection({ ringkas = false }: { ringkas?: boolean }) {
  return (
    <section
      aria-labelledby="trust-heading"
      className="rounded-card border border-hairline bg-surface p-6"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
        <div>
          <h2 id="trust-heading" className="text-xl">
            Cek legalitas kami, jangan percaya kata-kata saja
          </h2>
          <p className="mt-2 text-sm text-muted">
            Izin PPIU {company.licensePPIU} · Izin PIHK {company.licensePIHK}
          </p>
        </div>
      </div>

      <a
        href={URL_SIMPU}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary transition-colors hover:bg-secondary"
      >
        Cek di SISKOPATUH Kemenag
        <ExternalLink aria-hidden className="size-4" strokeWidth={1.75} />
      </a>

      <p className="mt-3 max-w-2xl text-sm text-muted">
        <strong className="font-semibold text-ink">Situs demo:</strong> nomor izin di atas sengaja
        dibuat tidak valid, jadi pencarian di SISKOPATUH tidak akan menemukannya. Pada situs klien
        yang sebenarnya, tombol ini mengantar Anda ke data izin yang asli. Kejujuran soal ini adalah
        bagian dari yang sedang kami tunjukkan.
      </p>

      {!ringkas && (
        <div className="mt-6 grid gap-6 border-t border-hairline pt-6 sm:grid-cols-2">
          <div>
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
          <h3 className="text-base">Cara memastikan situs ini bukan tiruan</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>Periksa alamat domain di bilah browser — tiruan biasanya menambah atau mengubah satu huruf.</li>
            <li>Cocokkan nomor izin di halaman ini dengan hasil pencarian di SISKOPATUH, bukan dengan gambar sertifikat yang dipasang di situs.</li>
            <li>Pastikan nama pemilik rekening adalah nama perusahaan, bukan nama orang.</li>
            <li>Curigai harga yang jauh di bawah pasaran. Selisih beberapa juta wajar; selisih belasan juta hampir selalu ada yang dikorbankan.</li>
          </ol>
        </div>
      )}
    </section>
  );
}
